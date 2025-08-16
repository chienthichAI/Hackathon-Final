import React, { useState, useEffect, useCallback } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StandaloneSpinWheel from '../components/gamification/StandaloneSpinWheel';
import CoinEarningSystem from '../components/gamification/CoinEarningSystem';
import DailyChallenge from '../components/gamification/DailyChallenge';
import ActivityFeed from '../components/gamification/ActivityFeed';
// import UltimatePetSystem from '../components/pets/UltimatePetSystem';
// import UltimateShopSystem from '../components/shop/UltimateShopSystem';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievements, getLeaderboard, getUserProgress, getMyRank } from '../api';
import { toast } from 'react-hot-toast';
import { 
  FaTrophy, 
  FaCoins, 
  FaGem, 
  FaStar, 
  FaFire, 
  FaChartLine, 
  FaUsers, 
  FaCalendar,
  FaBook,
  FaHeart,
  FaCrown,
  FaMedal,
  FaAward,
  FaGift,
  FaRocket,
  FaLightbulb,
  FaBullseye,
  FaCheckCircle,
  FaHistory,
  FaChartBar,
  FaBell,
  FaCog
} from 'react-icons/fa';

const MotionDiv = motion.create('div');
const MotionButton = motion.create('button');
const MotionCard = motion.create(Card);
import { CardBody } from '../components/ui/Card';

const GamificationNew = () => {
  const { user } = useAuth();
  const { userProgress, updateUserProgress } = useGamification();
  const [activeTab, setActiveTab] = useState('overview');
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  // const [showPetSystem, setShowPetSystem] = useState(false);
  // const [showShopSystem, setShowShopSystem] = useState(false);
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    coins: 0,
    gems: 0,
    streak: 0,
    totalTodos: 0,
    completedTodos: 0,
    completionRate: 0,
    nextLevelXp: 1000,
    totalStudyTime: 0,
    focusSessions: 0,
    achievementsCount: 0
  });

  // Daily challenge state
  const [dailyChallenge, setDailyChallenge] = useState({
    title: 'Complete 5 tasks today',
    progress: 0,
    target: 5,
    reward: { xp: 100, coins: 25 },
    type: 'complete_todos'
  });

  // Recent activity state
  const [recentActivity, setRecentActivity] = useState([]);

  // Tab configuration with improved icons and descriptions
  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: '📊', 
      description: 'Your gamification dashboard and progress overview',
      color: 'from-gray-800 to-black'
    },
    { 
      id: 'achievements', 
      name: 'Achievements', 
      icon: '🏆', 
      description: 'Unlock badges and rewards for your accomplishments',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'leaderboard', 
      name: 'Leaderboard', 
      icon: '🥇', 
      description: 'Compete with other learners and climb the ranks',
      color: 'from-purple-500 to-purple-600'
    },
    // { 
    //   id: 'advanced-pets', 
    //   name: 'Advanced Pets', 
    //   icon: '🐉', 
    //   description: 'Advanced pet companions and evolution system',
    //   color: 'from-green-500 to-green-600'
    // },
    // { 
    //   id: 'advanced-shop', 
    //   name: 'Advanced Shop', 
    //   icon: '🏪', 
    //   description: 'Premium items, themes, and exclusive rewards',
    //   color: 'from-indigo-500 to-indigo-600'
    // },
    { 
      id: 'rewards', 
      name: 'Daily Rewards', 
      icon: '🎁', 
      description: 'Spin the wheel and claim daily rewards',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'coin-earning', 
      name: 'Coin Earning', 
      icon: '💰', 
      description: 'Learn how to earn more coins and maximize rewards',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'challenges', 
      name: 'Daily Challenges', 
      icon: '🎯', 
      description: 'Complete daily challenges for bonus rewards',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 'activity', 
      name: 'Activity Feed', 
      icon: '📈', 
      description: 'Track your learning activities and progress history',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  // Manual refresh function
  const refreshStats = () => {
    toast.success('Refreshing stats...');
    fetchAllData();
  };

  // Fetch real daily challenges from API
  const fetchDailyChallenges = async () => {
    try {
      const response = await fetch('/api/gamification/daily-challenges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // setDailyChallenge(data.challenge || null); // This state variable was removed
        }
      }
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
    }
  };

  // Fetch real recent activities from API
  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/activity/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentActivity(data.activities || []);
        }
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  // Get progress percentage for challenges
  const getProgressPercentage = (current, target) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Handle tab change with animation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Add smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced refresh function with loading state
  const enhancedRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllData();
      toast.success('Stats refreshed successfully! 🎉');
    } catch (error) {
      toast.error('Failed to refresh stats');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get level progress percentage
  const getLevelProgress = () => {
    const currentLevelXP = (userStats.level - 1) * 1000;
    const currentLevelProgress = userStats.xp - currentLevelXP;
    const xpForNextLevel = userStats.nextLevelXp - currentLevelXP;
    return Math.min((currentLevelProgress / xpForNextLevel) * 100, 100);
  };

  // Get XP needed for next level
  const getXPForNextLevel = () => {
    return userStats.nextLevelXp - userStats.xp;
  };

  // Get streak status and rewards
  const getStreakStatus = () => {
    if (userStats.streak >= 30) return { status: 'legendary', reward: 500, icon: '👑' };
    if (userStats.streak >= 7) return { status: 'epic', reward: 100, icon: '🔥🔥🔥' };
    if (userStats.streak >= 3) return { status: 'rare', reward: 25, icon: '🔥🔥' };
    if (userStats.streak >= 1) return { status: 'common', reward: 10, icon: '🔥' };
    return { status: 'none', reward: 0, icon: '💤' };
  };

  // Get achievement count by rarity
  const getAchievementStats = () => {
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    
    return {
      total: achievements.length,
      unlocked: unlocked.length,
      locked: locked.length,
      completionRate: achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0
    };
  };

  // Get leaderboard position
  const getLeaderboardPosition = () => {
    if (!leaderboard.length) return null;
    const userIndex = leaderboard.findIndex(user => user.id === user?.id);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  // Get user's current rank from API
  const [userRank, setUserRank] = useState(null);
  
  const fetchUserRank = useCallback(async () => {
    try {
      const response = await getMyRank();
      if (response?.data?.success) {
        setUserRank(response.data.rank);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      console.log('🔄 Initializing comprehensive gamification data...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No authentication token found');
        setDataLoaded(true);
        setLoading(false);
        return;
      }
      
      // Fetch data in parallel for better performance
      const [progressRes, achievementsRes, leaderboardRes] = await Promise.allSettled([
        getUserProgress(),
        getAchievements(),
        getLeaderboard()
      ]);

      // Handle progress data
      if (progressRes.status === 'fulfilled' && progressRes.value?.data?.success) {
        const progressData = progressRes.value.data.progress;
        setUserStats({
          level: progressData.level || 1,
          xp: progressData.xp || 0,
          coins: progressData.coins || 0,
          gems: progressData.gems || 0,
          streak: progressData.streak || 0,
          totalTodos: progressData.totalTodos || 0,
          completedTodos: progressData.completedTodos || 0,
          completionRate: progressData.completionRate || 0,
          nextLevelXp: progressData.nextLevelXp || 1000,
          totalStudyTime: progressData.totalStudyTime || 0,
          focusSessions: progressData.focusSessions || 0,
          achievementsCount: progressData.achievementsCount || 0
        });
        console.log('✅ User progress loaded');
      }

      // Handle achievements data
      if (achievementsRes.status === 'fulfilled' && achievementsRes.value?.data?.success) {
        setAchievements(achievementsRes.value.data.achievements || []);
        console.log(`✅ Loaded ${achievementsRes.value.data.achievements?.length || 0} achievements`);
      }

      // Handle leaderboard data
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value?.data?.success) {
        setLeaderboard(leaderboardRes.value.data.leaderboard || []);
        console.log(`✅ Loaded ${leaderboardRes.value.data.leaderboard?.length || 0} leaderboard entries`);
      }

      // Fetch user rank separately
      await fetchUserRank();

      setDataLoaded(true);
      setLoading(false);
      console.log('✅ All gamification data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading gamification data:', error);
      setDataLoaded(true);
      setLoading(false);
    }
  }, [fetchUserRank]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu gamification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-32">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-lg text-gray-600">Loading your gamification data...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-40 max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Main Title */}
            <div className="mb-4 lg:mb-0">
                                <h1 className="text-3xl font-semibold text-black truncate">
                    🎮 Gamification Hub
                  </h1>
                  <p className="text-base text-gray-800 mt-1 break-words">
                    Level up your learning journey with achievements, rewards, and friendly competition
                  </p>
            </div>

            {/* User Stats Cards - Modern, compact and professional design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <MotionCard 
                className="bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <CardBody className="text-center p-2">
                  <div className="w-8 h-8 mx-auto mb-1 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">💰</span>
                  </div>
                  <div className="text-xl font-medium mb-1 text-gray-900">{userStats.coins}</div>
                  <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Coins</div>
                  
                  {/* Modern indicator dots */}
                  <div className="flex justify-center space-x-1">
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-80"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-60"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-40"></div>
                  </div>
                </CardBody>
              </MotionCard>
              
              <MotionCard 
                className="bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <CardBody className="text-center p-2">
                  <div className="w-8 h-8 mx-auto mb-1 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">⭐</span>
                  </div>
                  <div className="text-xl font-medium mb-1 text-gray-900">{userStats.gems}</div>
                  <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Games</div>
                  
                  {/* Modern indicator dots */}
                  <div className="flex justify-center space-x-1">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full opacity-80"></div>
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full opacity-60"></div>
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full opacity-40"></div>
                  </div>
                </CardBody>
              </MotionCard>
              
              <MotionCard 
                className="bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <CardBody className="text-center p-2">
                  <div className="w-8 h-8 mx-auto mb-1 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">🏆</span>
                  </div>
                  <div className="text-xl font-medium mb-1 text-gray-900">Lv.{userStats.level}</div>
                  <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Level</div>
                  
                  {/* Modern progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-1">
                    <div 
                      className="bg-black h-2.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                  
                  {/* Progress text */}
                  <div className="text-xs text-gray-600 font-medium">
                    {getLevelProgress().toFixed(1)}% Complete
                  </div>
                </CardBody>
              </MotionCard>
              
              <MotionCard 
                className="bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <CardBody className="text-center p-2">
                  <div className="w-8 h-8 mx-auto mb-1 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">⚡</span>
                  </div>
                  <div className="text-xl font-medium mb-1 text-gray-900">{userStats.xp}</div>
                  <div className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">XP</div>
                  
                  {/* Modern XP indicator */}
                  <div className="flex justify-center">
                    <div className="bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                      <span className="text-xs text-gray-700 font-medium">
                        +{getXPForNextLevel()} to Next
                      </span>
                    </div>
                  </div>
                </CardBody>
              </MotionCard>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <div className="w-full overflow-x-auto overflow-y-auto whitespace-normal break-words min-w-0 word-wrap break-words overflow-wrap-anywhere">
          {/* Tab Navigation */}
          <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <MotionButton
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
                whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={tab.description}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </MotionButton>
            ))}
          </div>
          
          {/* Enhanced Stats Bar */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-0.5 flex items-center space-x-3 border border-gray-100">
              <div className="text-center">
                <div className="text-base font-bold text-black">{userRank || 'N/A'}</div>
                <div className="text-xs text-gray-600">Rank</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-black">{getAchievementStats().completionRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-600">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-black">{getStreakStatus().icon}</div>
                <div className="text-xs text-gray-600">{userStats.streak} Days</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-black">{getXPForNextLevel()}</div>
                <div className="text-xs text-gray-600">XP to Next</div>
              </div>
            </div>
          </div>

          {/* Leaderboard Section - Right after stats bar */}
          <div className="mt-3">
            <Card className="bg-white shadow-sm">
              <CardBody className="p-0.5">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500 text-xl" />
                    Leaderboard
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Your Rank:</span>
                    <span className="text-sm font-bold text-blue-600">#{userRank || 'N/A'}</span>
                  </div>
                </div>
                
                {leaderboard.length > 0 ? (
                  <div className="space-y-2.5">
                    {/* Top 3 Users with special styling */}
                    {leaderboard.slice(0, 3).map((user, index) => (
                      <div key={user.id || index} className={`flex items-center p-2.5 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300' :
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300' :
                        index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border border-orange-300' :
                        'bg-gray-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 text-lg ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 flex items-center text-base">
                            {user.username || user.name || `User ${index + 1}`}
                            {user.id === user?.id && (
                              <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">You</span>
                            )}
                            {index < 3 && (
                              <span className={`ml-2 px-2 py-1 text-sm rounded-full ${
                                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                'bg-orange-100 text-orange-600'
                              }`}>
                                Top {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">Level {user.level || 1}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-blue-600">{user.xp || 0} XP</div>
                          <div className="text-sm text-gray-500">{user.streak || 0} days streak</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more users if available */}
                    {leaderboard.length > 3 && (
                      <>
                        <div className="text-center py-1.5">
                          <span className="text-base text-gray-500">...</span>
                        </div>
                        {leaderboard.slice(3, 8).map((user, index) => (
                          <div key={user.id || index + 3} className="flex items-center p-2.5 bg-gray-50 rounded-lg">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                              {index + 4}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 flex items-center text-base">
                                {user.username || user.name || `User ${index + 4}`}
                                {user.id === user?.id && (
                                  <span className="ml-2 px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">You</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">Level {user.level || 1}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-base text-blue-600">{user.xp || 0} XP</div>
                              <div className="text-sm text-gray-500">{user.streak || 0} days</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-5xl mb-3">🏆</div>
                    <div className="text-xl font-medium text-gray-900 mb-2">No leaderboard data yet</div>
                    <div className="text-base text-gray-600">Complete tasks and earn XP to climb the ranks!</div>
                  </div>
                )}
                
                {/* View All Leaderboard Button */}
                <div className="mt-1.5 text-center">
                  <button 
                    onClick={() => handleTabChange('leaderboard')}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-bold text-base"
                  >
                    View Full Leaderboard
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <MotionDiv
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >


              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5">
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardBody className="p-0.5 text-center">
                    <div className="text-xl mb-0.5">🔥</div>
                    <div className="text-lg font-black text-orange-600 drop-shadow-sm">{userStats.streak}</div>
                    <div className="text-xs font-bold text-gray-800">Day Streak</div>
                    <div className="text-xs font-semibold text-orange-600 mt-0.5">{userStats.streak > 0 ? `${userStats.streak} Days` : 'NONE'}</div>
                  </CardBody>
                </Card>

                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardBody className="p-0.5 text-center">
                    <div className="text-xl mb-0.5">✅</div>
                    <div className="text-lg font-black text-green-600 drop-shadow-sm">{getAchievementStats().completedTodos}</div>
                    <div className="text-xs font-bold text-gray-800">Tasks Completed</div>
                    <div className="text-xs font-semibold text-green-600 mt-0.5">{getAchievementStats().completionRate.toFixed(1)}% Rate</div>
                  </CardBody>
                </Card>

                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardBody className="p-0.5 text-center">
                    <div className="text-xl mb-0.5">⏰</div>
                    <div className="text-lg font-black text-blue-600 drop-shadow-sm">{Math.round(userStats.totalStudyTime / 60)}h</div>
                    <div className="text-xs font-bold text-gray-800">Study Time</div>
                    <div className="text-xs font-semibold text-blue-600 mt-0.5">{userStats.focusSessions} Sessions</div>
                  </CardBody>
                </Card>

                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardBody className="p-0.5 text-center">
                    <div className="text-xl mb-0.5">🏆</div>
                    <div className="text-lg font-black text-purple-600 drop-shadow-sm">{userStats.achievementsCount}</div>
                    <div className="text-xs font-bold text-gray-800">Achievements</div>
                    <div className="text-xs font-semibold text-purple-600 mt-0.5">{getAchievementStats().completionRate.toFixed(1)}% Complete</div>
                  </CardBody>
                </Card>
              </div>

              {/* Level Progress Section */}
              <Card className="bg-white shadow-lg">
                <CardBody className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900">Level Progress</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">Lv.{userStats.level}</div>
                      <div className="text-xs text-gray-600">{userStats.xp} / {userStats.nextLevelXp} XP</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Level {userStats.level}</span>
                    <span>{getXPForNextLevel()} XP to Level {userStats.level + 1}</span>
                  </div>
                </CardBody>
              </Card>

              {/* Recent Activity Preview */}
              <Card className="bg-white shadow-lg">
                <CardBody className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 flex items-center">
                      <FaHistory className="mr-2 text-blue-500" />
                      Recent Activity
                    </h3>
                    <button 
                      onClick={enhancedRefreshStats}
                      disabled={isRefreshing}
                      className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      {isRefreshing ? '🔄' : '🔄'} Refresh
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 3).map((activity, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg mr-2">{activity.icon || '🎯'}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-xs">{activity.title}</div>
                            <div className="text-xs text-gray-600">{activity.description}</div>
                          </div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg mr-2">🎯</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-xs">Completed a task</div>
                            <div className="text-xs text-gray-600">+10 XP earned</div>
                          </div>
                          <div className="text-xs text-gray-500">2 min ago</div>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg mr-2">🔥</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-xs">Maintained streak</div>
                            <div className="text-xs text-gray-600">Day 3 completed</div>
                          </div>
                          <div className="text-xs text-gray-500">1 hour ago</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>


            </MotionDiv>
          )}

          {activeTab === 'achievements' && (
            <MotionDiv
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => (
                    <MotionCard 
                      key={achievement.id || achievement._id || `${achievement.name}-${index}`} 
                      className={`bg-white transform hover:scale-105 transition-all duration-300 ${
                        achievement.unlocked ? 'ring-2 ring-green-500' : 'opacity-60'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardBody>
                        <div className="text-center">
                          <div className="text-4xl mb-3">{achievement.icon || '🏆'}</div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            achievement.unlocked 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {achievement.unlocked ? 'Unlocked' : 'Locked'}
                          </div>
                          {achievement.unlocked && achievement.rewards && (
                            <div className="mt-3 text-xs text-gray-500">
                              {achievement.rewards.xp && <span className="mr-2">+{achievement.rewards.xp} XP</span>}
                              {achievement.rewards.coins && <span className="mr-2">+{achievement.rewards.coins} Coins</span>}
                              {achievement.rewards.gems && <span>+{achievement.rewards.gems} Gems</span>}
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </MotionCard>
                  ))}
                </div>
              ) : (
                <Card className="bg-white">
                  <CardBody className="text-center p-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Achievements Yet</h3>
                    <p className="text-gray-600">Complete tasks and challenges to unlock achievements!</p>
                  </CardBody>
                </Card>
              )}
            </MotionDiv>
          )}

          {activeTab === 'leaderboard' && (
            <MotionDiv
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" />
                    Leaderboard
                  </h3>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-4">
                      {leaderboard.slice(0, 10).map((user, index) => (
                        <div key={user.id || user._id || index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{user.username || user.name || `User ${index + 1}`}</div>
                            <div className="text-sm text-gray-600">Level {user.level || 1}</div>
                          </div>
                          <div className="font-bold text-lg text-blue-600">{user.xp || 0} XP</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-4xl mb-4">🥇</div>
                      <p className="text-gray-600">No leaderboard data available yet.</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </MotionDiv>
          )}

          {/* {activeTab === 'advanced-pets' && (
            <MotionDiv
              key="advanced-pets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white">
                <CardBody className="text-center p-12">
                  <div className="text-6xl mb-4">🐉</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Pet System</h3>
                  <p className="text-gray-600 mb-6">Advanced pet companions and evolution system is now available!</p>
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-sm text-gray-700 mb-4">Full featured pet system with evolution, training, and customization!</p>
                    <div className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                      🐾 Pet System (Disabled)
                    </div>
                  </div>
                </CardBody>
              </Card>
            </MotionDiv>
          )}

          {activeTab === 'advanced-shop' && (
            <MotionDiv
              key="advanced-shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-white">
                <CardBody className="text-center p-12">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Shop</h3>
                  <p className="text-gray-600 mb-6">Premium items, themes, and exclusive rewards are now available!</p>
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-sm text-gray-700 mb-4">Full featured shop with pets, accessories, themes, and more!</p>
                    <div className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
                      🏪 Shop System (Disabled)
                    </div>
                  </div>
                </CardBody>
              </Card>
            </MotionDiv>
          )} */}

          {activeTab === 'rewards' && (
            <MotionDiv
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Daily Rewards Header */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardBody className="text-center p-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold mb-2">Daily Rewards</h2>
                  <p className="text-xl opacity-90">Spin the wheel to earn amazing prizes!</p>
                  <div className="mt-6 flex justify-center items-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold">🎁</div>
                      <div className="text-sm opacity-90">Daily Spin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">🔥</div>
                      <div className="text-sm opacity-90">Streak Bonus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">⭐</div>
                      <div className="text-sm opacity-90">Special Rewards</div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Spin Wheel Section */}
              <Card className="bg-white">
                <CardBody className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Spin & Win</h3>
                    <StandaloneSpinWheel />
                  </div>
                </CardBody>
              </Card>

              {/* Rewards History */}
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">💰</div>
                        <div>
                          <div className="font-semibold text-blue-900">+50 Coins</div>
                          <div className="text-sm text-blue-600">Today</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">⚡</div>
                        <div>
                          <div className="font-semibold text-purple-900">+25 XP</div>
                          <div className="text-sm text-purple-600">Yesterday</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">⭐</div>
                        <div>
                          <div className="font-semibold text-green-900">+5 Gems</div>
                          <div className="text-sm text-green-600">2 days ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Streak Rewards */}
              <Card className="bg-white">
                <CardBody>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Streak Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${userStats.streak >= 1 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔥</div>
                        <div className="font-semibold">1 Day</div>
                        <div className="text-sm text-gray-600">+10 XP</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${userStats.streak >= 3 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔥🔥</div>
                        <div className="font-semibold">3 Days</div>
                        <div className="text-sm text-gray-600">+25 XP</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${userStats.streak >= 7 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔥🔥🔥</div>
                        <div className="font-semibold">7 Days</div>
                        <div className="text-sm text-gray-600">+100 XP</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${userStats.streak >= 30 ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">👑</div>
                        <div className="font-semibold">30 Days</div>
                        <div className="text-sm text-gray-600">+500 XP</div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </MotionDiv>
          )}

          {activeTab === 'coin-earning' && (
            <MotionDiv
              key="coin-earning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CoinEarningSystem />
            </MotionDiv>
          )}

          {activeTab === 'challenges' && (
            <MotionDiv
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DailyChallenge />
            </MotionDiv>
          )}

          {activeTab === 'activity' && (
            <MotionDiv
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ActivityFeed />
            </MotionDiv>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Pet System Modal - DISABLED */}
      {/* <UltimatePetSystem 
        isOpen={showPetSystem} 
        onClose={() => setShowPetSystem(false)} 
      /> */}

      {/* Shop System Modal - DISABLED */}
      {/* <UltimateShopSystem 
        isOpen={showShopSystem} 
        onClose={() => setShowShopSystem(false)} 
      /> */}
    </div>
  );
};

export default GamificationNew; 