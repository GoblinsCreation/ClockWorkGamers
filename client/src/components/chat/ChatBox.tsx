import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, Send, MessageSquare, Users } from 'lucide-react';
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

export default function ChatBox() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('public');
  const [language, setLanguage] = useState('en');
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

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

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user, currentRoom]);

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
    setCurrentRoom(value);
    setMessages([]);
    fetchMessages(value);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              ClockWork Gamers Chat
              {isConnected ? (
                <Badge variant="outline" className="ml-2 bg-green-500 text-white">Connected</Badge>
              ) : (
                <Badge variant="destructive" className="ml-2">Disconnected</Badge>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[120px]">
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
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="public" onValueChange={handleRoomChange}>
        <TabsList className="mx-4">
          <TabsTrigger value="public">
            <Globe className="h-4 w-4 mr-2" />
            Public
          </TabsTrigger>
          <TabsTrigger value="guild">
            <Users className="h-4 w-4 mr-2" />
            Guild
          </TabsTrigger>
          <TabsTrigger value="game">
            <MessageSquare className="h-4 w-4 mr-2" />
            Game
          </TabsTrigger>
        </TabsList>
        
        {["public", "guild", "game"].map(room => (
          <TabsContent key={room} value={room} className="m-0">
            <CardContent className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div 
                        key={`${msg.id}-${index}`} 
                        className={`flex flex-col ${msg.type === 'system' || msg.type === 'user_joined' || msg.type === 'user_left' 
                          ? 'items-center' 
                          : msg.userId === user?.id 
                            ? 'items-end' 
                            : 'items-start'}`}
                      >
                        {(msg.type === 'system' || msg.type === 'user_joined' || msg.type === 'user_left') ? (
                          <div className="text-xs text-muted-foreground bg-muted py-1 px-2 rounded">
                            {msg.message}
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              {msg.userId !== user?.id && (
                                <div className="text-sm font-medium">{msg.username || 'Unknown User'}</div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {new Date(msg.sentAt).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className={`max-w-[80%] ${msg.userId === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary'} p-3 rounded-lg`}
                            >
                              <div>{msg.message}</div>
                              {msg.translatedText && language !== 'en' && (
                                <div className="mt-1 pt-1 border-t border-primary-foreground/20 text-sm">
                                  {msg.translatedText}
                                </div>
                              )}
                            </div>
                            {msg.userId !== user?.id && !msg.translatedText && language !== 'en' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-1"
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
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!isConnected || !user}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="submit" 
                        disabled={!isConnected || !message.trim() || !user}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </form>
            </CardFooter>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}