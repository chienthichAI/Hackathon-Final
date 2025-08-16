import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  sendChatbotMessage, 
  createConversation, 
  getConversationHistory, 
  getUserConversations,
  updateConversationTitle,
  deleteConversation,
  saveMessage,
  cleanupEmptyConversations
} from '../../api';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import toast from 'react-hot-toast';

const ChatbotFullPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Xin chào! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
      timestamp: new Date(),
      agent: 'welcome',
      quickActions: [
        { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
        { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
        { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
        { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [processingMessageId, setProcessingMessageId] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [finalMessageReceived, setFinalMessageReceived] = useState(false);

  // Function to generate smart conversation title
  const generateConversationTitle = (messageContent) => {
    if (!messageContent || messageContent.trim().length === 0) {
      return 'Cuộc trò chuyện mới';
    }

    // Clean the message content
    let cleanContent = messageContent.trim();
    
    // Remove common prefixes
    const prefixesToRemove = ['xin chào', 'hello', 'hi', 'chào', 'hey'];
    for (const prefix of prefixesToRemove) {
      if (cleanContent.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleanContent = cleanContent.substring(prefix.length).trim();
        break;
      }
    }

    // If content is too short after cleaning, use original
    if (cleanContent.length < 3) {
      cleanContent = messageContent.trim();
    }

    // Limit length and add ellipsis if needed
    if (cleanContent.length > 25) {
      return cleanContent.substring(0, 25) + '...';
    }

    return cleanContent || 'Cuộc trò chuyện mới';
  };

  // Load user conversations on mount
  useEffect(() => {
    if (user) {
      console.log('🔍 User loaded, loading conversations...');
      loadUserConversations();
    }
  }, [user]);

  // Only create conversation if user explicitly requests it
  // Remove auto-creation logic

  // Remove fallback auto-creation timer

  // Emergency fallback: only show welcome message if no messages and no current conversation
  useEffect(() => {
    if (user && messages.length === 0 && !isLoading && !currentConversationId) {
      console.log('🔍 Emergency fallback: No messages and no conversation, showing welcome message');
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
          timestamp: new Date(),
          agent: 'welcome',
          quickActions: [
            { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
            { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
            { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
            { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
          ]
        }
      ]);
    }
  }, [user, messages.length, isLoading, currentConversationId]);

  // Update welcome message with user name when user loads
  useEffect(() => {
    if (user && messages.length === 1 && messages[0].agent === 'welcome') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 User loaded, updating welcome message with name');
      }
      setMessages(prev => prev.map(msg => 
        msg.agent === 'welcome' 
          ? {
              ...msg,
              content: `Xin chào ${user.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`
            }
          : msg
      ));
    }
  }, [user]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [loadingTimeout]);

  const loadUserConversations = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Loading user conversations...');
      }
      const response = await getUserConversations();
      
      // Axios response structure
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Conversations loaded:', data.data?.length || 0);
        }
        
        // Use titles from database, fallback to default if not set
        const conversationsWithTitles = (data.data || []).map(conv => ({
          ...conv,
          title: conv.title || 'Cuộc trò chuyện mới',
          messageCount: conv.messageCount || 0,
          updatedAt: conv.updatedAt || conv.startedAt
        }));
        
                  // Only set conversations, don't auto-create
          if (data.data && data.data.length > 0) {
            // Filter out empty conversations (no messages)
            const validConversations = conversationsWithTitles.filter(conv => 
              conv.messageCount > 0 || conv.lastMessage !== 'No messages yet'
            );
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 Found', validConversations.length, 'valid conversations');
            }
            setConversations(validConversations);
          
                      // Select the first conversation with messages, or the most recent one
            if (validConversations.length > 0) {
              let selectedConversation = validConversations[0];
              for (const conv of validConversations) {
                if (conv.messageCount > 0) {
                  selectedConversation = conv;
                  break;
                }
              }
              
              if (process.env.NODE_ENV === 'development') {
                console.log('🔍 Selected conversation:', selectedConversation.id);
              }
              setCurrentConversationId(selectedConversation.id);
              // Clear initial welcome message before loading conversation
              setMessages([]);
              await selectConversation(selectedConversation.id);
            }
        } else {
          console.log('🔍 No conversations found, creating new conversation automatically');
          // Automatically create a new conversation when none exist
          createNewConversation();
        }
      } else {
        console.log('🔍 Response not ok, status:', response.status);
        console.log('🔍 Response data:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      // Show welcome message on error
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
          timestamp: new Date(),
          agent: 'welcome',
          quickActions: [
            { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
            { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
            { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
            { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
          ]
        }
      ]);
    }
  };

  // Helper function to send message to AI directly
  const sendMessageToAI = async (userMessage, messageContent, conversationId = null) => {
    try {
      // Ensure messageContent is a string
      const content = typeof messageContent === 'string' ? messageContent : String(messageContent || '');
      const targetConversationId = conversationId || currentConversationId;
      console.log('🔍 sendMessageToAI called directly:', { content, targetConversationId });
      
      // Set loading state with timeout protection
      setIsLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // Set a timeout to automatically reset loading state after 30 seconds
      const timeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout reached, resetting loading state');
        setIsLoading(false);
      }, 30000);
      setLoadingTimeout(timeout);
      
      // Send to chatbot API
      const response = await sendChatbotMessage(targetConversationId, content);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalMessage = '';
      let finalMessageCreated = false; // Flag to ensure only one final message is created
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'final' && !finalMessageCreated) {
                // Ensure only one final message is created
                finalMessageCreated = true;
                // Ensure content is a string
                let finalMessage;
                if (typeof data.content === 'object' && data.content !== null) {
                  console.warn('⚠️ AI response content is an object, converting to string:', data.content);
                  try {
                    if (data.content.type === 'click' || data.content._reactName) {
                      // This is a React event object, convert to a safe string
                      finalMessage = '[Event Object]';
                    } else {
                      // Try JSON.stringify, but catch circular reference errors
                      finalMessage = JSON.stringify(data.content);
                    }
                  } catch (error) {
                    console.warn('⚠️ Failed to convert object to string, using fallback:', error);
                    finalMessage = '[Object]';
                  }
                } else {
                  finalMessage = typeof data.content === 'string' ? data.content : String(data.content || '');
                }
                
                // Clear loading state immediately
                setIsLoading(false);
                setFinalMessageReceived(true);
                
                // Clear timeout if exists
                if (loadingTimeout) {
                  clearTimeout(loadingTimeout);
                  setLoadingTimeout(null);
                }
                
                // Add bot message to UI
                const botMessage = {
                  id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
                  type: 'bot',
                  content: finalMessage,
                  timestamp: new Date(),
                  agent: 'generic_agent'
                };
                
                setMessages(prev => [...prev, botMessage]);
                
                // Save bot message to database (async, don't await for performance)
                saveMessage(targetConversationId, 'bot', finalMessage, 'generic_agent').catch(error => {
                  console.error('Error saving bot message:', error);
                });
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error in sendMessageToAI:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại.',
        timestamp: new Date(),
        agent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Only clear remaining states if final message not received
      if (!finalMessageReceived) {
        if (isLoading) {
          setIsLoading(false);
        }
      }
      setFinalMessageReceived(false);
      
      // Clear timeout if still exists
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    }
  };

  const createNewConversation = async (messageToSend = null) => {
    try {
      // Ensure messageToSend is a string if provided
      let messageContent;
      if (messageToSend === null || messageToSend === undefined) {
        messageContent = '';
      } else if (typeof messageToSend === 'string') {
        messageContent = messageToSend;
      } else if (typeof messageToSend === 'object' && messageToSend !== null) {
        console.warn('⚠️ messageToSend is an object, ignoring:', messageToSend);
        messageContent = '';
      } else {
        messageContent = String(messageToSend || '');
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Creating new conversation...', { messageContent, originalMessageToSend: messageToSend });
      }
      const response = await createConversation();
      
      // Axios response structure
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        const conversationId = data.data.conversationId;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Conversation created:', conversationId);
        }
        
        const newConversation = {
          id: conversationId,
          title: 'Cuộc trò chuyện mới',
          startedAt: new Date(),
          lastMessage: 'Cuộc trò chuyện mới',
          messageCount: 0,
          updatedAt: new Date()
        };

        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(conversationId);
        
        // Clear any existing messages and show welcome message for new conversation
        if (messageContent && messageContent.trim()) {
          // If there's a message to send, add both welcome and user message
          const userMessage = {
            id: Date.now() + 1,
            type: 'user',
            content: messageContent,
            timestamp: new Date()
          };
          setMessages([
            {
              id: 1,
              type: 'bot',
              content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
              timestamp: new Date(),
              agent: 'welcome',
              quickActions: [
                { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
                { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
                { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
                { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
              ]
            },
            userMessage
          ]);
          
          // Save user message to database
          try {
            await saveMessage(conversationId, 'user', messageContent);
            console.log('✅ User message saved for new conversation');
          } catch (error) {
            console.error('Error saving user message:', error);
          }
          
          // Now send the message to AI
          setTimeout(() => {
            // Use the conversationId we just created instead of currentConversationId
            if (conversationId) {
              sendMessageToAI(userMessage, messageContent, conversationId);
            } else {
              console.log('❌ No conversationId available for AI call');
            }
          }, 100);
        } else {
          // Just show welcome message
          const welcomeMessage = {
            id: Date.now() + Math.random(), // Ensure unique ID
            type: 'bot',
            content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
            timestamp: new Date(),
            agent: 'welcome',
            quickActions: [
              { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
              { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
              { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
              { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
            ]
          };
          setMessages([welcomeMessage]);
        }
        console.log('✅ New conversation created with welcome message');
      } else {
        console.log('🔍 Response not ok, status:', response.status);
        console.log('🔍 Response data:', response.data);
        if (response.data?.success && response.data?.data?.conversationId) {
          const conversationId = response.data.data.conversationId;
          console.log('✅ Conversation created from response:', conversationId);
          
          const newConversation = {
            id: conversationId,
            title: 'Cuộc trò chuyện mới',
            startedAt: new Date(),
            lastMessage: 'Cuộc trò chuyện mới'
          };

          setConversations(prev => [newConversation, ...prev]);
          setCurrentConversationId(conversationId);
          
          // Clear any existing messages and show welcome message for new conversation
          const welcomeMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
            timestamp: new Date(),
            agent: 'welcome',
            quickActions: [
              { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
              { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
              { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
              { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
            ]
          };
          
          if (messageContent) {
            // If there's a message to send, add both welcome and user message
            const userMessage = {
              id: Date.now() + 2,
              type: 'user',
              content: messageContent,
              timestamp: new Date()
            };
            setMessages([welcomeMessage, userMessage]);
            
            // Save user message to database
            try {
              await saveMessage(conversationId, 'user', messageContent);
              console.log('✅ User message saved for new conversation');
            } catch (error) {
              console.error('Error saving user message:', error);
            }
            
            // Now send the message to AI
            setTimeout(() => {
              sendMessageToAI(userMessage, messageContent);
            }, 100);
                      } else {
              // Just show welcome message
              setMessages([welcomeMessage]);
            }
          console.log('✅ Welcome message set');
        } else {
          console.error('❌ Failed to create conversation: invalid response data');
          toast.error('Không thể tạo cuộc trò chuyện mới');
        }
      }
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      toast.error('Không thể tạo cuộc trò chuyện mới');
    }
  };

  const selectConversation = async (conversationId) => {
    console.log('🔍 Selecting conversation:', conversationId);
    setCurrentConversationId(conversationId);
    
    try {
      // Load conversation history from backend
      const response = await getConversationHistory(conversationId);
      console.log('🔍 Conversation history response:', response.status);
      
      // Axios response structure
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('🔍 Conversation history data:', data);
        
        const historyMessages = data.data?.messages || [];
        console.log('🔍 History messages count:', historyMessages.length);
        
        if (historyMessages.length > 0) {
          // Convert database format to UI format with unique IDs
          const uiMessages = historyMessages.map((msg, index) => {
            // Ensure content is a string
            let safeContent;
            if (typeof msg.content === 'object' && msg.content !== null) {
              console.warn('⚠️ Database message content is an object, converting to string:', msg.content);
              try {
                if (msg.content.type === 'click' || msg.content._reactName) {
                  safeContent = '[Event Object]';
                } else {
                  safeContent = JSON.stringify(msg.content);
                }
              } catch (error) {
                console.warn('⚠️ Failed to convert database object to string, using fallback:', error);
                safeContent = '[Object]';
              }
            } else {
              safeContent = typeof msg.content === 'string' ? msg.content : String(msg.content || '');
            }
            
            return {
              id: msg.id || Date.now() + index, // Use database ID or generate unique ID
              type: msg.role === 'user' ? 'user' : 'bot',
              content: safeContent,
              timestamp: new Date(msg.timestamp),
              agent: msg.agent || 'generic_agent'
            };
          });
          
          setMessages(uiMessages);
          console.log('✅ Loaded', uiMessages.length, 'messages from history');
        } else {
          // If no history, show welcome message
          console.log('🔍 No history messages, showing welcome message');
          const welcomeMessage = {
            id: Date.now() + Math.random(), // Ensure unique ID
            type: 'bot',
            content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
            timestamp: new Date(),
            agent: 'welcome',
            quickActions: [
              { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
              { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
              { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
              { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
            ]
          };
          setMessages([welcomeMessage]);
        }
      } else {
        console.log('🔍 Failed to load history, showing welcome message');
        // If no history, show welcome message
        const welcomeMessage = {
          id: Date.now() + Math.random(), // Ensure unique ID
          type: 'bot',
          content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
          timestamp: new Date(),
          agent: 'welcome',
          quickActions: [
            { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
            { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
            { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
            { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
          ]
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      // Always show welcome message on error
      const welcomeMessage = {
        id: Date.now() + Math.random(), // Ensure unique ID
        type: 'bot',
        content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là FBot - Trợ lý AI thông minh của bạn. 

Tôi có thể giúp bạn:
🎓 **Tư vấn giáo dục** - Thông tin trường học, học phí, tuyển sinh
📋 **Quản lý công việc** - Tạo, sửa, xóa todo và lịch trình
📊 **Phân tích hiệu suất** - Báo cáo tiến độ và tư vấn cải thiện
🔍 **Tìm kiếm thông tin** - Web search và tạo lộ trình học tập

Hãy cho tôi biết bạn cần gì nhé!`,
        timestamp: new Date(),
        agent: 'welcome',
        quickActions: [
          { label: '🎓 Tư vấn giáo dục', action: 'tư vấn giáo dục' },
          { label: '📋 Quản lý công việc', action: 'tạo todo cho tôi' },
          { label: '📊 Phân tích hiệu suất', action: 'phân tích hiệu suất học tập của tôi' },
          { label: '🔍 Tìm kiếm thông tin', action: 'tìm kiếm thông tin về học tập' }
        ]
      };
      setMessages([welcomeMessage]);
    }
  };

  const deleteConversationHandler = async (conversationId) => {
    try {
      console.log('🔍 Deleting conversation:', conversationId);
      const response = await deleteConversation(conversationId);
      
      // Axios response structure
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Conversation deleted successfully');
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        if (currentConversationId === conversationId) {
          // If deleting current conversation, create a new one
          await createNewConversation();
        }
        
        toast.success('Đã xóa cuộc trò chuyện');
      } else {
        console.log('🔍 Delete response not ok, status:', response.status);
        console.log('🔍 Response data:', response.data);
        
        // Try to remove from UI anyway if it's a 404 (conversation not found)
        if (response.status === 404) {
          console.log('🔍 Conversation not found, removing from UI');
          setConversations(prev => prev.filter(conv => conv.id !== conversationId));
          
          if (currentConversationId === conversationId) {
            await createNewConversation();
          }
          
          toast.success('Đã xóa cuộc trò chuyện');
        } else {
          toast.error('Không thể xóa cuộc trò chuyện');
        }
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      
      // If it's a 404 error, remove from UI anyway
      if (error.response && error.response.status === 404) {
        console.log('🔍 Conversation not found (404), removing from UI');
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        if (currentConversationId === conversationId) {
          await createNewConversation();
        }
        
        toast.success('Đã xóa cuộc trò chuyện');
      } else {
        toast.error('Không thể xóa cuộc trò chuyện');
      }
    }
  };

  const renameConversation = async (conversationId, newTitle) => {
    try {
      console.log('🔍 Renaming conversation:', conversationId, 'to:', newTitle);
      const response = await updateConversationTitle(conversationId, newTitle);
      
      // Axios response structure
      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Conversation renamed successfully in database');
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, title: newTitle, updatedAt: new Date() }
              : conv
          )
        );
        toast.success('Đã đổi tên cuộc trò chuyện');
      } else {
        console.log('🔍 Rename response not ok, status:', response.status);
        console.log('🔍 Response data:', response.data);
        // Still update in local state even if backend fails
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, title: newTitle, updatedAt: new Date() }
              : conv
          )
        );
        toast.success('Đã đổi tên cuộc trò chuyện (local)');
      }
    } catch (error) {
      console.error('❌ Error renaming conversation:', error);
      // Still update in local state even if backend fails
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle, updatedAt: new Date() }
            : conv
        )
      );
      toast.success('Đã đổi tên cuộc trò chuyện (local)');
    }
  };

  const cleanupConversations = async () => {
    try {
      console.log('🔍 Cleaning up empty conversations...');
      const response = await cleanupEmptyConversations();
      
      if (response.status >= 200 && response.status < 300) {
        const deletedCount = response.data.data.deletedCount;
        console.log('✅ Cleaned up', deletedCount, 'empty conversations');
        
        // Reload conversations to reflect changes
        await loadUserConversations();
        
        toast.success(`Đã dọn dẹp ${deletedCount} cuộc trò chuyện trống`);
      } else {
        console.log('🔍 Cleanup response not ok, status:', response.status);
        toast.error('Không thể dọn dẹp cuộc trò chuyện');
      }
    } catch (error) {
      console.error('❌ Error cleaning up conversations:', error);
      toast.error('Không thể dọn dẹp cuộc trò chuyện');
    }
  };

  const handleSendMessage = useCallback(async (userMessage, messageContent) => {
    // Prevent multiple simultaneous requests
    if (isLoading) {
      console.log('⚠️ Request already in progress, ignoring new request');
      return;
    }
    
    console.log('🔍 handleSendMessage called:', { 
      currentConversationId, 
      messageContent: messageContent.substring(0, 50),
      userMessage,
      messagesLength: messages.length,
      hasWelcomeMessage: messages.length > 0 && messages[0]?.agent === 'welcome',
      isLoading
    });
    
    // If no conversation, this should not happen since createNewConversation handles it
    if (!currentConversationId) {
      console.log('❌ No conversation selected, this should not happen');
      toast.error('Không thể gửi tin nhắn - không có conversation');
      return;
    }

    // Always add user message to UI first to prevent message loss
    // Ensure user message content is safe
    let safeUserMessage = { ...userMessage };
    if (typeof userMessage.content === 'object' && userMessage.content !== null) {
      console.warn('⚠️ User message content is an object, converting to string:', userMessage.content);
      try {
        if (userMessage.content.type === 'click' || userMessage.content._reactName) {
          safeUserMessage.content = '[Event Object]';
        } else {
          safeUserMessage.content = JSON.stringify(userMessage.content);
        }
      } catch (error) {
        console.warn('⚠️ Failed to convert user message object to string, using fallback:', error);
        safeUserMessage.content = '[Object]';
      }
    }
    
    const userMessageWithUniqueId = {
      ...safeUserMessage,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // More unique ID
    };
    
    // Set processing message ID to prevent duplicates
    setProcessingMessageId(userMessageWithUniqueId.id);
    
    setMessages(prev => [...prev, userMessageWithUniqueId]);
    
    // Set loading state with timeout protection
    setIsLoading(true);
    setFinalMessageReceived(false);
    
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    
    // Set a timeout to automatically reset loading state after 30 seconds
    const timeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached, resetting loading state');
      setIsLoading(false);
      setFinalMessageReceived(false);
    }, 30000);
    setLoadingTimeout(timeout);
    
    // Clear any previous streaming state
    setStreamingMessage('');
    setIsStreaming(false);
    
    // Update conversation title if this is the first user message (not welcome)
    if (messages.length === 1 && messages[0].agent === 'welcome') {
      const conversationTitle = generateConversationTitle(messageContent);
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { ...conv, title: conversationTitle }
            : conv
        )
      );
    }

    // Save user message to database (async, don't await for performance)
    saveMessage(currentConversationId, 'user', messageContent).catch(error => {
      console.error('Error saving user message:', error);
    });

    try {
      console.log('🔍 Sending message to chatbot API...');
      console.log('🔍 Conversation ID:', currentConversationId);
      console.log('🔍 Message:', messageContent);
      
      // Test API connection first (optional, don't fail if health check fails)
      try {
        const testResponse = await fetch('http://localhost:5001/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('🔍 API health check:', testResponse.status, testResponse.ok);
      } catch (testError) {
        console.warn('⚠️ API health check failed (this is normal):', testError);
      }
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });
      
      const response = await Promise.race([
        sendChatbotMessage(currentConversationId, messageContent),
        timeoutPromise
      ]);
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('API endpoint không tìm thấy. Vui lòng kiểm tra server.');
        } else if (response.status === 500) {
          throw new Error('Lỗi server nội bộ. Vui lòng thử lại sau.');
        } else if (response.status === 0) {
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let finalMessage = '';
      let finalMessageCreated = false; // Flag to ensure only one final message is created

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              // console.log('🔍 Parsed streaming data:', data); // Commented for performance
              
              if (data.type === 'chunk') {
                // Simplified content handling for performance
                streamedContent = typeof data.content === 'string' ? data.content : String(data.content || '');
                // Don't show streaming, just collect content
              } else if (data.type === 'final' && !finalMessageCreated) {
                // Ensure only one final message is created
                finalMessageCreated = true;
                
                // Simplified content handling for performance
                const finalMessage = typeof data.content === 'string' ? data.content : String(data.content || '');
                // console.log('🔍 Final message received, length:', finalMessage.length); // Commented for performance
                // console.log('🔍 Final message content:', finalMessage); // Commented for performance
                
                // Clear streaming state and loading state immediately
                setStreamingMessage('');
                setIsStreaming(false);
                setIsLoading(false);
                setFinalMessageReceived(true);
                
                // Clear timeout if exists
                if (loadingTimeout) {
                  clearTimeout(loadingTimeout);
                  setLoadingTimeout(null);
                }
                
                // Create the bot message object with unique ID
                const botMessage = {
                  id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
                  type: 'bot',
                  content: finalMessage,
                  timestamp: new Date(),
                  agent: currentAgent || 'generic_agent'
                };
                
                // Check if this message already exists to prevent duplicates
                const messageExists = messages.some(msg => 
                  msg.content === finalMessage && 
                  msg.type === 'bot' && 
                  Date.now() - new Date(msg.timestamp).getTime() < 5000 // Within 5 seconds
                );
                
                if (messageExists) {
                  console.log('⚠️ Duplicate bot message detected, skipping...');
                  return;
                }
                
                // console.log('🔍 Adding bot message to state:', botMessage); // Commented for performance
                
                // Add final message to messages array
                setMessages(prev => [...prev, botMessage]);

                // Save bot message to database (async, don't await for performance)
                saveMessage(currentConversationId, 'bot', finalMessage, currentAgent).catch(error => {
                  console.error('Error saving bot message:', error);
                });
              } else if (data.type === 'final' && finalMessageCreated) {
                console.log('⚠️ Duplicate final message received, ignoring');
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', e);
            }
          }
        }
      }

      // Generate smart conversation title
      const conversationTitle = generateConversationTitle(messageContent);
      
      // Update conversation in UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { 
                ...conv, 
                title: conversationTitle,
                updatedAt: new Date(),
                messageCount: (conv.messageCount || 0) + 2 // user + bot message
              }
            : conv
        )
      );

      // Update conversation title in backend (async, don't await for performance)
      updateConversationTitle(currentConversationId, conversationTitle).then(() => {
        console.log('✅ Conversation title updated in database:', conversationTitle);
      }).catch(error => {
        console.error('❌ Error updating conversation title:', error);
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorContent = 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại.';
      
      if (error.message.includes('timeout')) {
        errorContent = '⏰ Xin lỗi, yêu cầu của bạn đã bị timeout sau 30 giây. Vui lòng thử lại.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('kết nối')) {
        errorContent = '🌐 Không thể kết nối đến AI server. Vui lòng kiểm tra:\n• Server có đang chạy không?\n• Kết nối mạng có ổn không?\n• Port 5001 có đúng không?';
      } else if (error.message.includes('404')) {
        errorContent = '🔍 API endpoint không tìm thấy. Vui lòng kiểm tra cấu hình server.';
      } else if (error.message.includes('500')) {
        errorContent = '⚡ Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ admin.';
      }
      
      const errorMessage = {
        id: Date.now() + Math.random(), // Ensure unique ID
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
        agent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);

      // Save error message to database
      try {
        await saveMessage(currentConversationId, 'bot', errorMessage.content, 'error');
      } catch (saveError) {
        console.error('Error saving error message:', saveError);
      }
    } finally {
      // Only clear remaining states if final message not received
      if (!finalMessageReceived) {
        if (isLoading) {
          setIsLoading(false);
        }
        if (isStreaming) {
          setIsStreaming(false);
        }
      }
      setStreamingMessage('');
      setCurrentAgent(null);
      setProcessingMessageId(null);
      setFinalMessageReceived(false);
      
      // Clear timeout if still exists
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    }
  }, [currentConversationId, currentAgent]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={{ x: -384 }}
          animate={{ x: 0 }}
          exit={{ x: -384 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-shrink-0"
        >
          <ConversationSidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={selectConversation}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversationHandler}
            onRenameConversation={renameConversation}
            onCleanupConversations={cleanupConversations}
          />
        </motion.div>
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isStreaming={false}
          streamingMessage=""
          conversationId={currentConversationId}
          onNewConversation={createNewConversation}
        />
      </div>
    </div>
  );
};

export default ChatbotFullPage; 