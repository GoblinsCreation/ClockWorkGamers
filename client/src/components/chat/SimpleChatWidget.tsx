import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Settings, MinusSquare, Users, Send, PlusCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

import './SimpleChatWidget.css';

// Types
interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  avatar?: string;
  content: string;
  roomId: string;
  timestamp: string;
  isTranslated?: boolean;
  originalContent?: string;
  language?: string;
}

interface UserContact {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  lastMessage?: string;
  lastActivity?: string;
  unreadCount?: number;
}

interface SimpleChatWidgetProps {
  initialPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialTheme?: 'dark' | 'light' | 'neon' | 'cyberpunk';
}

// Main Component
export default function SimpleChatWidget({ 
  initialPosition = 'bottom-right',
  initialTheme = 'dark'
}: SimpleChatWidgetProps) {
  // User
  const { user } = useAuth();
  
  // Chat State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    public: [],
    support: [],
  });
  const [isLoading, setIsLoading] = useState({
    public: false,
    support: false,
    search: false,
    contacts: false,
  });
  
  // Contacts & Private Messages
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [searchResults, setSearchResults] = useState<UserContact[]>([]);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<UserContact | null>(null);
  
  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Chat Settings
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [chatPosition, setChatPosition] = useState<string>(initialPosition);
  const [chatTheme, setChatTheme] = useState<string>(initialTheme);
  
  // Message End Ref for Scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to chat WebSocket
  const connectWebSocket = () => {
    setIsLoading({ ...isLoading, public: true, support: true });
    
    // Simulate loading state for demo
    setTimeout(() => {
      setIsLoading({ ...isLoading, public: false, support: false });
      setIsConnected(true);
      
      // Add demo messages
      if (messages.public.length === 0) {
        setMessages({
          ...messages,
          public: [
            {
              id: 1,
              userId: 2,
              username: 'CryptoGamer',
              displayName: 'Crypto Gamer',
              avatar: '',
              content: 'Hey everyone! Anyone playing Axie Infinity today?',
              roomId: 'public',
              timestamp: new Date(Date.now() - 36 * 60000).toISOString(),
            },
            {
              id: 2,
              userId: 3,
              username: 'NFTCollector',
              displayName: 'NFT Collector',
              avatar: '',
              content: 'Just minted a new ClockWork Gamers NFT! Check it out in the marketplace!',
              roomId: 'public',
              timestamp: new Date(Date.now() - 21 * 60000).toISOString(),
            },
            {
              id: 3,
              userId: 4,
              username: 'GuildMaster',
              displayName: 'Guild Master',
              avatar: '',
              content: 'Welcome to all new members! Make sure to check out the achievement system.',
              roomId: 'public',
              timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
            },
          ],
          support: [
            {
              id: 101,
              userId: 99,
              username: 'Support',
              displayName: 'CWG Support',
              avatar: '',
              content: 'Welcome to ClockWork Gamers support! How can we help you today?',
              roomId: 'support',
              timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
            },
          ]
        });
      }
      
      // Add demo contacts
      if (contacts.length === 0) {
        setContacts([
          {
            id: 2,
            username: 'CryptoGamer',
            displayName: 'Crypto Gamer',
            lastMessage: 'Hey! Want to join our Axie team?',
            lastActivity: new Date(Date.now() - 60 * 60000).toISOString(),
            unreadCount: 1,
          },
          {
            id: 3,
            username: 'NFTCollector',
            displayName: 'NFT Collector',
            lastMessage: 'Thanks for the trade!',
            lastActivity: new Date(Date.now() - 120 * 60000).toISOString(),
            unreadCount: 0,
          },
        ]);
      }
    }, 1000);
  };

  // Fetch messages when component mounts
  useEffect(() => {
    if (user) {
      connectWebSocket();
      
      // Load private messages
      fetchContacts();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isMinimized, selectedContact]);
  
  // Load chat settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('cwg-chat-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.position) setChatPosition(settings.position);
        if (settings.theme) setChatTheme(settings.theme);
      } catch (e) {
        console.error('Error loading chat settings:', e);
      }
    }
  }, []);

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  // Toggle chat minimized/expanded
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Send a message
  const handleSendMessage = (roomId: string, message: string) => {
    if (!message.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now(),
      userId: user?.id || 0,
      username: user?.username || 'Anonymous',
      displayName: user?.fullName, // Using fullName as displayName
      avatar: '', // User avatar placeholder
      content: message,
      roomId,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
    
    setInputMessage('');
  };

  // Send a private message
  const handleSendPrivateMessage = (roomId: string, message: string) => {
    if (!message.trim() || !selectedContact) return;
    
    const dmRoomId = `dm-${selectedContact.id}`;
    const newMessage: ChatMessage = {
      id: Date.now(),
      userId: user?.id || 0,
      username: user?.username || 'Anonymous',
      displayName: user?.fullName, // Using fullName as displayName
      avatar: '', // User avatar placeholder
      content: message,
      roomId: dmRoomId,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => ({
      ...prev,
      [dmRoomId]: [...(prev[dmRoomId] || []), newMessage],
    }));
    
    setInputMessage('');
    
    // Update contact's last message for UI
    updateContactLastMessage(selectedContact.id, message);
  };

  // Update a contact's last message
  const updateContactLastMessage = (contactId: number, message: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, lastMessage: message, lastActivity: new Date().toISOString(), unreadCount: 0 }
          : contact
      )
    );
  };

  // Fetch user contacts
  const fetchContacts = () => {
    setIsLoading(prev => ({ ...prev, contacts: true }));
    
    // In a real application, you would fetch this from the API
    setTimeout(() => {
      setIsLoading(prev => ({ ...prev, contacts: false }));
    }, 1000);
  };

  // Search users for private messaging
  const searchUsers = (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(prev => ({ ...prev, search: true }));
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      const results = [
        {
          id: 5,
          username: 'SolanaGamer',
          displayName: 'Solana Gamer',
          avatar: '',
        },
        {
          id: 6,
          username: 'ETHTrader',
          displayName: 'ETH Trader',
          avatar: '',
        },
        {
          id: 7,
          username: 'GameExplorer',
          displayName: 'Game Explorer',
          avatar: '',
        },
      ].filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        (user.displayName && user.displayName.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
      setIsLoading(prev => ({ ...prev, search: false }));
    }, 500);
  };

  // Start a conversation with a user
  const startConversation = (contact: UserContact) => {
    setSelectedContact(contact);
    setShowNewMessageDialog(false);
    setNewMessageRecipient('');
    
    // Check if this contact already exists in contacts
    if (!contacts.some(c => c.id === contact.id)) {
      setContacts(prev => [...prev, contact]);
    }
    
    // Initialize empty message array for this contact if doesn't exist
    if (!messages[`dm-${contact.id}`]) {
      setMessages(prev => ({
        ...prev,
        [`dm-${contact.id}`]: [],
      }));
    }
  };

  // Apply chat settings
  const applyChatSettings = (settings: { position: string, theme: string }) => {
    setChatPosition(settings.position);
    setChatTheme(settings.theme);
    
    // Save to localStorage
    localStorage.setItem('cwg-chat-settings', JSON.stringify(settings));
    
    setShowCustomizationPanel(false);
  };

  // Get position class name based on selected position
  const getChatPositionClass = () => {
    switch (chatPosition) {
      case 'bottom-right': return 'position-bottom-right';
      case 'bottom-left': return 'position-bottom-left';
      case 'top-right': return 'position-top-right';
      case 'top-left': return 'position-top-left';
      default: return 'position-bottom-right';
    }
  };

  // Get theme class name based on selected theme
  const getChatThemeClass = () => {
    switch (chatTheme) {
      case 'dark': return 'theme-dark';
      case 'light': return 'theme-light';
      case 'neon': return 'theme-neon';
      case 'cyberpunk': return 'theme-cyberpunk';
      default: return 'theme-dark';
    }
  };

  // Render chat room (messages and input)
  const ChatRoom = ({ 
    roomId, 
    messages, 
    onSendMessage, 
    isLoading,
    isConnected,
    onReconnect,
  }: { 
    roomId: string; 
    messages: ChatMessage[]; 
    onSendMessage: (roomId: string, message: string) => void;
    isLoading: boolean;
    isConnected: boolean;
    onReconnect: () => void;
  }) => {
    return (
      <div className="chat-room">
        <div className="messages-container">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-muted-foreground mb-2">Disconnected from chat</p>
              <Button size="sm" onClick={onReconnect}>
                Reconnect
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-10 w-10 text-muted mb-2" />
              <h3 className="text-md font-semibold mb-1">No Messages Yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to send a message!
              </p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.userId === user?.id ? 'message-mine' : ''}`}
                >
                  <div className="message-avatar">
                    <Avatar className="h-8 w-8">
                      {message.avatar ? (
                        <AvatarImage src={message.avatar} alt={message.username} />
                      ) : (
                        <AvatarFallback>
                          {message.displayName
                            ? message.displayName.charAt(0).toUpperCase()
                            : message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-username">{message.displayName || message.username}</span>
                      <span className="message-time">
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="message-text">
                      {message.content}
                      {message.isTranslated && message.originalContent && (
                        <div className="message-translation-info">
                          <Badge variant="outline" className="text-xs">
                            Translated from {message.language}
                          </Badge>
                          <div className="message-original-content">
                            Original: {message.originalContent}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="messages-end" />
            </div>
          )}
        </div>
        
        <div className="message-input-container">
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (roomId.startsWith('dm-')) {
                  handleSendPrivateMessage(roomId, inputMessage);
                } else {
                  handleSendMessage(roomId, inputMessage);
                }
              }
            }}
            disabled={!isConnected}
            className="message-input"
          />
          <Button 
            className="send-button" 
            size="icon"
            onClick={() => {
              if (roomId.startsWith('dm-')) {
                handleSendPrivateMessage(roomId, inputMessage);
              } else {
                handleSendMessage(roomId, inputMessage);
              }
            }}
            disabled={!isConnected || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Chat Customization Panel Component
  function ChatCustomizationPanel({ 
    onClose,
    onApplySettings
  }: {
    onClose: () => void;
    onApplySettings: (settings: { position: string, theme: string }) => void;
  }) {
    const [position, setPosition] = useState(chatPosition);
    const [theme, setTheme] = useState(chatTheme);
    
    return (
      <div className="chat-customization-panel">
        <div className="panel-header">
          <h3>Chat Settings</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="panel-content">
          <div className="setting-section">
            <h4>Position</h4>
            <div className="position-options">
              <Button
                variant={position === 'bottom-right' ? 'default' : 'outline'}
                className="position-option"
                onClick={() => setPosition('bottom-right')}
              >
                Bottom Right
              </Button>
              <Button
                variant={position === 'bottom-left' ? 'default' : 'outline'}
                className="position-option"
                onClick={() => setPosition('bottom-left')}
              >
                Bottom Left
              </Button>
              <Button
                variant={position === 'top-right' ? 'default' : 'outline'}
                className="position-option"
                onClick={() => setPosition('top-right')}
              >
                Top Right
              </Button>
              <Button
                variant={position === 'top-left' ? 'default' : 'outline'}
                className="position-option"
                onClick={() => setPosition('top-left')}
              >
                Top Left
              </Button>
            </div>
          </div>
          
          <div className="setting-section">
            <h4>Theme</h4>
            <div className="theme-options">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="theme-option"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="theme-option"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'neon' ? 'default' : 'outline'}
                className="theme-option"
                onClick={() => setTheme('neon')}
              >
                Neon
              </Button>
              <Button
                variant={theme === 'cyberpunk' ? 'default' : 'outline'}
                className="theme-option"
                onClick={() => setTheme('cyberpunk')}
              >
                Cyberpunk
              </Button>
            </div>
          </div>
        </div>
        
        <div className="panel-footer">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onApplySettings({ position, theme })}
          >
            Apply Settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCustomizationPanel && (
        <ChatCustomizationPanel
          onClose={() => setShowCustomizationPanel(false)}
          onApplySettings={applyChatSettings}
        />
      )}
      
      {!isOpen ? (
        <div 
          className={`chat-button ${getChatPositionClass()}`}
          onClick={toggleChat}
        >
          <MessageSquare className="h-5 w-5" />
        </div>
      ) : (
        <div 
          className={`chat-window ${isMinimized ? 'minimized' : ''} ${getChatThemeClass()} ${getChatPositionClass()}`}
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
                          isLoading={false}
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
                                  <div className="flex items-start gap-3 p-3 hover:bg-muted cursor-pointer">
                                    <div className="relative">
                                      <Avatar className="h-10 w-10">
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar} alt={contact.username} />
                                        ) : (
                                          <AvatarFallback>
                                            {contact.username.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      {contact.unreadCount && contact.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                                          {contact.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-baseline">
                                        <h4 className="text-sm font-medium truncate">
                                          {contact.displayName || contact.username}
                                        </h4>
                                        {contact.lastActivity && (
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(contact.lastActivity), { addSuffix: true })}
                                          </span>
                                        )}
                                      </div>
                                      {contact.lastMessage && (
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                          {contact.lastMessage}
                                        </p>
                                      )}
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
                    <Users className="h-10 w-10 text-muted mb-2" />
                    <h3 className="text-md font-semibold mb-1">Sign In Required</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please sign in to use private messages
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </>
  );
}