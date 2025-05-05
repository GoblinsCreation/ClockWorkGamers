import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, X, MinusSquare, Loader2, Send, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/components/translation/WebsiteTranslator';
import { apiRequest } from '@/lib/queryClient';
import './FloatingChat.css';

interface Message {
  id?: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  translatedText?: string;
}

interface ChatRoomProps {
  roomId: string;
  onSendMessage: (message: string, roomId: string) => void;
  messages: Message[];
  isLoading: boolean;
}

interface ChatRoomProps {
  roomId: string;
  onSendMessage: (message: string, roomId: string) => void;
  messages: Message[];
  isLoading: boolean;
  isConnected?: boolean;
  onReconnect?: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, onSendMessage, messages, isLoading, isConnected = true, onReconnect }) => {
  // Local state for reconnection animation
  const [isReconnectingLocal, setIsReconnectingLocal] = useState(false);
  
  // Handle reconnect click with local animation state
  const handleReconnect = () => {
    if (onReconnect) {
      setIsReconnectingLocal(true);
      onReconnect();
      // Reset animation after a timeout in case the onReconnect doesn't change parent state
      setTimeout(() => setIsReconnectingLocal(false), 5000);
    }
  };
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { translate, language } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      onSendMessage(newMessage, roomId);
      setNewMessage('');
    }
  };

  const translateMessage = async (message: Message) => {
    if (message.translatedText || language === 'en') return;
    
    try {
      const translatedText = await translate(message.message);
      // Update message with translated text in the local state
      message.translatedText = translatedText;
      // Force a re-render
      forceUpdate();
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Hack to force re-render when translations are updated
  const [, updateState] = useState({});
  const forceUpdate = () => updateState({});

  return (
    <div className="chat-body">
      <div className="chat-messages">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
            No messages yet in this room.
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`chat-message ${msg.userId === -1 ? 'system' : msg.userId === 0 ? 'incoming' : 'outgoing'}`}
            >
              {msg.userId !== -1 && (
                <div className="message-header">
                  <span className="message-sender">{msg.username}</span>
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className="message-content">
                {msg.message}
                {msg.translatedText && (
                  <div className="translated-text">
                    {msg.translatedText}
                  </div>
                )}
              </div>
              
              {language !== 'en' && !msg.translatedText && msg.userId !== -1 && (
                <button 
                  onClick={() => translateMessage(msg)} 
                  className="translate-button"
                >
                  <Globe className="h-3 w-3" /> Translate
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {!isConnected && onReconnect && (
        <div className="flex items-center justify-center p-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-900">
          <div className="flex-1 text-yellow-800 dark:text-yellow-300 text-sm">
            Connection lost. Messages may not be delivered.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReconnect} 
            className="ml-2 text-xs border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            <Loader2 className={`h-3 w-3 mr-1 ${isReconnectingLocal ? 'animate-spin' : ''}`} />
            Reconnect
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="chat-input">
        <textarea 
          className="input-field"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "Type your message..." : "Connection lost, attempting to reconnect..."}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          disabled={!isConnected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || !isConnected}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    public: [],
    support: [],
    private: []
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    public: false,
    support: false,
    private: false
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const fetchMessages = async (roomId: string) => {
    if (!roomId) return;
    
    setIsLoading(prev => ({ ...prev, [roomId]: true }));
    
    try {
      const response = await apiRequest("GET", `/api/chat/${roomId}`);
      const data = await response.json();
      
      setMessages(prev => ({
        ...prev,
        [roomId]: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error(`Error fetching messages for ${roomId}:`, error);
      toast({
        title: 'Error',
        description: `Could not load chat history for ${roomId}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const connectWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      // Clean up any existing socket
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Create a new WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Ensure we're connecting to the correct path
      // We need to use the full URL to ensure we connect properly on Replit
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      console.log('Connecting to WebSocket at:', wsUrl);
      
      socketRef.current = new WebSocket(wsUrl);
      
      // Setup WebSocket event handlers
      socketRef.current.onopen = () => {
        console.log('Connected to chat WebSocket successfully');
        
        // Update connection status
        setIsConnected(true);
        setIsReconnecting(false);
        
        // Clear any reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = undefined;
        }
        
        // Toast success if we were previously reconnecting
        if (isReconnecting && isOpen) {
          toast({
            title: 'Chat Connected',
            description: 'Successfully reconnected to chat.',
            variant: 'default',
          });
        }
        
        // Authenticate if user is logged in
        if (user) {
          console.log('Authenticating user:', user.username);
          socketRef.current?.send(JSON.stringify({
            type: 'auth',
            userId: user.id,
            username: user.username
          }));
        }
      };
      
      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'chat') {
          // Add the message to the appropriate room
          const roomId = data.roomId || 'public';
          
          setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), {
              id: data.id,
              userId: data.userId,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp
            }]
          }));
        } 
        else if (data.type === 'user_joined' || data.type === 'user_left') {
          // Add system message to all rooms
          const systemMessage = {
            userId: -1,  // Special ID for system messages
            username: 'System',
            message: data.type === 'user_joined' 
              ? `${data.username} has joined the chat`
              : `${data.username} has left the chat`,
            timestamp: data.timestamp
          };
          
          setMessages(prev => ({
            public: [...(prev.public || []), systemMessage],
            support: [...(prev.support || []), systemMessage],
            private: prev.private || []
          }));
        }
        else if (data.type === 'translation') {
          // Update a message with its translation
          const roomIds = Object.keys(messages);
          
          roomIds.forEach(roomId => {
            setMessages(prev => ({
              ...prev,
              [roomId]: prev[roomId].map(msg => 
                msg.id === data.messageId 
                  ? { ...msg, translatedText: data.translatedText }
                  : msg
              )
            }));
          });
        }
      };
      
      socketRef.current.onclose = (event) => {
        console.log('Disconnected from chat WebSocket', event.code, event.reason);
        
        // Update connection status
        setIsConnected(false);
        
        // Toast notification for disconnect if the chat is open
        if (isOpen) {
          toast({
            title: 'Chat Disconnected',
            description: 'Lost connection to chat. Reconnecting...',
            variant: 'destructive',
          });
        }
        
        // Attempt to reconnect after a delay, with increasing backoff
        const reconnectDelay = reconnectTimeoutRef.current ? 6000 : 3000;
        console.log(`Attempting to reconnect in ${reconnectDelay/1000} seconds...`);
        
        setIsReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, reconnectDelay);
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // Only show error toast if the chat is open
        if (isOpen) {
          toast({
            title: 'Chat Connection Error',
            description: 'There was an error with the chat connection. Trying to reconnect...',
            variant: 'destructive',
          });
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const handleSendMessage = (message: string, roomId: string = 'public') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to chat. Attempting to reconnect...',
        variant: 'destructive',
      });
      connectWebSocket();
      return;
    }
    
    // Make sure user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to send messages.',
        variant: 'destructive',
      });
      return;
    }
    
    // Send the message
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      roomId,
      message
    }));
    
    // Optimistically add the message to the local state
    const newMessage = {
      userId: user.id,
      username: user.username,
      message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage]
    }));
  };

  // Connect to WebSocket when component mounts
  useEffect(() => {
    connectWebSocket();
    
    // Load initial messages for the default room
    fetchMessages('public');
    
    return () => {
      // Close WebSocket connection when component unmounts
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Clear any reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  // Re-authenticate when user changes
  useEffect(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && user) {
      socketRef.current.send(JSON.stringify({
        type: 'auth',
        userId: user.id,
        username: user.username
      }));
    }
  }, [user]);
  
  // Load messages when active tab changes
  useEffect(() => {
    if (isOpen && !messages[activeTab]?.length) {
      fetchMessages(activeTab);
    }
  }, [activeTab, isOpen]);

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <div className="chat-button" onClick={toggleChat}>
          <MessageSquare className="h-5 w-5" />
        </div>
      ) : (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header" onClick={toggleMinimize}>
            <div className="chat-title">
              <MessageSquare className="h-4 w-4 mr-2" />
              {isMinimized ? 'Chat' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Chat`}
            </div>
            <div className="chat-header-actions">
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={toggleMinimize} title={isMinimized ? 'Expand' : 'Minimize'}>
                <MinusSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={toggleChat} title="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="chat-tabs">
                <TabsTrigger value="public" className={`chat-tab ${activeTab === 'public' ? 'active' : ''}`}>
                  Public
                </TabsTrigger>
                <TabsTrigger value="support" className={`chat-tab ${activeTab === 'support' ? 'active' : ''}`}>
                  Support
                </TabsTrigger>
                <TabsTrigger value="private" className={`chat-tab ${activeTab === 'private' ? 'active' : ''}`}>
                  Private
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="public" className="flex-1 p-0 m-0 h-full">
                <ChatRoom 
                  roomId="public"
                  messages={messages.public || []}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading.public}
                  isConnected={isConnected}
                  onReconnect={() => {
                    setIsReconnecting(true);
                    if (reconnectTimeoutRef.current) {
                      clearTimeout(reconnectTimeoutRef.current);
                    }
                    connectWebSocket();
                  }}
                />
              </TabsContent>
              
              <TabsContent value="support" className="flex-1 p-0 m-0 h-full">
                <ChatRoom 
                  roomId="support"
                  messages={messages.support || []}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading.support}
                  isConnected={isConnected}
                  onReconnect={() => {
                    setIsReconnecting(true);
                    if (reconnectTimeoutRef.current) {
                      clearTimeout(reconnectTimeoutRef.current);
                    }
                    connectWebSocket();
                  }}
                />
              </TabsContent>
              
              <TabsContent value="private" className="flex-1 p-0 m-0 h-full">
                {user ? (
                  <ChatRoom 
                    roomId="private"
                    messages={messages.private || []}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading.private}
                    isConnected={isConnected}
                    onReconnect={() => {
                      setIsReconnecting(true);
                      if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                      }
                      connectWebSocket();
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-muted mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Private Messaging</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Please sign in to access private messaging.
                    </p>
                    <Button variant="default" asChild>
                      <a href="/auth">Sign In</a>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChat;