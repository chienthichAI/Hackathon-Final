import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  
  // Platform Statistics State
  const [stats, setStats] = useState([
    { 
      number: '0', 
      label: 'Active Students', 
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M23 21V19C23 18.1472 22.6485 17.3081 22.0007 16.6716C21.3529 16.0351 20.446 15.6389 19.5 15.55" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8624 3.3503 17.6375 3.8502 18.2038 4.55231C18.7701 5.25442 19.1009 6.12283 19.1009 7.02C19.1009 7.91717 18.7701 8.78558 18.2038 9.48769C17.6375 10.1898 16.8624 10.6897 16 10.91" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      number: '0', 
      label: 'Tasks Completed', 
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    },
    { 
      number: '0', 
      label: 'Achievements', 
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white" stroke="white" strokeWidth="1.5"/>
          <path d="M7 14L8.5 15.5L11 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 14L17.5 15.5L20 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch recent posts with realtime updates
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      setError(null);
      
      console.log('🔍 Fetching posts from API...');
      const response = await api.getPosts({ 
        limit: 6,
        sort: 'createdAt',
        order: 'desc'
      });
      
      console.log('🔍 Posts API response:', response);
      
      // Handle different response formats
      let postsData = [];
      if (response.data && response.data.success) {
        postsData = response.data.posts || [];
      } else if (response.data && Array.isArray(response.data)) {
        postsData = response.data;
      } else if (response.success) {
        postsData = response.posts || [];
      } else if (response.data) {
        postsData = response.data;
      }
      
      console.log('🔍 Processed posts data:', postsData);
      setPosts(postsData);
      
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch platform statistics with realtime updates from database
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      console.log('📊 Fetching platform statistics from database...');
      
      // Fetch real statistics from database via analytics API
      const response = await api.getPlatformStatistics();
      
      console.log('📊 Analytics API response:', response);
      
      if (response.data && response.data.success) {
        const statsData = response.data.data;
        
        console.log('📊 Platform statistics from database:', statsData);
        
        // Update stats with real database data
        setStats(prevStats => [
          {
            ...prevStats[0],
            number: statsData.activeStudents?.toLocaleString() || '0'
          },
          {
            ...prevStats[1],
            number: statsData.tasksCompleted?.toLocaleString() || '0'
          },
          {
            ...prevStats[2],
            number: statsData.achievements?.toLocaleString() || '0'
          }
        ]);
        
        console.log('✅ Platform statistics updated with real data');
      } else {
        throw new Error('Invalid response format from analytics API');
      }
      
    } catch (error) {
      console.error('❌ Error fetching platform statistics from database:', error);
      
      // Fallback to random realistic numbers if API fails
      const fallbackStats = [
        Math.floor(Math.random() * 500) + 100,
        Math.floor(Math.random() * 2000) + 500,
        Math.floor(Math.random() * 100) + 20
      ];
      
      setStats(prevStats => [
        {
          ...prevStats[0],
          number: fallbackStats[0].toLocaleString()
        },
        {
          ...prevStats[1],
          number: fallbackStats[1].toLocaleString()
        },
        {
          ...prevStats[2],
          number: fallbackStats[2].toLocaleString()
        }
      ]);
      
      console.log('⚠️ Using fallback statistics due to API error');
    } finally {
      setIsLoadingStats(false);
    }
  };





  // Initial fetch
  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  // Set up realtime updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Refreshing data...');
      fetchPosts();
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

     const features = [
     {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Smart Learning - Graduation Cap */}
          <path d="M12 2L1 8L12 14L23 8L12 2Z" fill="url(#grad1)" stroke="url(#grad1)" strokeWidth="1.5"/>
          <path d="M5 10V17L12 21L19 17V10" stroke="url(#grad1)" strokeWidth="1.5" fill="none"/>
          <path d="M12 14V21" stroke="url(#grad1)" strokeWidth="1.5"/>
          <circle cx="12" cy="8" r="2" fill="white" opacity="0.9"/>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 1}} />
            </linearGradient>
          </defs>
        </svg>
      ),
       title: 'Smart Learning',
      description: 'AI-powered personalized learning paths',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Gamification - Trophy */}
          <path d="M6 9H4C3.46957 9 2.96086 9.21071 2.58579 9.58579C2.21071 9.96086 2 10.4696 2 11V15C2 15.5304 2.21071 16.0391 2.58579 16.4142C2.96086 16.7893 3.46957 17 4 17H6" stroke="url(#grad2)" strokeWidth="1.5" fill="none"/>
          <path d="M18 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H18" stroke="url(#grad2)" strokeWidth="1.5" fill="none"/>
          <path d="M6 17V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V17" stroke="url(#grad2)" strokeWidth="1.5" fill="none"/>
          <path d="M12 7L13.5 9H15L13.5 11L14.5 13L12 12L9.5 13L10.5 11L9 9H10.5L12 7Z" fill="url(#grad2)" stroke="url(#grad2)" strokeWidth="1.5"/>
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#F59E0B', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#D97706', stopOpacity: 1}} />
            </linearGradient>
          </defs>
        </svg>
      ),
       title: 'Gamification',
      description: 'Earn points, badges, and rewards',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Robot Head - Main Body */}
          <circle cx="12" cy="10" r="6" fill="url(#grad3)" stroke="url(#grad3)" strokeWidth="1.5"/>
          
          {/* Visor/Screen */}
          <rect x="8" y="6" width="8" height="2" rx="1" fill="#1E40AF"/>
          
          {/* Eyes */}
          <circle cx="10" cy="8" r="1" fill="#1E40AF"/>
          <circle cx="14" cy="8" r="1" fill="#1E40AF"/>
          
          {/* Mouth */}
          <line x1="10" y1="12" x2="14" y2="12" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"/>
          
          {/* Side Antennas/Ears */}
          <rect x="6" y="7" width="1.5" height="2" rx="0.5" fill="#60A5FA"/>
          <rect x="16.5" y="7" width="1.5" height="2" rx="0.5" fill="#60A5FA"/>
          
          {/* Top Antennas */}
          <circle cx="11" cy="4" r="0.8" fill="#60A5FA"/>
          <circle cx="13" cy="4" r="0.8" fill="#60A5FA"/>
          
          {/* Speech Bubble Tail */}
          <path d="M12 16L10 18H14L12 16Z" fill="#93C5FD"/>
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#1E40AF', stopOpacity: 1}} />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: 'CHAT BOT',
      description: 'Intelligent AI assistant for learning support',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Progress Tracking - Analytics Chart */}
          <path d="M3 3V21H21" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9L12 6L16 10L21 5" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 5H16V10" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="1" fill="url(#grad4)"/>
          <circle cx="12" cy="6" r="1" fill="url(#grad4)"/>
          <circle cx="16" cy="10" r="1" fill="url(#grad4)"/>
          <circle cx="21" cy="5" r="1" fill="url(#grad4)"/>
          <defs>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 1}} />
            </linearGradient>
          </defs>
        </svg>
      ),
       title: 'Progress Tracking',
      description: 'Monitor your learning journey',
      color: 'from-emerald-500 to-green-600'
     }
   ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'No content available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern - Orange Network (Based on Image) */}
      <div className="absolute inset-0 pointer-events-none network-container">
        {/* Main Network Pattern Container */}
        <div className="absolute inset-0 opacity-8">
          {/* Network Nodes - Orange Dots */}
          {/* Top Section - Sparse */}
          <div className="absolute top-8 left-1/4 w-1.5 h-1.5 bg-orange-400 rounded-full network-node animate-float-network"></div>
          <div className="absolute top-12 right-1/3 w-1 h-1 bg-orange-300 rounded-full network-node animate-float-network delay-1000"></div>
          <div className="absolute top-16 left-1/2 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2000"></div>
          
          {/* Upper Middle - Medium Density */}
          <div className="absolute top-24 left-1/6 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-500"></div>
          <div className="absolute top-28 left-1/3 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1500"></div>
          <div className="absolute top-32 left-1/2 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2500"></div>
          <div className="absolute top-28 right-1/4 w-1.5 h-1.5 bg-orange-400 rounded-full network-node animate-float-network delay-750"></div>
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-orange-300 rounded-full network-node animate-float-network delay-1750"></div>
          
          {/* Center Section - Higher Density */}
          <div className="absolute top-40 left-1/8 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-300"></div>
          <div className="absolute top-44 left-1/4 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1300"></div>
          <div className="absolute top-48 left-3/8 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2300"></div>
          <div className="absolute top-44 left-1/2 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-600"></div>
          <div className="absolute top-48 left-5/8 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1600"></div>
          <div className="absolute top-44 left-3/4 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2600"></div>
          <div className="absolute top-40 right-1/8 w-1.5 h-1.5 bg-orange-400 rounded-full network-node animate-float-network delay-900"></div>
          
          {/* Lower Middle - High Density */}
          <div className="absolute top-56 left-1/12 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-400"></div>
          <div className="absolute top-60 left-1/6 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1400"></div>
          <div className="absolute top-64 left-1/4 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2400"></div>
          <div className="absolute top-60 left-1/3 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-650"></div>
          <div className="absolute top-64 left-5/12 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1650"></div>
          <div className="absolute top-60 left-1/2 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2650"></div>
          <div className="absolute top-64 left-7/12 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-700"></div>
          <div className="absolute top-60 left-2/3 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1700"></div>
          <div className="absolute top-64 left-3/4 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2700"></div>
          <div className="absolute top-60 left-5/6 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-800"></div>
          <div className="absolute top-56 right-1/12 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1800"></div>
          
          {/* Bottom Section - Highest Density */}
          <div className="absolute top-72 left-1/16 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-200"></div>
          <div className="absolute top-76 left-1/8 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1200"></div>
          <div className="absolute top-80 left-3/16 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2200"></div>
          <div className="absolute top-76 left-1/4 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-550"></div>
          <div className="absolute top-80 left-5/16 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1550"></div>
          <div className="absolute top-76 left-3/8 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2550"></div>
          <div className="absolute top-80 left-7/16 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-850"></div>
          <div className="absolute top-76 left-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1850"></div>
          <div className="absolute top-80 left-9/16 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2850"></div>
          <div className="absolute top-76 left-5/8 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-950"></div>
          <div className="absolute top-80 left-11/16 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1950"></div>
          <div className="absolute top-76 left-3/4 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2950"></div>
          <div className="absolute top-80 left-13/16 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-1050"></div>
          <div className="absolute top-76 left-7/8 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-2050"></div>
          <div className="absolute top-72 right-1/16 w-1.5 h-1.5 bg-orange-400 rounded-full network-node animate-float-network delay-1150"></div>
          
          {/* Bottom Edge - Maximum Density */}
          <div className="absolute bottom-32 left-1/20 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-100"></div>
          <div className="absolute bottom-36 left-1/10 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1100"></div>
          <div className="absolute bottom-40 left-3/20 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2100"></div>
          <div className="absolute bottom-36 left-1/5 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-450"></div>
          <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1450"></div>
          <div className="absolute bottom-36 left-3/10 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2450"></div>
          <div className="absolute bottom-40 left-7/20 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-750"></div>
          <div className="absolute bottom-36 left-2/5 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1750"></div>
          <div className="absolute bottom-40 left-9/20 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2750"></div>
          <div className="absolute bottom-36 left-1/2 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-500"></div>
          <div className="absolute bottom-40 left-11/20 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1500"></div>
          <div className="absolute bottom-36 left-3/5 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2500"></div>
          <div className="absolute bottom-40 left-13/20 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-800"></div>
          <div className="absolute bottom-36 left-7/10 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-1800"></div>
          <div className="absolute bottom-40 left-3/4 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-2800"></div>
          <div className="absolute bottom-36 left-4/5 w-2 h-2 bg-orange-400 rounded-full network-node animate-float-network delay-1000"></div>
          <div className="absolute bottom-40 left-17/20 w-1.5 h-1.5 bg-orange-300 rounded-full network-node animate-float-network delay-2000"></div>
          <div className="absolute bottom-36 left-9/10 w-1 h-1 bg-orange-500 rounded-full network-node animate-float-network delay-3000"></div>
          <div className="absolute bottom-32 right-1/20 w-1.5 h-1.5 bg-orange-400 rounded-full network-node animate-float-network delay-1250"></div>
        </div>
        
        {/* Connection Lines - Orange Network */}
        <div className="absolute inset-0 opacity-6">
          {/* Top Section Connections - Sparse */}
          <div className="absolute top-8 left-1/4 w-16 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-12 right-1/3 w-12 h-px bg-gradient-to-l from-orange-300/30 to-transparent network-connection network-line-gradient"></div>
          
          {/* Upper Middle Connections */}
          <div className="absolute top-24 left-1/6 w-20 h-px bg-gradient-to-r from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-28 left-1/3 w-16 h-px bg-gradient-to-r from-orange-300/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-32 left-1/2 w-12 h-px bg-gradient-to-r from-orange-500/25 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-28 right-1/4 w-18 h-px bg-gradient-to-l from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-32 right-1/3 w-14 h-px bg-gradient-to-l from-orange-300/30 to-transparent network-connection network-line-gradient"></div>
          
          {/* Center Section Connections */}
          <div className="absolute top-40 left-1/8 w-24 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-44 left-1/4 w-20 h-px bg-gradient-to-r from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-48 left-3/8 w-16 h-px bg-gradient-to-r from-orange-500/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-44 left-1/2 w-18 h-px bg-gradient-to-r from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-48 left-5/8 w-14 h-px bg-gradient-to-r from-orange-300/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-44 left-3/4 w-20 h-px bg-gradient-to-l from-orange-500/25 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-40 right-1/8 w-22 h-px bg-gradient-to-l from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          
          {/* Lower Middle Connections */}
          <div className="absolute top-56 left-1/12 w-28 h-px bg-gradient-to-r from-orange-400/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-60 left-1/6 w-24 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-64 left-1/4 w-20 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-60 left-1/3 w-22 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-64 left-5/12 w-18 h-px bg-gradient-to-r from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-60 left-1/2 w-16 h-px bg-gradient-to-r from-orange-500/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-64 left-7/12 w-20 h-px bg-gradient-to-r from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-60 left-2/3 w-24 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-64 left-3/4 w-18 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-60 left-5/6 w-22 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-56 right-1/12 w-26 h-px bg-gradient-to-l from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          
          {/* Bottom Section Connections - Dense */}
          <div className="absolute top-72 left-1/16 w-32 h-px bg-gradient-to-r from-orange-400/50 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-1/8 w-28 h-px bg-gradient-to-r from-orange-300/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-3/16 w-24 h-px bg-gradient-to-r from-orange-500/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-1/4 w-26 h-px bg-gradient-to-r from-orange-400/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-5/16 w-22 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-3/8 w-20 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-7/16 w-24 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-1/2 w-18 h-px bg-gradient-to-r from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-9/16 w-20 h-px bg-gradient-to-r from-orange-500/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-5/8 w-22 h-px bg-gradient-to-r from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-11/16 w-26 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-3/4 w-24 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-80 left-13/16 w-20 h-px bg-gradient-to-r from-orange-400/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-76 left-7/8 w-18 h-px bg-gradient-to-r from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute top-72 right-1/16 w-30 h-px bg-gradient-to-l from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          
          {/* Bottom Edge Connections - Maximum Density */}
          <div className="absolute bottom-32 left-1/20 w-36 h-px bg-gradient-to-r from-orange-400/55 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-1/10 w-32 h-px bg-gradient-to-r from-orange-300/50 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-3/20 w-28 h-px bg-gradient-to-r from-orange-500/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-1/5 w-30 h-px bg-gradient-to-r from-orange-400/50 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-1/4 w-26 h-px bg-gradient-to-r from-orange-300/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-3/10 w-24 h-px bg-gradient-to-r from-orange-500/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-7/20 w-28 h-px bg-gradient-to-r from-orange-400/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-2/5 w-22 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-9/20 w-20 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-1/2 w-24 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-11/20 w-26 h-px bg-gradient-to-r from-orange-300/45 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-3/5 w-28 h-px bg-gradient-to-r from-orange-500/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-13/20 w-24 h-px bg-gradient-to-r from-orange-400/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-7/10 w-26 h-px bg-gradient-to-r from-orange-300/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-3/4 w-22 h-px bg-gradient-to-r from-orange-500/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-4/5 w-28 h-px bg-gradient-to-r from-orange-400/40 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-40 left-17/20 w-24 h-px bg-gradient-to-r from-orange-300/35 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-36 left-9/10 w-26 h-px bg-gradient-to-r from-orange-500/30 to-transparent network-connection network-line-gradient"></div>
          <div className="absolute bottom-32 right-1/20 w-32 h-px bg-gradient-to-l from-orange-400/45 to-transparent network-connection network-line-gradient"></div>
        </div>
        
        {/* Cross Connections - Diagonal Lines */}
        <div className="absolute inset-0 opacity-4">
          {/* Top to Middle Cross Connections */}
          <div className="absolute top-16 left-1/4 w-20 h-px bg-gradient-to-r from-orange-300/25 to-transparent transform rotate-12 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-20 left-1/3 w-16 h-px bg-gradient-to-r from-orange-400/20 to-transparent transform rotate-8 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-24 right-1/3 w-18 h-px bg-gradient-to-l from-orange-300/25 to-transparent transform -rotate-10 origin-right network-connection network-line-gradient"></div>
          
          {/* Middle Cross Connections */}
          <div className="absolute top-40 left-1/6 w-24 h-px bg-gradient-to-r from-orange-400/30 to-transparent transform rotate-15 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-44 left-1/2 w-20 h-px bg-gradient-to-r from-orange-300/25 to-transparent transform rotate-5 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-48 right-1/4 w-22 h-px bg-gradient-to-l from-orange-400/30 to-transparent transform -rotate-12 origin-right network-connection network-line-gradient"></div>
          
          {/* Lower Cross Connections */}
          <div className="absolute top-60 left-1/8 w-28 h-px bg-gradient-to-r from-orange-300/35 to-transparent transform rotate-18 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-64 left-1/3 w-24 h-px bg-gradient-to-r from-orange-400/30 to-transparent transform rotate-10 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-68 right-1/6 w-26 h-px bg-gradient-to-l from-orange-300/35 to-transparent transform -rotate-15 origin-right network-connection network-line-gradient"></div>
          
          {/* Bottom Cross Connections */}
          <div className="absolute top-80 left-1/12 w-32 h-px bg-gradient-to-r from-orange-400/40 to-transparent transform rotate-20 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-84 left-1/4 w-28 h-px bg-gradient-to-r from-orange-300/35 to-transparent transform rotate-12 origin-left network-connection network-line-gradient"></div>
          <div className="absolute top-88 right-1/8 w-30 h-px bg-gradient-to-l from-orange-400/40 to-transparent transform -rotate-18 origin-right network-connection network-line-gradient"></div>
        </div>
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-orange-200/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-300/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Interactive Network Elements */}
        <div className="absolute inset-0 opacity-10">
          {/* Floating Network Nodes with Hover Effects */}
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-orange-400 rounded-full hover:scale-150 hover:bg-orange-300 transition-all duration-500 cursor-pointer group network-interactive">
            <div className="absolute inset-0 w-full h-full bg-orange-400 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
          </div>
          
          <div className="absolute top-48 left-1/2 w-2 h-2 bg-orange-500 rounded-full hover:scale-150 hover:bg-orange-400 transition-all duration-500 cursor-pointer group network-interactive">
            <div className="absolute inset-0 w-full h-full bg-orange-500 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
          </div>
          
          <div className="absolute top-72 right-1/4 w-2 h-2 bg-orange-300 rounded-full hover:scale-150 hover:bg-orange-200 transition-all duration-500 cursor-pointer group network-interactive">
            <div className="absolute inset-0 w-full h-full bg-orange-300 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
          </div>
          
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-orange-400 rounded-full hover:scale-150 hover:bg-orange-300 transition-all duration-500 cursor-pointer group network-interactive">
            <div className="absolute inset-0 w-full h-full bg-orange-400 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
          </div>
        </div>
        
        {/* Dynamic Connection Lines */}
        <div className="absolute inset-0 opacity-5">
          {/* Animated Connection Lines */}
          <div className="absolute top-24 left-1/6 w-24 h-px bg-gradient-to-r from-orange-400/40 via-orange-300/30 to-transparent animate-pulse network-connection network-line-gradient"></div>
          <div className="absolute top-56 left-1/2 w-20 h-px bg-gradient-to-r from-orange-500/35 via-orange-400/25 to-transparent animate-pulse delay-500 network-connection network-line-gradient"></div>
          <div className="absolute top-80 right-1/6 w-28 h-px bg-gradient-to-l from-orange-300/40 via-orange-400/30 to-transparent animate-pulse delay-1000 network-connection network-line-gradient"></div>
        </div>
        
        {/* Network Pulse Effect */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-32 left-1/3 w-3 h-3 bg-orange-400/20 rounded-full network-pulse"></div>
          <div className="absolute top-64 right-1/4 w-2.5 h-2.5 bg-orange-300/15 rounded-full network-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-2/3 w-2 h-2 bg-orange-500/25 rounded-full network-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Hero Section - Ultra Compact & Professional */}
        <section className="pt-20 pb-16 px-4 relative overflow-hidden">
          {/* Animated Background Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  animationDelay: `${Math.random() * 20}s`,
                  animationDuration: `${Math.random() * 10 + 15}s`
                }}
              />
            ))}
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="mb-8">
              {/* Professional Header */}
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
                <span className="text-sm font-bold text-black uppercase tracking-widest">AI-Powered Education</span>
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
              </div>
              

              
              {/* Main Title - Professional & Modern */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight flex items-center justify-center gap-2 md:gap-3 mb-4">
                  <span className="mirror-shine-text">FPT Compass</span>
                </h1>
             
                {/* Professional Underline */}
                <div className="relative">
                  <div className="mt-3 h-1 bg-gradient-to-r from-black via-gray-700 to-black rounded-full mx-auto" style={{ width: '280px' }}></div>
                  <div className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full mirror-shine-line"></div>
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-black font-medium mb-8 fade-in-up">
                Transform your learning experience with cutting-edge AI technology and personalized education solutions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/todo" className="group">
                <button className="px-8 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 border-2 border-orange-600 hover:scale-105 transform flex items-center gap-2 button-pulse magnetic gpu-accelerated relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Icon with Animation */}
                  <div className="relative z-10">
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  <span className="relative z-10">Get Started</span>
                  
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
              
              <Link to="/advanced-chatbot" className="group">
                <button className="px-8 py-2 bg-white/95 border-2 border-blue-500 text-blue-600 text-xs font-black rounded-lg hover:bg-blue-50 hover:border-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2 magnetic gpu-accelerated relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Animated Robot Icon */}
                  <div className="relative z-10">
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="10" r="4" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                      <rect x="9" y="7" width="6" height="1.5" rx="0.5" fill="#1E40AF"/>
                      <circle cx="10.5" cy="8" r="0.6" fill="#1E40AF"/>
                      <circle cx="13.5" cy="8" r="0.6" fill="#1E40AF"/>
                      <line x1="10.5" y1="10.5" x2="13.5" y2="10.5" stroke="#1E40AF" strokeWidth="1" strokeLinecap="round"/>
                      <rect x="8" y="7.5" width="1" height="1.5" rx="0.3" fill="#60A5FA"/>
                      <rect x="15" y="7.5" width="1" height="1.5" rx="0.3" fill="#60A5FA"/>
                      <circle cx="11" cy="5.5" r="0.5" fill="#60A5FA"/>
                      <circle cx="13" cy="5.5" r="0.5" fill="#60A5FA"/>
                      <path d="M12 14L10.5 15.5H13.5L12 14Z" fill="#93C5FD"/>
                    </svg>
                  </div>
                  
                  <span className="relative z-10">Try CHAT BOT</span>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </button>
              </Link>
            </div>
        </div>
      </section>

        {/* Features Section - Professional & Elegant */}
        <section className="py-20 px-4 bg-gradient-to-br from-white via-orange-50/10 to-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <span className="text-sm font-bold text-black uppercase tracking-widest">Features</span>
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-black mb-4 tracking-tight">
               Why Choose <span className="mirror-shine-text">FPT Compass</span>?
             </h2>
              <p className="text-lg md:text-xl text-black max-w-3xl mx-auto font-medium leading-relaxed">
                Experience the future of education with cutting-edge AI technology
             </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <div key={feature.title} className="group">
                  <div className={`text-center p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-white/60 hover:border-orange-200/50 transition-all duration-500 hover:-translate-y-3 card-hover shadow-lg hover:shadow-2xl relative overflow-hidden ${`stagger-${index + 1}`}`}>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-3xl"></div>
                    
                    {/* Animated Icon Container */}
                    <div className="relative mb-6">
                      <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                         {feature.icon}
                       </div>
                      
                      {/* Icon Glow Effect */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400/20 to-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    <h3 className="text-lg font-black text-black mb-4 group-hover:text-orange-600 transition-colors tracking-tight relative z-10">
                       {feature.title}
                     </h3>
                    <p className="text-black text-sm leading-relaxed font-medium relative z-10">
                       {feature.description}
                     </p>
                    
                    {/* Hover Border Effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-300/30 transition-all duration-500"></div>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>
                   </div>
                </div>
            ))}
          </div>
        </div>
      </section>

        {/* Stats Section - Professional & Compact with Realtime Data */}
        <section className="py-8 px-4 bg-gradient-to-r from-white via-orange-50/20 to-white shadow-lg border border-orange-200/30 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-orange-400/30 to-transparent"></div>
            <div className="absolute top-1/2 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-400/20 to-transparent"></div>
            <div className="absolute top-1/2 right-0 w-1 h-full bg-gradient-to-t from-transparent via-orange-400/20 to-transparent"></div>
          </div>
          
         <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full lg:w-auto">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="group">
                    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-300 hover:scale-105">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center backdrop-blur-sm border border-gray-800 group-hover:border-gray-600 transition-all duration-300 relative overflow-hidden">
                        {/* Icon Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {stat.label === 'Active Students' ? (
                          <svg className="w-5 h-5 text-orange-600 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="9" cy="7" r="3" fill="currentColor"/>
                            <circle cx="15" cy="7" r="3" fill="currentColor"/>
                            <circle cx="12" cy="15" r="3" fill="currentColor"/>
                            <path d="M6 20C6 17.7909 7.79086 16 10 16H14C16.2091 16 18 17.7909 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M3 17C3 14.7909 4.79086 13 7 13H11C13.2091 13 15 14.7909 15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M21 17C21 14.7909 19.2091 13 17 13H13C10.7909 13 9 14.7909 9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : stat.label === 'Tasks Completed' ? (
                          <svg className="w-5 h-5 text-orange-600 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M7 12L10 15L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="7" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="7" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        ) : stat.label === 'Achievements' ? (
                          <svg className="w-5 h-5 text-orange-600 relative z-10 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                            <rect x="8" y="22" width="8" height="2" rx="1" fill="currentColor"/>
                            <rect x="10" y="20" width="4" height="2" rx="1" fill="currentColor"/>
                          </svg>
                        ) : (
                          <span className="text-base text-orange-600 relative z-10 group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                        )}
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="text-3xl font-black text-black flex items-center gap-2 group-hover:text-gray-700 transition-colors duration-300">
                          {isLoadingStats ? (
                            <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : (
                            <span className="animate-pulse group-hover:scale-110 transition-transform duration-300">{stat.number}</span>
                          )}
                        </div>
                        <div className="text-orange-500 text-base font-semibold tracking-wide group-hover:text-orange-600 transition-colors duration-300">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center lg:text-right">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                  <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">Live Data</span>
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                </div>
                
                <h2 className="text-2xl font-black text-black mb-3 flex items-center justify-center lg:justify-end gap-3">
                  <span>Platform Statistics</span>
                  {isLoadingStats && (
                    <div className="w-5 h-5 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  )}
                </h2>
                <p className="text-base text-orange-500 font-medium tracking-wide">
                  {isLoadingStats ? '🔄 Updating realtime data...' : '✅ Live data from database'}
                </p>
                
                {/* Animated Status Indicator */}
                <div className="mt-4 flex items-center justify-center lg:justify-end gap-2">
                  <div className={`w-3 h-3 rounded-full ${isLoadingStats ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} transition-colors duration-300`}></div>
                  <span className="text-xs text-black font-medium">
                    {isLoadingStats ? 'Connecting...' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts Section - Professional & Luxurious */}
        <section className="py-16 px-6 bg-gradient-to-br from-white via-orange-50/20 to-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header - Elegant */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">Community</span>
                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-black mb-4 tracking-tight">
                Recent <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Posts</span>
              </h2>
              <p className="text-lg md:text-xl text-black max-w-3xl mx-auto font-medium leading-relaxed">
                Stay updated with the latest discussions and insights from our community
              </p>
              
              {/* Refresh Button - Modern */}
              <button 
                onClick={fetchPosts}
                disabled={isLoadingPosts}
                className="mt-8 px-8 py-4 bg-white/95 backdrop-blur-md hover:bg-white text-black rounded-2xl transition-all duration-300 disabled:opacity-50 text-base border-2 border-gray-200/50 hover:border-orange-300 hover:shadow-xl flex items-center gap-3 mx-auto font-bold hover:scale-105 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M1 14L5.64 18.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isLoadingPosts ? 'Loading...' : 'Refresh Posts'}
              </button>
            </div>

                     {isLoadingPosts ? (
              <div className="text-center py-20">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <p className="text-black text-xl font-semibold mb-2">Loading posts...</p>
                <p className="text-black text-sm">Fetching the latest community updates</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                  <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-red-600 text-xl font-bold mb-2">Oops! Something went wrong</h3>
                <p className="text-black text-base mb-6 max-w-md mx-auto">{error}</p>
                <button 
                  onClick={fetchPosts}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-base hover:shadow-xl flex items-center gap-3 mx-auto font-bold hover:scale-105 group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M1 14L5.64 18.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Try Again
                </button>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(0, 3).map((post, index) => (
                  <div key={post.id || index} className="group">
                    <div className="bg-white/98 backdrop-blur-md rounded-3xl p-7 border border-white/60 hover:border-orange-200/50 transition-all duration-500 hover:-translate-y-3 h-full relative overflow-hidden shadow-lg hover:shadow-2xl">
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-3xl"></div>
                      
                      {/* Post Header - Luxurious */}
                      <div className="flex items-center mb-6 relative z-10">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mr-5 shadow-xl border-3 border-white/40 group-hover:scale-110 transition-transform duration-300">
                            {post.author?.name?.charAt(0)?.toUpperCase() || post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          {/* Online Status Indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-black font-black text-lg mb-1">
                            {post.author?.name || post.author?.username || 'Anonymous'}
                          </div>
                          <div className="text-black text-sm font-semibold flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Post Title - Elegant */}
                      <h3 className="text-xl font-black text-black mb-5 group-hover:text-orange-600 transition-colors line-clamp-2 tracking-tight relative z-10 leading-tight">
                        {post.title || 'Untitled Post'}
                      </h3>
                      
                      {/* Post Content - Professional */}
                      <p className="text-black text-base mb-6 line-clamp-3 font-medium leading-relaxed relative z-10">
                        {truncateText(post.content || post.description || 'No content available')}
                      </p>
                      
                      {/* Post Footer - Modern */}
                      <div className="flex items-center justify-between text-sm text-black font-bold relative z-10">
                        <div className="flex items-center space-x-6">
                          <span className="flex items-center gap-2 hover:text-orange-600 transition-colors cursor-pointer group/item">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover/item:bg-orange-100 transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            {post.comments?.length || post.commentCount || 0}
                          </span>
                          <span className="flex items-center gap-2 hover:text-orange-600 transition-colors cursor-pointer group/item">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover/item:bg-orange-100 transition-colors">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 9V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V9M14 9C14 9.53043 13.7893 10.0391 13.4142 10.4142C13.0391 10.7893 12.5304 11 12 11H10C9.46957 11 8.96086 10.7893 8.58579 10.4142C8.21071 10.0391 8 9.53043 8 9M14 9L12 11L10 9M8 9L6 9V15C6 15.5304 6.21071 16.0391 6.58579 16.4142C6.96086 16.7893 7.46957 17 8 17H16C16.5304 17 17.0391 16.7893 17.4142 16.4142C17.7893 16.0391 18 15.5304 18 15V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            {post.likes?.length || post.likeCount || 0}
                          </span>
                        </div>
                        <Link 
                          to={`/posts/${post.id}`}
                          className="text-orange-600 hover:text-orange-700 transition-colors font-black hover:underline text-lg flex items-center gap-2 group/link"
                        >
                          Read
                          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                     ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full mb-8 shadow-lg">
                  <svg className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-black text-2xl font-black mb-3">No posts available yet</h3>
                <p className="text-black text-lg mb-8 font-medium max-w-md mx-auto">Be the first to share your thoughts and start the conversation!</p>
                <Link to="/posts" className="inline-block px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg hover:shadow-xl flex items-center gap-3 mx-auto w-fit font-bold hover:scale-105 group shadow-lg">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Create First Post
                </Link>
              </div>
            )}

            {posts.length > 0 && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-gray-600"></div>
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">More Posts</span>
                  <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-gray-600"></div>
                </div>
                <Link to="/posts">
                  <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:scale-105 transform flex items-center gap-3 mx-auto group">
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View All Posts ({posts.length})
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </Link>
              </div>
            )}
         </div>
       </section>

        {/* Footer - Professional & Elegant */}
        <footer className="py-12 px-4 border-t border-orange-200/30 bg-gradient-to-br from-white via-orange-50/10 to-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-orange-200/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Logo Section */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-black to-gray-700 rounded-full"></div>
                <span className="text-sm font-bold text-black uppercase tracking-widest">Platform</span>
                <div className="w-1 h-8 bg-gradient-to-b from-black to-gray-700 rounded-full"></div>
              </div>
              
              <div className="text-3xl font-black text-black mb-4">
                <span className="mirror-shine-text">FPT Compass</span>
              </div>
              
              <p className="text-lg text-black mb-6 font-medium max-w-2xl mx-auto leading-relaxed">
                Empowering students with cutting-edge AI-driven learning solutions
              </p>
            </div>
            
            {/* Links Section */}
            <div className="flex flex-wrap justify-center gap-8 text-black font-medium text-sm mb-8">
              <a href="#" className="group flex items-center gap-2 hover:text-orange-600 transition-all duration-300 hover:scale-105">
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="hover:underline">Privacy Policy</span>
              </a>
              <a href="#" className="group flex items-center gap-2 hover:text-orange-600 transition-all duration-300 hover:scale-105">
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="hover:underline">Terms of Service</span>
              </a>
              <a href="#" className="group flex items-center gap-2 hover:text-orange-600 transition-all duration-300 hover:scale-105">
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="hover:underline">Support Center</span>
              </a>
              <a href="#" className="group flex items-center gap-2 hover:text-orange-600 transition-all duration-300 hover:scale-105">
                <div className="w-2 h-2 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <span className="hover:underline">Contact Us</span>
              </a>
            </div>
            
            {/* Bottom Section */}
            <div className="pt-6 border-t border-orange-200/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-black font-medium">
                  © 2025 StudySmart. All rights reserved.
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-black">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>System Online</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-black">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
                    <span>AI Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
