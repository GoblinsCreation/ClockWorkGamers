import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Globe, 
  X, 
  Minimize2, 
  Maximize2, 
  HeadphonesIcon,
  Users,
  UserPlus
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
];

interface ChatMessage {
  id: number;
  userId: number;
  username?: string;
  roomId: string;
  message: string;
  sentAt: string;
  type?: 'chat' | 'system' | 'user_joined' | 'user_left';
  translatedText?: string;
}

interface PrivateChat {
  userId: number;
  username: string;
  unreadCount: number;
  lastMessage?: string;
}

const FloatingChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('public');
  const [language, setLanguage] = useState('en');
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with the WebSocket server
      socket.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        username: user.username,
      }));
      
      // Load initial messages from API
      fetchMessages(currentRoom);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'chat') {
          // Add the received message to our state
          setMessages(prev => [...prev, {
            id: data.id,
            userId: data.userId,
            username: data.username,
            roomId: data.roomId || currentRoom,
            message: data.message,
            sentAt: data.timestamp,
            type: 'chat',
          }]);
          
          // If this is a private message, update the private chats list
          if (data.roomId.startsWith('private-')) {
            const senderId = data.userId;
            if (senderId !== user?.id) {
              updatePrivateChat(senderId, data.username, data.message);
            }
          }
        } 
        else if (data.type === 'system' || data.type === 'user_joined' || data.type === 'user_left') {
          // Add system messages
          setMessages(prev => [...prev, {
            id: Date.now(),
            userId: 0,
            roomId: currentRoom,
            message: data.message || 
              (data.type === 'user_joined' ? `${data.username} joined the chat` : 
               data.type === 'user_left' ? `${data.username} left the chat` : 
               'System message'),
            sentAt: data.timestamp,
            type: data.type,
          }]);
        }
        else if (data.type === 'translation') {
          // Update message with translation
          setMessages(prev => prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, translatedText: data.translatedText }
              : msg
          ));
        }
        else if (data.type === 'error') {
          toast({
            title: 'Chat Error',
            description: data.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to chat. Please try again later.',
        variant: 'destructive',
      });
      setIsConnected(false);
    };

    // Mock private chats for UI demonstration
    setPrivateChats([
      { userId: 2, username: 'Support', unreadCount: 0, lastMessage: 'How can we help you today?' },
      { userId: 3, username: 'GameMaster42', unreadCount: 2, lastMessage: 'Are you joining the tournament?' },
      { userId: 4, username: 'CryptoQueen', unreadCount: 0, lastMessage: 'Check out this new NFT!' },
    ]);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user, isOpen, currentRoom]);

  // Update private chat list
  const updatePrivateChat = (userId: number, username: string, lastMessage?: string) => {
    setPrivateChats(prev => {
      const existingChat = prev.find(chat => chat.userId === userId);
      
      if (existingChat) {
        // Update existing chat
        return prev.map(chat => 
          chat.userId === userId 
            ? { 
                ...chat, 
                lastMessage: lastMessage || chat.lastMessage,
                unreadCount: currentRoom === `private-${userId}` ? 0 : chat.unreadCount + 1
              }
            : chat
        );
      } else {
        // Add new chat
        return [...prev, {
          userId,
          username,
          unreadCount: 1,
          lastMessage
        }];
      }
    });
  };

  // Fetch messages from API
  const fetchMessages = async (roomId: string) => {
    try {
      const response = await apiRequest('GET', `/api/chat/${roomId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data.map(msg => ({
          ...msg,
          type: 'chat',
        })));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    }
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !isConnected || !socketRef.current) return;
    
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      roomId: currentRoom,
      message: message.trim(),
    }));
    
    setMessage('');
  };

  // Request translation
  const translateMessage = (messageId: number, originalText: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    socketRef.current.send(JSON.stringify({
      type: 'translate',
      messageId,
      originalText,
      targetLanguage: language,
    }));
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Change room handler
  const handleRoomChange = (value: string) => {
    if (value === 'private') {
      // Don't change room, just show the private chats tab
      return;
    }
    
    // If selecting a private chat with a user
    if (value.startsWith('user-')) {
      const userId = value.replace('user-', '');
      setSelectedUser(userId);
      const privateRoomId = `private-${userId}`;
      setCurrentRoom(privateRoomId);
      
      // Reset unread count for this chat
      setPrivateChats(prev => 
        prev.map(chat => 
          chat.userId === parseInt(userId) 
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
    } else {
      setCurrentRoom(value);
      setSelectedUser(null);
    }
    
    setMessages([]);
    fetchMessages(value);
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  // Toggle minimize
  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  // Get room title
  const getRoomTitle = () => {
    if (currentRoom === 'public') return 'Public Chat';
    if (currentRoom === 'support') return 'Support Chat';
    if (currentRoom.startsWith('private-')) {
      const userId = currentRoom.replace('private-', '');
      const chatUser = privateChats.find(chat => chat.userId === parseInt(userId));
      return chatUser ? `Chat with ${chatUser.username}` : 'Private Chat';
    }
    return 'Chat';
  };

  if (!user) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={toggleChat} className="rounded-full h-14 w-14 p-0 flex items-center justify-center shadow-lg bg-[hsl(var(--cwg-orange))] text-white hover:bg-[hsl(var(--cwg-orange))/90]">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className={`w-80 md:w-96 shadow-lg transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
          <CardHeader className="p-3 flex flex-row items-center justify-between border-b cursor-pointer" onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              {isConnected ? 'ClockWork Gamers Chat' : 'Chat (Disconnected)'}
              {isConnected ? (
                <Badge variant="outline" className="ml-2 bg-green-500 text-white text-xs py-0">Connected</Badge>
              ) : (
                <Badge variant="destructive" className="ml-2 text-xs py-0">Disconnected</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimize}>
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleChat}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <div className="h-[430px] flex flex-col">
                <div className="flex items-center justify-between px-3 py-1 bg-muted/50">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[90px] h-7 text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs font-medium">{getRoomTitle()}</span>
                </div>
                
                <Tabs defaultValue="public" value={currentRoom.startsWith('private-') ? 'private' : currentRoom} onValueChange={handleRoomChange} className="flex-1 flex flex-col">
                  <TabsList className="h-8 p-0 bg-background">
                    <TabsTrigger value="public" className="text-xs rounded-none h-full data-[state=active]:bg-muted/50">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </TabsTrigger>
                    <TabsTrigger value="support" className="text-xs rounded-none h-full data-[state=active]:bg-muted/50">
                      <HeadphonesIcon className="h-3 w-3 mr-1" />
                      Support
                    </TabsTrigger>
                    <TabsTrigger value="private" className="text-xs rounded-none h-full data-[state=active]:bg-muted/50">
                      <UserPlus className="h-3 w-3 mr-1" />
                      Private
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="public" className="flex-1 p-0 m-0">
                    <ChatMessages 
                      messages={messages} 
                      currentUser={user} 
                      language={language} 
                      translateMessage={translateMessage}
                      messagesEndRef={messagesEndRef}
                    />
                  </TabsContent>
                  
                  <TabsContent value="support" className="flex-1 p-0 m-0">
                    <ChatMessages 
                      messages={messages} 
                      currentUser={user} 
                      language={language} 
                      translateMessage={translateMessage}
                      messagesEndRef={messagesEndRef}
                    />
                  </TabsContent>
                  
                  <TabsContent value="private" className="flex-1 p-0 m-0">
                    {selectedUser ? (
                      <ChatMessages 
                        messages={messages} 
                        currentUser={user} 
                        language={language} 
                        translateMessage={translateMessage}
                        messagesEndRef={messagesEndRef}
                      />
                    ) : (
                      <div className="h-full overflow-auto">
                        <div className="p-2">
                          <h4 className="text-xs font-medium mb-2">Private Chats</h4>
                          {privateChats.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              No private chats yet
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {privateChats.map((chat) => (
                                <div 
                                  key={chat.userId}
                                  className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                                  onClick={() => handleRoomChange(`user-${chat.userId}`)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium truncate">{chat.username}</p>
                                      {chat.unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                                          {chat.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    {chat.lastMessage && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {chat.lastMessage}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <form onSubmit={handleSubmit} className="flex items-center gap-1 p-2 border-t">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!isConnected || currentRoom === 'private' || !user}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!isConnected || !message.trim() || currentRoom === 'private' || !user}
                    className="h-8 w-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </Card>
      ) : (
        <Button onClick={toggleChat} className="rounded-full h-14 w-14 p-0 flex items-center justify-center shadow-lg bg-[hsl(var(--cwg-orange))] text-white hover:bg-[hsl(var(--cwg-orange))/90]">
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUser: any;
  language: string;
  translateMessage: (messageId: number, originalText: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  currentUser, 
  language, 
  translateMessage,
  messagesEndRef 
}) => {
  return (
    <ScrollArea className="h-[330px]">
      <div className="p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            No messages yet
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div 
                key={`${msg.id}-${index}`} 
                className={`flex flex-col ${msg.type === 'system' || msg.type === 'user_joined' || msg.type === 'user_left' 
                  ? 'items-center' 
                  : msg.userId === currentUser?.id 
                    ? 'items-end' 
                    : 'items-start'}`}
              >
                {(msg.type === 'system' || msg.type === 'user_joined' || msg.type === 'user_left') ? (
                  <div className="text-xs text-muted-foreground bg-muted py-1 px-2 rounded">
                    {msg.message}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1 mb-0.5">
                      {msg.userId !== currentUser?.id && (
                        <div className="text-xs font-medium">{msg.username || 'Unknown User'}</div>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`max-w-[80%] ${msg.userId === currentUser?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary'} p-2 rounded-lg text-sm`}
                    >
                      <div>{msg.message}</div>
                      {msg.translatedText && language !== 'en' && (
                        <div className="mt-1 pt-1 border-t border-primary-foreground/20 text-xs">
                          {msg.translatedText}
                        </div>
                      )}
                    </div>
                    {msg.userId !== currentUser?.id && !msg.translatedText && language !== 'en' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs mt-0.5"
                        onClick={() => translateMessage(msg.id, msg.message)}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Translate
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default FloatingChat;