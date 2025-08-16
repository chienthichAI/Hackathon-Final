import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Search,
  Clock,
  Bot,
  Trash
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useApi from '../../hooks/useApi';

const ConversationSidebar = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onCleanupConversations
}) => {
  const { user } = useAuth();
  const { get } = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const filteredConversations = conversations.filter(conv =>
    (conv.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRename = (conversation) => {
    setEditingId(conversation.id);
    setEditName(conversation.title);
  };

  const handleSaveRename = async (conversationId) => {
    if (editName.trim()) {
      await onRenameConversation(conversationId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (date) => {
    if (!date) return 'Vừa xong';
    
    try {
    const now = new Date();
    const convDate = new Date(date);
    const diffTime = Math.abs(now - convDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hôm nay';
    if (diffDays === 2) return 'Hôm qua';
    if (diffDays <= 7) return `${diffDays - 1} ngày trước`;
    return convDate.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Vừa xong';
    }
  };

  return (
    <div className="w-96 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-between mb-5 w-full">
          <div className="flex items-center space-x-3">
            {/* Modern Robot Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 relative">
                {/* Robot Head */}
                <div className="w-full h-full bg-white rounded-lg relative overflow-hidden">
                  {/* Eyes */}
                  <div className="absolute top-1 left-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                  {/* Smile */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-blue-500 rounded-full"></div>
                </div>
                {/* Antenna */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-blue-600"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cuộc trò chuyện
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onCleanupConversations}
              className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              title="Dọn dẹp cuộc trò chuyện trống"
            >
              <Trash className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNewConversation();
              }}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center text-gray-500"
            >
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có cuộc trò chuyện nào'}
            </motion.div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`group relative p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 rounded-xl mb-2 ${
                  currentConversationId === conversation.id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingId === conversation.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conversation.id);
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        onBlur={() => handleSaveRename(conversation.id)}
                        className="w-full px-3 py-2 text-sm bg-white border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(conversation);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDate(conversation.updatedAt || conversation.startedAt)}
                      </span>
                      {conversation.messageCount > 0 && (
                        <span className="text-xs text-gray-500 font-medium">
                          • {conversation.messageCount} tin nhắn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="font-medium">FBot AI Online</span>
        </div>
      </div>
    </div>
  );
};

export default ConversationSidebar; 