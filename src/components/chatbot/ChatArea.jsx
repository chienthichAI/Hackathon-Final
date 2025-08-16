import React, { useState, useRef, useEffect, useCallback, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  Sparkles,
  BookOpen,
  Calendar,
  BarChart3,
  Search,
  Lightbulb,
  Plus,
  Settings,
  Copy,
  Download,
  Share2,
  Check,
  CheckCheck,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Star,
  Code,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useAutoScroll from '../../hooks/useAutoScroll';
import toast from 'react-hot-toast';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  conversationId,
  onNewConversation 
}) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Auto-scroll hook
  const { messagesEndRef, messagesContainerRef, scrollToBottom, forceScrollToBottom } = useAutoScroll(messages, {
    enabled: true,
    smooth: true,
    scrollOnMount: true,
    scrollOnNewMessage: true,
    delay: 100
  });

  // Force scroll to bottom when messages are first loaded
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        forceScrollToBottom();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages.length, forceScrollToBottom]);

  // Preload common language components
  useEffect(() => {
    const preloadLanguages = async () => {
      try {
        // Load the most commonly used languages
        await Promise.all([
          import('prismjs/components/prism-javascript'),
          import('prismjs/components/prism-python'),
          import('prismjs/components/prism-markup'),
          import('prismjs/components/prism-css'),
          import('prismjs/components/prism-json')
        ]);
      } catch (error) {
        console.warn('Failed to preload some language components:', error);
      }
    };
    
    preloadLanguages();
  }, []);

  // Highlight code blocks after rendering
  useEffect(() => {
    if (messages.length > 0) {
      // Use a small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        Prism.highlightAll();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Helper functions for message actions
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép vào clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Đã sao chép vào clipboard!');
    }
  };

  const handleCopyMessage = async (content) => {
    await copyToClipboard(content);
  };

  const handleDownloadMessage = async (content) => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `message_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Đã tải xuống tin nhắn!');
    } catch (error) {
      toast.error('Không thể tải xuống tin nhắn');
    }
  };

  const handleShareMessage = async (content) => {
    try {
      await navigator.share({
        title: 'FBot AI Message',
        text: content,
        url: window.location.href
      });
      toast.success('Đã chia sẻ tin nhắn!');
    } catch (error) {
      toast.error('Không thể chia sẻ tin nhắn');
    }
  };

  const handleReaction = (messageId, reactionType) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [reactionType]: (prev[messageId]?.[reactionType] || 0) + 1
      }
    }));
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    // Auto-send the quick action message
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'rag_agent':
        return <BookOpen className="w-4 h-4" />;
      case 'schedule_agent':
        return <Calendar className="w-4 h-4" />;
      case 'analytic_agent':
        return <BarChart3 className="w-4 h-4" />;
      case 'generic_agent':
        return <Search className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getAgentName = (agent) => {
    switch (agent) {
      case 'rag_agent':
        return 'Tư vấn giáo dục';
      case 'schedule_agent':
        return 'Quản lý công việc';
      case 'analytic_agent':
        return 'Phân tích hiệu suất';
      case 'generic_agent':
        return 'Tìm kiếm thông tin';
      default:
        return 'FBot AI';
    }
  };

  // Dynamic language component loading
  const loadLanguageComponent = useCallback(async (language) => {
    if (!Prism.languages[language]) {
      try {
        switch (language) {
          case 'javascript':
          case 'js':
            await import('prismjs/components/prism-javascript');
            break;
          case 'python':
          case 'py':
            await import('prismjs/components/prism-python');
            break;
          case 'java':
            await import('prismjs/components/prism-java');
            break;
          case 'cpp':
          case 'c++':
            await import('prismjs/components/prism-cpp');
            break;
          case 'css':
            await import('prismjs/components/prism-css');
            break;
          case 'html':
          case 'xml':
            await import('prismjs/components/prism-markup');
            break;
          case 'sql':
            await import('prismjs/components/prism-sql');
            break;
          case 'json':
            await import('prismjs/components/prism-json');
            break;
          case 'bash':
          case 'shell':
            await import('prismjs/components/prism-bash');
            break;
          case 'jsx':
            await import('prismjs/components/prism-jsx');
            break;
          case 'tsx':
          case 'typescript':
            await import('prismjs/components/prism-tsx');
            break;
          default:
            // For unknown languages, use markup as fallback
            if (!Prism.languages.markup) {
              await import('prismjs/components/prism-markup');
            }
            break;
        }
      } catch (error) {
        console.warn(`Failed to load language component for ${language}:`, error);
      }
    }
  }, []);

  // Enhanced message formatting with code highlighting and markdown
  const formatMessageContent = useCallback((content) => {
    if (!content) return [];
    
    // Split content into parts (text, code blocks, inline code)
    const parts = [];
    let currentIndex = 0;
    
    // Match code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];
      const startIndex = match.index;
      
      // Load language component if needed (fire and forget)
      loadLanguageComponent(language);
      
      // Add text before code block
      if (startIndex > currentIndex) {
        parts.push({
          type: 'text',
          content: content.slice(currentIndex, startIndex)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language,
        content: code
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }
    
    return parts;
  });

  // Render formatted message content
  const renderMessageContent = useCallback((content) => {
    // Ensure content is a string
    const safeContent = typeof content === 'string' ? content : String(content || '');
    
    if (!safeContent) return null;
    
    const parts = formatMessageContent(safeContent);
    
    // If no parts, return the content as plain text
    if (!parts || parts.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: formatText(safeContent) }} />;
    }
    
    return parts.map((part, index) => {
      if (part.type === 'text') {
        return (
          <span key={index} dangerouslySetInnerHTML={{ __html: formatText(part.content) }} />
        );
      } else if (part.type === 'code') {
        return (
          <div key={index} className="relative my-4">
            <div className="flex justify-between items-center bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg border-b border-gray-700 text-xs font-medium">
              <span className="capitalize">{part.language || 'text'}</span>
              <button
                onClick={() => copyToClipboard(typeof part.content === 'string' ? part.content : String(part.content || ''))}
                className="hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-b-lg overflow-x-auto font-mono text-sm leading-relaxed">
              <code className={`language-${part.language || 'text'}`}>
                {part.content}
              </code>
            </pre>
          </div>
        );
      }
      return null;
    });
  });

  // Format text with markdown support and clickable links
  const formatText = (text) => {
    if (!text) return '';
    
    // Bold: **text** -> <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code: `code` -> <code>code</code>
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>');
    
    // Links: [text](url) -> <a href="url">text</a>
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Raw URLs: Convert plain URLs to clickable links
    text = text.replace(/(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br />');
    
    return text;
  };

  // Filter messages based on search and remove duplicates
  const filteredMessages = useMemo(() => {
    // Remove duplicate messages based on ID, content, and timestamp
    const uniqueMessages = messages.filter((message, index, self) => {
      const firstIndex = self.findIndex(m => {
        // Check if it's the same message (same ID or same content + type + recent timestamp)
        return m.id === message.id || 
               (m.content === message.content && 
                m.type === message.type && 
                Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 1000); // Within 1 second
      });
      return index === firstIndex;
    });
    
    // Apply search filter and ensure all messages have valid content
    return uniqueMessages.filter(message => {
      // Ensure message.content is a string and not an object
      if (typeof message.content === 'object' && message.content !== null) {
        console.warn('⚠️ Message content is an object, converting to string:', message.content);
        try {
          // Try to convert to string safely
          if (message.content.type === 'click' || message.content._reactName) {
            // This is a React event object, convert to a safe string
            message.content = '[Event Object]';
          } else {
            // Try JSON.stringify, but catch circular reference errors
            message.content = JSON.stringify(message.content);
          }
        } catch (error) {
          console.warn('⚠️ Failed to convert object to string, using fallback:', error);
          message.content = '[Object]';
        }
      }
      const content = typeof message.content === 'string' ? message.content : String(message.content || '');
      return content.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [messages, searchQuery]);

  // Virtual scrolling: only show last 50 messages for performance
  const visibleMessages = useMemo(() => {
    const startIndex = Math.max(0, filteredMessages.length - 50);
    const sliced = filteredMessages.slice(startIndex);
    
    // Debug: Check for duplicate message IDs
    const messageIds = sliced.map(m => m.id);
    const uniqueIds = new Set(messageIds);
    if (messageIds.length !== uniqueIds.size) {
      console.warn('⚠️ Duplicate message IDs detected:', {
        total: messageIds.length,
        unique: uniqueIds.size,
        duplicates: messageIds.filter((id, index) => messageIds.indexOf(id) !== index)
      });
    }
    
    return sliced;
  }, [filteredMessages]);

  // Load more messages when scrolling to top
  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    if (scrollTop < 100 && !isLoadingMore && filteredMessages.length > 50) {
      setIsLoadingMore(true);
      // Simulate loading more messages
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 500);
    }
  }, [filteredMessages.length, isLoadingMore]);

  // Theme configurations
  const themes = {
    default: {
      userBg: 'bg-blue-500',
      botBg: 'bg-gray-100 dark:bg-gray-800',
      userText: 'text-white',
      botText: 'text-gray-900 dark:text-gray-100'
    },
    blue: {
      userBg: 'bg-blue-600',
      botBg: 'bg-blue-50 dark:bg-blue-900',
      userText: 'text-white',
      botText: 'text-blue-900 dark:text-blue-100'
    },
    green: {
      userBg: 'bg-green-600',
      botBg: 'bg-green-50 dark:bg-green-900',
      userText: 'text-white',
      botText: 'text-green-900 dark:text-green-100'
    },
    purple: {
      userBg: 'bg-purple-600',
      botBg: 'bg-purple-50 dark:bg-purple-900',
      userText: 'text-white',
      botText: 'text-purple-900 dark:text-purple-100'
    }
  };

  const currentThemeConfig = themes[currentTheme];

  const handleSendMessage = useCallback(async () => {
    console.log('🔍 ChatArea handleSendMessage called:', { 
      inputMessage: inputMessage.substring(0, 50), 
      isLoading, 
      conversationId 
    });
    
    if (!inputMessage.trim() || isLoading) {
      console.log('❌ Cannot send message:', { 
        hasInput: !!inputMessage.trim(), 
        isLoading
      });
      return;
    }

    // If no conversationId, create one first
    if (!conversationId) {
      console.log('🔍 No conversationId, creating new conversation first');
      if (onNewConversation) {
        // Store the message to send after conversation is created
        const messageToSend = inputMessage.trim();
        setInputMessage('');
        
        // Call onNewConversation with the message to send (only if it's not empty)
        if (messageToSend) {
          onNewConversation(messageToSend);
        } else {
          onNewConversation();
        }
        return;
      } else {
        console.log('❌ No onNewConversation handler provided');
        toast.error('Không thể tạo cuộc trò chuyện mới');
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const messageContent = inputMessage;
    setInputMessage('');

    try {
      console.log('🔍 Calling onSendMessage...');
      // Let ChatbotFullPage handle the entire message flow
      await onSendMessage(userMessage, messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn');
    }
  }, [inputMessage, isLoading, conversationId, onSendMessage]);

  const handleKeyDown = (e) => {
    // Send message with Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      // Add a small delay to prevent double-triggering
      setTimeout(() => {
        handleSendMessage();
      }, 10);
    }
    
    // Clear input with Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputMessage('');
    }
    
    // Focus search with Ctrl+F
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]');
      if (searchInput) {
        searchInput.focus();
      }
    }
    
    // New conversation with Ctrl+N
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      onNewConversation();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return messageTime.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">

      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="flex items-center space-x-4">
          {/* Modern Robot Logo */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-7 h-7 relative">
              {/* Robot Head */}
              <div className="w-full h-full bg-white rounded-xl relative overflow-hidden">
                {/* Eyes */}
                <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {/* Smile */}
                <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2.5 h-0.5 bg-blue-500 rounded-full"></div>
              </div>
              {/* Antenna */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2.5 bg-blue-600"></div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FBot AI Assistant
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Trợ lý AI thông minh
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNewConversation();
            }}
            className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            title="Cuộc trò chuyện mới"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
          <div className="relative">
            <button
              className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
              title="Cài đặt"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
            >
              <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
            
            {/* Theme Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Chọn theme</div>
                  <div className="space-y-2">
                    {Object.keys(themes).map(theme => (
                      <button
                        key={theme}
                        onClick={() => {
                          setCurrentTheme(theme);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentTheme === theme
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trong cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-all duration-200"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-500 font-medium">
            Tìm thấy {filteredMessages.length} tin nhắn
          </div>
        )}
      </div>
      
      {/* Spacer between search and messages */}
      <div className="h-6"></div>



      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4 scroll-smooth"
        style={{ 
          scrollBehavior: 'smooth',
          minHeight: '200px',
          maxHeight: 'none'
        }}
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {/* Loading more messages indicator */}
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center py-2"
            >
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang tải tin nhắn cũ...</span>
              </div>
            </motion.div>
          )}

          {visibleMessages.map((message, index) => {
            // Ensure message content is safe and not an object
            let safeMessageContent;
            if (typeof message.content === 'object' && message.content !== null) {
              console.warn('⚠️ Message content is an object, converting to string:', message.content);
              try {
                // Try to convert to string safely
                if (message.content.type === 'click' || message.content._reactName) {
                  // This is a React event object, convert to a safe string
                  safeMessageContent = '[Event Object]';
                  message.content = safeMessageContent;
                } else {
                  // Try JSON.stringify, but catch circular reference errors
                  safeMessageContent = JSON.stringify(message.content);
                  message.content = safeMessageContent;
                }
              } catch (error) {
                console.warn('⚠️ Failed to convert object to string, using fallback:', error);
                safeMessageContent = '[Object]';
                message.content = safeMessageContent;
              }
            } else {
              safeMessageContent = typeof message.content === 'string' ? message.content : String(message.content || '');
            }
            
            // Debug logging for bot messages (only in development)
            if (message.type === 'bot' && process.env.NODE_ENV === 'development') {
              console.log(`🔍 Rendering bot message ${index}:`, {
                id: message.id,
                contentLength: safeMessageContent?.length || 0,
                contentPreview: safeMessageContent?.substring(0, 50) + '...',
                agent: message.agent
              });
            }
            
            return (
            <motion.div
              key={`${message.id || 'msg'}-${index}-${message.timestamp || Date.now()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[95%] sm:max-w-[85%] md:max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                {/* Compact Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3.5 h-3.5 text-white" />
                  ) : (
                    getAgentIcon(message.agent)
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col space-y-2 ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                }`}>
                  {/* Compact Agent Name */}
                  {message.type === 'bot' && message.agent && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {getAgentIcon(message.agent)}
                      <span>{getAgentName(message.agent)}</span>
                    </div>
                  )}

                  {/* Compact Message Bubble */}
                  <div className={`px-5 py-3 rounded-xl max-w-full ${
                    message.type === 'user'
                      ? `${currentThemeConfig.userBg} ${currentThemeConfig.userText}`
                      : `${currentThemeConfig.botBg} ${currentThemeConfig.botText}`
                  }`}>
                    <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                      {message.type === 'bot' ? 
                        renderMessageContent(safeMessageContent) : 
                        safeMessageContent
                      }
                    </div>
                    
                    {/* Compact Quick Action Buttons for Welcome Message */}
                    {message.type === 'bot' && message.agent === 'welcome' && message.quickActions && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Chọn chức năng bạn muốn sử dụng:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {message.quickActions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => handleQuickAction(action.action)}
                              className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Compact Message Metadata */}
                  <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>{formatTime(message.timestamp)}</span>
                    
                    {/* Message Actions */}
                    <div className="flex items-center space-x-2">
                      {message.type === 'bot' && (
                        <>
                          <button
                            onClick={() => handleCopyMessage(safeMessageContent)}
                            className="p-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Sao chép"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDownloadMessage(safeMessageContent)}
                            className="p-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Tải xuống"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleShareMessage(safeMessageContent)}
                            className="p-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Chia sẻ"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      
                      {/* Message Reactions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleReaction(message.id, 'thumbsUp')}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            messageReactions[message.id]?.thumbsUp ? 'text-blue-500 bg-blue-50' : 'hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Thích"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-400">{messageReactions[message.id]?.thumbsUp || 0}</span>
                        
                        <button
                          onClick={() => handleReaction(message.id, 'thumbsDown')}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            messageReactions[message.id]?.thumbsDown ? 'text-red-500 bg-red-50' : 'hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Không thích"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-400">{messageReactions[message.id]?.thumbsDown || 0}</span>
                        
                        <button
                          onClick={() => handleReaction(message.id, 'heart')}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            messageReactions[message.id]?.heart ? 'text-pink-500 bg-pink-50' : 'hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          title="Yêu thích"
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-gray-400">{messageReactions[message.id]?.heart || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>

        <div ref={messagesEndRef} className="pb-4" />
      </div>

      {/* Enhanced Input Area */}
      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0 bg-white/95 backdrop-blur-sm">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn của bạn... (Hỗ trợ Markdown: **bold**, *italic*, ```code```)"
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading || isStreaming}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400 font-medium">
              Enter gửi • Shift+Enter xuống dòng • Esc xóa • Ctrl+F tìm kiếm
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Emoji Button */}
            <button
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Emoji"
            >
              😊
            </button>
            
            {/* File Upload Button */}
            <button
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Tải file"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {/* Enhanced Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isStreaming}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea; 