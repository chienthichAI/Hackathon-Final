import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Avatar,
  AvatarBadge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Tooltip,
  Image,
  Link,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiUser,
  FiEdit3,
  FiSettings,
  FiShield,
  FiAward,
  FiZap,
  FiTarget,
  FiClock,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiEye,
  FiCamera,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiMail,
  FiPhone,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiBookOpen,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiEyeOff,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import UserProfileCard from '../components/profile/UserProfileCard';
import ProfileDecorations from '../components/profile/ProfileDecorations';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import ProfileSettingsModal from '../components/profile/ProfileSettingsModal';
import ProfilePrivacyModal from '../components/profile/ProfilePrivacyModal';
import ProfileAnalytics from '../components/profile/ProfileAnalytics';
import ProfileAchievements from '../components/profile/ProfileAchievements';
import ProfileActivity from '../components/profile/ProfileActivity';
import ProfileConnections from '../components/profile/ProfileConnections';
import ProfileSecurity from '../components/profile/ProfileSecurity';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { userProgress, achievements, recentActivity } = useGamification();
  const toast = useToast();
  
  // Debug log
  console.log('=== DEBUG Profile ===');
  console.log('User from context:', user);
  console.log('User ID:', user?.id);
  
  // Modal controls
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isPrivacyOpen, onOpen: onPrivacyOpen, onClose: onPrivacyClose } = useDisclosure();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTodos: 0,
    completedTodos: 0,
    totalAchievements: 0,
    totalConnections: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (user && user.id) {
      console.log('=== DEBUG Profile useEffect ===');
      console.log('User context:', user);
      console.log('User ID:', user.id);
      console.log('Fetching profile data for user ID:', user.id);
      fetchProfileData();
      fetchUserStats();
    } else {
      console.log('No user or user ID found');
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log('=== DEBUG fetchProfileData ===');
      console.log('Fetching profile for user ID:', user.id);
      
      // Fetch comprehensive profile data
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${user.id}/full`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data.profile);
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${user.id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    console.log('=== DEBUG handleProfileUpdate ===');
    console.log('Original user context:', user);
    console.log('Updated profile data:', updatedProfile);
    
    setProfileData(updatedProfile);
    
    // Don't update the user context with profile data to avoid ID mismatch
    // The profile data should remain separate from the user authentication context
    console.log('Profile data updated, user context preserved');
    
    toast({
      title: '✅ Cập nhật thành công',
      description: 'Profile đã được cập nhật',
      status: 'success',
      duration: 3000,
    });
  };

  const handleProfileRefresh = () => {
    fetchProfileData();
    fetchUserStats();
    toast({
      title: '🔄 Đã làm mới',
      description: 'Profile đã được cập nhật',
      status: 'info',
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <Text fontSize="lg" color="gray.600">Đang tải profile...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} mb={8}>
            <HStack spacing={4} w="full" justify="space-between">
              <VStack align="start" spacing={2}>
                <Heading size="xl" color="blue.900" fontWeight="black">
                  Profile Dashboard
                </Heading>
                <Text fontSize="md" color="gray.600" fontWeight="semibold">
                  Manage and customize your profile
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Tooltip label="Làm mới profile">
                  <IconButton
                    icon={<FiRefreshCw />}
                    onClick={handleProfileRefresh}
                    variant="outline"
                    colorScheme="blue.900"
                  />
                </Tooltip>
                <Button
                  leftIcon={<FiEdit3 />}
                  colorScheme="blue.900"
                  bg="blue.900"
                  color="white"
                  _hover={{ bg: "blue.800" }}
                  onClick={onEditOpen}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  leftIcon={<FiSettings />}
                  variant="outline"
                  colorScheme="blue.900"
                  borderColor="blue.900"
                  color="blue.900"
                  _hover={{ bg: "blue.50" }}
                  onClick={onSettingsOpen}
                >
                  Cài đặt
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </motion.div>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
          {/* Left Sidebar - Profile Card */}
          <GridItem>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UserProfileCard 
                userId={user.id} 
                isOwnProfile={true}
                onProfileUpdate={handleProfileUpdate}
              />
            </motion.div>
          </GridItem>

          {/* Right Content - Tabs */}
          <GridItem>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
                  <TabList>
                    <Tab value="overview" fontWeight="semibold">Tổng quan</Tab>
                    <Tab value="analytics" fontWeight="semibold">Phân tích</Tab>
                    <Tab value="achievements" fontWeight="semibold">Thành tích</Tab>
                    <Tab value="activity" fontWeight="semibold">Hoạt động</Tab>
                    <Tab value="connections" fontWeight="semibold">Kết nối</Tab>
                    <Tab value="decorations" fontWeight="semibold">Trang trí</Tab>
                    <Tab value="security" fontWeight="semibold">Bảo mật</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Overview Tab */}
                    <TabPanel value="overview">
                      <ProfileOverview 
                        user={user}
                        userProgress={userProgress}
                        stats={stats}
                        achievements={achievements}
                      />
                    </TabPanel>

                    {/* Analytics Tab */}
                    <TabPanel value="analytics">
                      <ProfileAnalytics userId={user.id} />
                    </TabPanel>

                    {/* Achievements Tab */}
                    <TabPanel value="achievements">
                      <ProfileAchievements userId={user.id} />
                    </TabPanel>

                    {/* Activity Tab */}
                    <TabPanel value="activity">
                      <ProfileActivity userId={user.id} />
                    </TabPanel>

                    {/* Connections Tab */}
                    <TabPanel value="connections">
                      <ProfileConnections userId={user.id} />
                    </TabPanel>

                    {/* Decorations Tab */}
                    <TabPanel value="decorations">
                      <ProfileDecorations />
                    </TabPanel>

                    {/* Security Tab */}
                    <TabPanel value="security">
                      <ProfileSecurity userId={user.id} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </motion.div>
          </GridItem>
        </Grid>
      </Container>

      {/* Modals */}
      <ProfileEditModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        profile={profileData}
        onUpdate={handleProfileUpdate}
      />
      
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        profile={profileData}
        onUpdate={handleProfileUpdate}
      />
      
      <ProfilePrivacyModal
        isOpen={isPrivacyOpen}
        onClose={onPrivacyClose}
        profile={profileData}
        onUpdate={handleProfileUpdate}
      />
    </Box>
  );
};

// Profile Overview Component
const ProfileOverview = ({ user, userProgress, stats, achievements }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Stat p={4} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <StatLabel fontSize="sm" color="gray.600" fontWeight="semibold">Level</StatLabel>
          <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
            {userProgress?.level || 1}
          </StatNumber>
          <StatHelpText fontSize="xs" fontWeight="medium">
            {userProgress?.xp || 0} XP
          </StatHelpText>
        </Stat>
        
        <Stat p={4} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <StatLabel fontSize="sm" color="gray.600" fontWeight="semibold">Nhiệm vụ</StatLabel>
          <StatNumber color="green.600" fontSize="2xl" fontWeight="bold">
            {stats.completedTodos}/{stats.totalTodos}
          </StatNumber>
          <StatHelpText fontSize="xs" fontWeight="medium">
            {stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0}% hoàn thành
          </StatHelpText>
        </Stat>
        
        <Stat p={4} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <StatLabel fontSize="sm" color="gray.600" fontWeight="semibold">Thành tích</StatLabel>
          <StatNumber color="purple.600" fontSize="2xl" fontWeight="bold">
            {stats.totalAchievements}
          </StatNumber>
          <StatHelpText fontSize="xs" fontWeight="medium">
            đã đạt được
          </StatHelpText>
        </Stat>
        
        <Stat p={4} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="lg">
          <StatLabel fontSize="sm" color="gray.600" fontWeight="semibold">Kết nối</StatLabel>
          <StatNumber color="orange.600" fontSize="2xl" fontWeight="bold">
            {stats.totalConnections}
          </StatNumber>
          <StatHelpText fontSize="xs" fontWeight="medium">
            bạn bè
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Progress Bars */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" fontWeight="bold">Tiến độ học tập</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold">Level Progress</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {userProgress?.xp || 0} / {userProgress?.nextLevelXP || 1000} XP
                </Text>
              </HStack>
              <Progress 
                value={userProgress ? (userProgress.xp / userProgress.nextLevelXP) * 100 : 0} 
                colorScheme="blue.900" 
                size="lg"
                borderRadius="full"
              />
            </Box>
            
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold">Daily Streak</Text>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {userProgress?.currentStreak || 0} ngày liên tiếp
                </Text>
              </HStack>
              <Progress 
                value={userProgress?.currentStreak ? Math.min((userProgress.currentStreak / 30) * 100, 100) : 0} 
                colorScheme="green" 
                size="lg"
                borderRadius="full"
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Recent Achievements */}
      {achievements && achievements.length > 0 && (
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" fontWeight="bold">Thành tích gần đây</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {achievements.slice(0, 4).map((achievement, index) => (
                <HStack key={index} p={3} bg="gray.50" borderRadius="lg">
                  <Icon as={FiAward} color="yellow.500" boxSize={5} />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      {achievement.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      {achievement.description}
                    </Text>
                  </VStack>
                  <Badge colorScheme="green" size="sm" fontWeight="semibold">
                    {achievement.points} XP
                  </Badge>
                </HStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Social Stats */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" fontWeight="bold">Thống kê xã hội</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <VStack spacing={2}>
              <Icon as={FiHeart} color="red.500" boxSize={6} />
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {stats.totalLikes}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="semibold">Lượt thích</Text>
            </VStack>
            
            <VStack spacing={2}>
              <Icon as={FiMessageCircle} color="blue.900" boxSize={6} />
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                {stats.totalComments}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="semibold">Bình luận</Text>
            </VStack>
            
            <VStack spacing={2}>
              <Icon as={FiShare2} color="green.500" boxSize={6} />
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.totalShares}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="semibold">Chia sẻ</Text>
            </VStack>
            
            <VStack spacing={2}>
              <Icon as={FiUsers} color="purple.500" boxSize={6} />
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {stats.totalConnections}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="semibold">Kết nối</Text>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Profile; 