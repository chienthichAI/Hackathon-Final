import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getForumPosts, createForumPost, commentForumPost, voteForumPost } from '../api';
import { useAuth } from '../contexts/AuthContext';

// User Avatar Component
const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const statusSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const statusSize = statusSizes[size] || statusSizes.md;

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 3 }}
      className={`bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md relative overflow-hidden ${sizeClass} ${className}`}
    >
      {/* Loading state */}
      {imageLoading && user?.profileImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 animate-pulse rounded-xl"></div>
      )}
      
      {/* User Profile Image */}
      {user?.profileImage && !imageError ? (
        <img
          src={user.profileImage}
          alt={`${user?.name || 'User'} profile`}
          className="w-full h-full object-cover rounded-xl"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : null}
      
      {/* Fallback to initial letter */}
      <div className={`w-full h-full flex items-center justify-center ${user?.profileImage && !imageError ? 'hidden' : 'flex'}`}>
        <span className="relative z-10">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
      </div>
      
      {/* Avatar shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Online status indicator */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute -bottom-0.5 -right-0.5 ${statusSize} bg-green-400 border border-white rounded-full`}
      />
    </motion.div>
  );
};

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [hoveredPost, setHoveredPost] = useState(null);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await getForumPosts();
      if (response.data) {
        if (response.data.success) {
          setPosts(response.data.posts || []);
        } else {
          setPosts(response.data || []); // Fallback for direct array response
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    
    try {
      await createForumPost(newPost);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!comment) return;
    
    try {
      await commentForumPost({ postId, content: comment });
      setComment('');
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleVote = async (postId, value) => {
    try {
      await voteForumPost({ postId, value });
      fetchPosts();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Shimmer loading effect
  const ShimmerEffect = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 rounded mb-2"></div>
      <div className="h-4 bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gradient-to-r from-orange-200 via-red-200 to-orange-200 rounded w-1/2"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/30 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative mb-8"
          >
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-orange-700 mt-4 text-sm font-medium"
          >
            Loading community posts...
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-6 flex space-x-2 justify-center"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 relative overflow-hidden">
      {/* Advanced background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Particle effects */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-orange-400/20 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header with advanced animations */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 shadow-2xl relative overflow-hidden group"
          >
            {/* Shimmer effect on icon */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14H9a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-2l-2 2z" />
            </svg>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-700 via-red-700 to-orange-600 bg-clip-text text-transparent mb-6 relative"
          >
            <span className="relative">
              Community <span className="text-orange-600">Posts</span>
              {/* Underline animation */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg text-orange-700 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Share your thoughts, ask questions, and engage with the community in a beautiful, modern space
          </motion.p>
          
          {user && (
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Ripple effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center space-x-3">
                <motion.svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </motion.svg>
                <span className="text-base">{showCreateForm ? 'Cancel' : 'Create New Post'}</span>
              </div>
            </motion.button>
          )}
        </motion.div>

        {/* Create Post Form with glassmorphism */}
        <AnimatePresence>
          {showCreateForm && user && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 mb-12 border border-white/30 shadow-2xl relative overflow-hidden"
            >
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">Create New Post</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-3">Post Title</label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        placeholder="Enter an engaging title for your post..."
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        className="w-full px-6 py-4 bg-white/80 border border-gray-200/50 rounded-2xl text-orange-800 placeholder-orange-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200/30 transition-all duration-300 text-base backdrop-blur-sm"
                      />
                      {/* Focus indicator */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </motion.div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-3">Content</label>
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <textarea
                        placeholder="Share your thoughts, questions, or ideas with the community..."
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={5}
                        className="w-full px-6 py-4 bg-white/80 border border-gray-200/50 rounded-2xl text-orange-800 placeholder-orange-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200/30 transition-all duration-300 resize-none text-base backdrop-blur-sm"
                      />
                      {/* Focus indicator */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 text-orange-600 hover:text-orange-800 font-medium transition-colors duration-300 text-base"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ 
                        scale: 1.05, 
                        y: -2,
                        boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreatePost}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 text-base relative overflow-hidden group"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative">Create Post</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts List with advanced animations */}
        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.8, 
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.01,
                  transition: { duration: 0.3 }
                }}
                onHoverStart={() => setHoveredPost(post.id)}
                onHoverEnd={() => setHoveredPost(null)}
                className="group backdrop-blur-xl bg-white/30 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden relative hover:bg-orange-50/50"
              >
                {/* Advanced hover effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Animated corner element */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-bl-3xl transform rotate-45 translate-x-10 -translate-y-10"
                  animate={{
                    rotate: hoveredPost === post.id ? [45, 50, 45] : 45,
                    scale: hoveredPost === post.id ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Post Header */}
                <div className="relative flex items-center mb-4">
                  <div className="relative mr-4">
                    <UserAvatar user={post.author} size="lg" />
                  </div>
                  
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="text-base font-bold text-black mb-1"
                    >
                      {post.author?.name || 'Anonymous'}
                    </motion.div>
                    <div className="flex items-center text-orange-600 text-xs">
                      <motion.svg 
                        className="w-3 h-3 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: hoveredPost === post.id ? 360 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </motion.svg>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="relative mb-4">
                  <motion.h3
                    whileHover={{ x: 3 }}
                    className="text-xl font-bold text-black mb-3 leading-tight"
                  >
                    {post.title}
                  </motion.h3>
                  <motion.p
                    whileHover={{ x: 2 }}
                    className="text-black text-sm leading-relaxed"
                  >
                    {post.content}
                  </motion.p>
                </div>

                {/* Post Actions with micro-interactions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(post.id, 1)}
                      className="group flex items-center space-x-2 px-3 py-2 bg-white/50 hover:bg-green-50 rounded-lg transition-all duration-300 backdrop-blur-sm"
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 bg-green-100 group-hover:bg-green-200 rounded-md flex items-center justify-center transition-colors duration-300"
                      >
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </motion.div>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-medium text-black group-hover:text-green-700 transition-colors duration-300 text-xs"
                      >
                        {post.votes || 0}
                      </motion.span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleVote(post.id, -1)}
                      className="group flex items-center space-x-2 px-3 py-2 bg-white/50 hover:bg-red-50 rounded-lg transition-all duration-300 backdrop-blur-sm"
                    >
                      <motion.div
                        whileHover={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 bg-red-100 group-hover:bg-red-200 rounded-md flex items-center justify-center transition-colors duration-300"
                      >
                        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                        </svg>
                      </motion.div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      className="group flex items-center space-x-2 px-3 py-2 bg-white/50 hover:bg-orange-50 rounded-lg transition-all duration-300 backdrop-blur-sm"
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -3, 3, 0] }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 bg-orange-100 group-hover:bg-orange-200 rounded-md flex items-center justify-center transition-colors duration-300"
                      >
                        <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </motion.div>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="font-medium text-black group-hover:text-orange-700 transition-colors duration-300 text-xs"
                      >
                        {post.comments?.length || 0}
                      </motion.span>
                    </motion.button>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-2 text-sm text-orange-600"
                  >
                    <motion.svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ scale: hoveredPost === post.id ? 1.2 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </motion.svg>
                    <span>Public Post</span>
                  </motion.div>
                </div>

                {/* Comments Section with advanced animations */}
                <AnimatePresence>
                  {selectedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="mt-8 pt-8 border-t border-gray-100/50 overflow-hidden"
                    >
                      <div className="flex items-center mb-6">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </motion.div>
                        <h4 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                          Comments ({post.comments?.length || 0})
                        </h4>
                      </div>
                      
                      {/* Comments List */}
                                              <div className="space-y-3 mb-4">
                          {post.comments?.map((comment, commentIndex) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -20, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{ 
                                delay: commentIndex * 0.1, 
                                duration: 0.4,
                                type: "spring",
                                stiffness: 100
                              }}
                              whileHover={{ x: 3, scale: 1.01 }}
                              className="group bg-gradient-to-r from-white/50 to-orange-50/30 rounded-xl p-3 border border-gray-100/50 hover:border-orange-200/50 hover:bg-orange-50/50 transition-all duration-300 backdrop-blur-sm"
                            >
                                                                                      <div className="flex items-center mb-2">
                               <div className="mr-3">
                                 <UserAvatar user={comment.author} size="sm" />
                               </div>
                               <div>
                                 <div className="text-black font-semibold text-xs">{comment.author?.name || 'Anonymous'}</div>
                                 <div className="text-orange-600 text-xs">{new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                   year: 'numeric', 
                                   month: 'short', 
                                   day: 'numeric',
                                   hour: '2-digit',
                                   minute: '2-digit'
                                 })}</div>
                               </div>
                             </div>
                                                         <motion.p
                               whileHover={{ x: 2 }}
                               className="text-black text-xs leading-relaxed"
                             >
                               {comment.content}
                             </motion.p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Add Comment with glassmorphism */}
                      {user && (
                                                 <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.3 }}
                           className="backdrop-blur-xl bg-white/30 rounded-xl p-4 border border-white/30 relative overflow-hidden hover:bg-orange-50/50"
                         >
                           <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl"></div>
                           <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
                           
                           <div className="relative z-10">
                             <label className="block text-xs font-semibold text-orange-700 mb-2">Add a Comment</label>
                             <div className="flex space-x-3">
                               <motion.div
                                 whileFocus={{ scale: 1.02 }}
                                 className="flex-1 relative"
                               >
                                 <input
                                   type="text"
                                   placeholder="Share your thoughts on this post..."
                                   value={comment}
                                   onChange={(e) => setComment(e.target.value)}
                                   className="w-full px-3 py-2 bg-white/80 border border-gray-200/50 rounded-lg text-orange-800 placeholder-orange-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200/30 transition-all duration-300 text-xs backdrop-blur-sm"
                                 />
                                 {/* Focus indicator */}
                                 <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                               </motion.div>
                               <motion.button
                                 whileHover={{ 
                                   scale: 1.05, 
                                   y: -1,
                                   boxShadow: "0 6px 15px rgba(249, 115, 22, 0.3)"
                                 }}
                                 whileTap={{ scale: 0.95 }}
                                 onClick={() => handleComment(post.id)}
                                 className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-md transition-all duration-300 text-xs relative overflow-hidden group"
                               >
                                 {/* Shimmer effect */}
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                 <span className="relative">Comment</span>
                               </motion.button>
                             </div>
                           </div>
                         </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-12"
            >
              <div className="text-orange-700">
                <motion.p
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl mb-3"
                >
                  No posts available yet.
                </motion.p>
                <p className="text-sm mb-6">Be the first to share your thoughts!</p>
                {user && (
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: "0 15px 35px rgba(249, 115, 22, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 text-base relative overflow-hidden group"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative">Create First Post</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}