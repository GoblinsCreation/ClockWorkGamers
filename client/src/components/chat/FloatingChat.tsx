import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  MessageSquare, X, MinusSquare, Loader2, Send, Globe, 
  User, Users, Mail, PlusCircle, Menu, Settings, Search 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/components/translation/WebsiteTranslator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import './FloatingChat.css';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ChatCustomizationPanel, ChatCustomizationSettings } from './ChatCustomizationPanel';

interface Message {
  id?: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  translatedText?: string;
  roomId?: string;
  receiverId?: number;
}

interface Contact {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  gameIds?: string[];
  lastMessage?: string;
  unreadCount?: number;
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
  const [viewingProfile, setViewingProfile] = useState<Contact | null>(null);
  const [profileComments, setProfileComments] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  
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
  
  // View a user's profile
  const viewProfile = async (userId: number, username: string) => {
    if (userId === -1) return; // Don't view system profiles
    
    setLoadingProfile(true);
    try {
      // Fetch user profile
      const response = await apiRequest("GET", `/api/user/${userId}/profile`);
      const profile = await response.json();
      
      setViewingProfile({
        id: userId,
        username: username,
        displayName: profile.displayName || username,
        avatar: profile.avatar,
        gameIds: profile.games || [],
      });
      
      // Fetch profile comments
      const commentsResp = await apiRequest("GET", `/api/user/${userId}/comments`);
      const comments = await commentsResp.json();
      setProfileComments(Array.isArray(comments) ? comments : []);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast({
        title: 'Error',
        description: 'Could not load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };
  
  // Post a comment on someone's profile
  const postComment = async () => {
    if (!viewingProfile || !newComment.trim()) return;
    
    try {
      const response = await apiRequest("POST", `/api/user/${viewingProfile.id}/comments`, { 
        content: newComment 
      });
      const postedComment = await response.json();
      
      // Add to existing comments
      setProfileComments(prev => [...prev, postedComment]);
      setNewComment('');
      
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (err) {
      console.error("Error posting comment:", err);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    }
  };
  
  // Delete a comment from a profile
  const deleteComment = async (commentId: number) => {
    if (!viewingProfile) return;
    
    try {
      await apiRequest("DELETE", `/api/user/${viewingProfile.id}/comments/${commentId}`);
      
      // Remove from UI
      setProfileComments(prev => prev.filter(c => c.id !== commentId));
      
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

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
      {/* Profile Dialog */}
      <Dialog open={viewingProfile !== null} onOpenChange={(open) => !open && setViewingProfile(null)}>
        <DialogContent className="max-w-md">
          {loadingProfile ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewingProfile && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary">
                    {viewingProfile.avatar ? (
                      <AvatarImage src={viewingProfile.avatar} alt={viewingProfile.username} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {viewingProfile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{viewingProfile.displayName || viewingProfile.username}</DialogTitle>
                    <p className="text-sm text-muted-foreground">@{viewingProfile.username}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-1">Games</h4>
                <div className="flex flex-wrap gap-1 mb-4">
                  {viewingProfile.gameIds && viewingProfile.gameIds.length > 0 ? (
                    viewingProfile.gameIds.map((game, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {game}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No games added yet</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>Comments</span>
                  <span className="text-xs text-muted-foreground">{profileComments.length} total</span>
                </h4>
                
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {profileComments.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No comments yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {profileComments.map((comment) => (
                        <div key={comment.id} className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {comment.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{comment.username}</span>
                            </div>
                            
                            {comment.userId && viewingProfile && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => deleteComment(comment.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm mt-1 pl-8">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1 pl-8">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <form 
                    className="flex gap-2" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      postComment();
                    }}
                  >
                    <Input 
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!newComment.trim()}
                    >
                      Post
                    </Button>
                  </form>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                  <span 
                    className="message-sender" 
                    onClick={() => viewProfile(msg.userId, msg.username)}
                    style={{ cursor: 'pointer' }}
                  >
                    {msg.username}
                  </span>
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    public: [],
    support: [],
    private: []
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    public: false,
    support: false,
    private: false,
    contacts: false,
    search: false
  });
  
  // Chat customization settings
  const [chatSettings, setChatSettings] = useLocalStorage<ChatCustomizationSettings>(
    'cwg-chat-settings',
    {
      position: 'bottom-right',
      theme: 'default',
      soundEnabled: true,
      notificationsEnabled: true,
      transparency: 100,
      size: 'medium',
      fontStyle: 'default',
      autoTranslate: false,
      showUserAvatars: true,
      showTimestamps: true
    }
  );
  
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
        
        // Determine the reason for disconnection
        let disconnectReason = 'Lost connection to chat. Reconnecting...';
        
        // Check for common close codes
        if (event.code === 1000) {
          disconnectReason = 'Chat session ended normally.';
        } else if (event.code === 1001) {
          disconnectReason = 'Client navigated away from page.';
        } else if (event.code === 1006) {
          disconnectReason = 'Connection abnormally closed. Reconnecting...';
        } else if (event.code === 1011) {
          disconnectReason = 'Server encountered an unexpected error. Reconnecting...';
        }
        
        // Toast notification for disconnect if the chat is open
        if (isOpen) {
          toast({
            title: 'Chat Disconnected',
            description: disconnectReason,
            variant: 'destructive',
          });
        }
        
        // Don't attempt to reconnect for normal closure
        if (event.code === 1000) {
          setIsReconnecting(false);
          return;
        }
        
        // Attempt to reconnect after a delay, with increasing backoff
        // Initial 3s, then 6s, then max 10s
        const baseDelay = 3000;
        const attemptCount = reconnectTimeoutRef.current ? 2 : 1;
        const reconnectDelay = Math.min(baseDelay * attemptCount, 10000);
        
        console.log(`Attempting to reconnect in ${reconnectDelay/1000} seconds... (Attempt ${attemptCount})`);
        
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
        
        // The WebSocket is in a broken state, force a reconnection
        if (socketRef.current) {
          try {
            // Close with code 3000 (custom code for manual close after error)
            socketRef.current.close(3000, 'Closing due to error');
          } catch (e) {
            console.error('Error closing WebSocket after error:', e);
          }
        }
        
        // Attempt immediate reconnection
        setIsReconnecting(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
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
  
  // Fetch contacts for private messaging
  const fetchContacts = async () => {
    if (!user) return;
    
    setIsLoading(prev => ({ ...prev, contacts: true }));
    
    try {
      const response = await apiRequest("GET", "/api/user/contacts");
      const data = await response.json();
      
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: 'Error',
        description: 'Could not load your contacts.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, contacts: false }));
    }
  };
  
  // Search for users to start a new conversation
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, search: true }));
    
    try {
      const response = await apiRequest("GET", `/api/user/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: 'Error',
        description: 'Could not search for users.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(prev => ({ ...prev, search: false }));
    }
  };
  
  // Start a new conversation with a user
  const startConversation = async (contact: Contact) => {
    // Close the dialog and update selected contact
    setShowNewMessageDialog(false);
    setSelectedContact(contact);
    setActiveTab('private');
    
    // Create a direct message room ID
    const dmRoomId = `dm-${contact.id}`;
    
    // Fetch messages for this contact if they don't exist yet
    if (!messages[dmRoomId]) {
      fetchMessages(dmRoomId);
    }
  };
  
  // Handle sending a private message
  const handleSendPrivateMessage = (message: string) => {
    if (!selectedContact) return;
    
    const dmRoomId = `dm-${selectedContact.id}`;
    
    // Send message using the global handler but with the DM room ID
    handleSendMessage(message, dmRoomId);
  };
  
  // Load messages when active tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'private') {
        fetchContacts();
      } else if (!messages[activeTab]?.length) {
        fetchMessages(activeTab);
      }
    }
  }, [activeTab, isOpen]);

  // Apply chat settings to CSS variables
  const getChatPositionStyle = () => {
    // Get position from settings
    const { position } = chatSettings;
    
    // Default positions (can be expanded with more precise positioning)
    switch (position) {
      case 'bottom-right':
        return { bottom: '20px', right: '20px', top: 'auto', left: 'auto' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px', top: 'auto', right: 'auto' };
      case 'top-right':
        return { top: '20px', right: '20px', bottom: 'auto', left: 'auto' };
      case 'top-left':
        return { top: '20px', left: '20px', bottom: 'auto', right: 'auto' };
      default:
        return { bottom: '20px', right: '20px', top: 'auto', left: 'auto' };
    }
  };
  
  // Get CSS class based on theme
  const getChatThemeClass = () => {
    switch (chatSettings.theme) {
      case 'minimal': return 'chat-theme-minimal';
      case 'neon': return 'chat-theme-neon';
      default: return 'chat-theme-default';
    }
  };
  
  // Get CSS class based on size
  const getChatSizeClass = () => {
    switch (chatSettings.size) {
      case 'small': return 'chat-size-small';
      case 'large': return 'chat-size-large';
      default: return 'chat-size-medium';
    }
  };
  
  // Get CSS class based on font style
  const getChatFontClass = () => {
    switch (chatSettings.fontStyle) {
      case 'gaming': return 'chat-font-gaming';
      case 'futuristic': return 'chat-font-futuristic';
      case 'minimalist': return 'chat-font-minimalist';
      default: return 'chat-font-default';
    }
  };
  
  // Handle applying the chat settings
  const applySettings = (settings: ChatCustomizationSettings) => {
    setChatSettings(settings);
  };

  return (
    <div className="chat-widget">
      {/* Chat customization panel */}
      <ChatCustomizationPanel 
        isOpen={showCustomizationPanel}
        onClose={() => setShowCustomizationPanel(false)}
        onApplySettings={applySettings}
      />
      
      {!isOpen ? (
        <div 
          className="chat-button" 
          onClick={toggleChat}
          style={getChatPositionStyle()}
        >
          <MessageSquare className="h-5 w-5" />
        </div>
      ) : (
        <div 
          className={`chat-window ${isMinimized ? 'minimized' : ''} ${getChatThemeClass()} ${getChatSizeClass()} ${getChatFontClass()}`}
          style={{
            ...getChatPositionStyle(),
            '--chat-opacity': `${chatSettings.transparency}%`,
          } as React.CSSProperties}
        >
          <div className="chat-header" onClick={toggleMinimize}>
            <div className="chat-title">
              <MessageSquare className="h-4 w-4 mr-2" />
              {isMinimized ? 'Chat' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Chat`}
            </div>
            <div className="chat-header-actions">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0" 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setShowCustomizationPanel(true);
                }} 
                title="Customize Chat"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0" 
                onClick={toggleMinimize} 
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <MinusSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0" 
                onClick={toggleChat} 
                title="Close"
              >
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
                  <>
                    {/* New Message Dialog */}
                    <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>New Message</DialogTitle>
                          <DialogDescription>
                            Search for a user to start a conversation
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="grid flex-1 gap-2">
                            <Input
                              placeholder="Search by username..."
                              value={newMessageRecipient}
                              onChange={(e) => {
                                setNewMessageRecipient(e.target.value);
                                searchUsers(e.target.value);
                              }}
                              className="col-span-3"
                            />
                            
                            {isLoading.search ? (
                              <div className="flex justify-center p-4">
                                <Loader2 className="h-5 w-5 animate-spin" />
                              </div>
                            ) : searchResults.length > 0 ? (
                              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                                {searchResults.map((user) => (
                                  <div 
                                    key={user.id}
                                    className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                                    onClick={() => startConversation(user)}
                                  >
                                    <Avatar className="h-8 w-8">
                                      {user.avatar ? (
                                        <AvatarImage src={user.avatar} alt={user.username} />
                                      ) : (
                                        <AvatarFallback>
                                          {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{user.displayName || user.username}</p>
                                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : newMessageRecipient.length >= 3 ? (
                              <p className="text-sm text-muted-foreground p-2">No users found</p>
                            ) : newMessageRecipient.length > 0 ? (
                              <p className="text-sm text-muted-foreground p-2">Type at least 3 characters to search</p>
                            ) : null}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {selectedContact ? (
                      // Show selected conversation
                      <div className="flex flex-col h-full">
                        <div className="flex items-center p-2 border-b">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="mr-2" 
                            onClick={() => setSelectedContact(null)}
                          >
                            <span className="sr-only">Back</span>
                            <X className="h-4 w-4" />
                          </Button>
                          
                          <Avatar className="h-8 w-8 mr-2">
                            {selectedContact.avatar ? (
                              <AvatarImage src={selectedContact.avatar} alt={selectedContact.username} />
                            ) : (
                              <AvatarFallback>
                                {selectedContact.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">
                              {selectedContact.displayName || selectedContact.username}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              @{selectedContact.username}
                            </p>
                          </div>
                        </div>
                        
                        <ChatRoom 
                          roomId={`dm-${selectedContact.id}`}
                          messages={messages[`dm-${selectedContact.id}`] || []}
                          onSendMessage={handleSendPrivateMessage}
                          isLoading={isLoading[`dm-${selectedContact.id}`] || false}
                          isConnected={isConnected}
                          onReconnect={() => {
                            setIsReconnecting(true);
                            if (reconnectTimeoutRef.current) {
                              clearTimeout(reconnectTimeoutRef.current);
                            }
                            connectWebSocket();
                          }}
                        />
                      </div>
                    ) : (
                      // Show contacts list
                      <div className="flex flex-col h-full">
                        <div className="p-2 border-b flex justify-between items-center">
                          <h3 className="text-sm font-medium">Messages</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setShowNewMessageDialog(true)}
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only">New Message</span>
                          </Button>
                        </div>
                        
                        {isLoading.contacts ? (
                          <div className="flex justify-center items-center p-4 flex-1">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : contacts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <Mail className="h-10 w-10 text-muted mb-2" />
                            <h3 className="text-md font-semibold mb-1">No Messages Yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Start a conversation to see it here
                            </p>
                            <Button size="sm" onClick={() => setShowNewMessageDialog(true)}>
                              <PlusCircle className="h-4 w-4 mr-2" /> New Message
                            </Button>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto">
                            <div className="divide-y">
                              {contacts.map((contact) => (
                                <div 
                                  key={contact.id}
                                  className="chat-contact"
                                  onClick={() => startConversation(contact)}
                                >
                                  <Avatar className="h-10 w-10 mr-3">
                                    {contact.avatar ? (
                                      <AvatarImage src={contact.avatar} alt={contact.username} />
                                    ) : (
                                      <AvatarFallback>
                                        {contact.username.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  
                                  <div className="contact-info">
                                    <div className="flex justify-between">
                                      <span className="contact-name">
                                        {contact.displayName || contact.username}
                                      </span>
                                      {contact.unreadCount && contact.unreadCount > 0 && (
                                        <span className="unread-badge">{contact.unreadCount}</span>
                                      )}
                                    </div>
                                    
                                    <div className="contact-message">
                                      {contact.lastMessage || 'No messages yet'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
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