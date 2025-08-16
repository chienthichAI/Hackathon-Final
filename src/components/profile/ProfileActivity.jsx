import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Avatar,
  AvatarBadge,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  HStack as HStackChakra,
  Icon,
  Button,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Divider,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiDownload,
  FiUpload,
  FiEdit3,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTrendingDown,
  FiBarChart,
  FiCircle,
  FiDownload as FiDownloadIcon,
  FiShare2 as FiShare2Icon,
  FiHeart as FiHeartIcon,
  FiMessageCircle as FiMessageCircleIcon,
  FiUsers as FiUsersIcon,
  FiStar,
  FiAward,
  FiTarget,
  FiBookOpen,
  FiCode,
  FiMusic,
  FiZap,
  FiCamera,
  FiVideo,
  FiMapPin as FiMapPinIcon,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
} from 'react-icons/fi';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const ProfileActivity = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('30days');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    interactions: 0,
    posts: 0,
    achievements: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchActivities();
  }, [userId, timeRange]);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, activeTab, filterType, sortBy, searchTerm]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${userId}/activities?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        calculateStats(data.activities || []);
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (activitiesList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

    const stats = {
      total: activitiesList.length,
      today: activitiesList.filter(a => new Date(a.timestamp) >= today).length,
      thisWeek: activitiesList.filter(a => new Date(a.timestamp) >= weekAgo).length,
      thisMonth: activitiesList.filter(a => new Date(a.timestamp) >= monthAgo).length,
      interactions: activitiesList.filter(a => ['like', 'comment', 'share'].includes(a.type)).length,
      posts: activitiesList.filter(a => a.type === 'post').length,
      achievements: activitiesList.filter(a => a.type === 'achievement').length,
    };
    setStats(stats);
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Filter by tab
    switch (activeTab) {
      case 'interactions':
        filtered = filtered.filter(a => ['like', 'comment', 'share'].includes(a.type));
        break;
      case 'posts':
        filtered = filtered.filter(a => a.type === 'post');
        break;
      case 'achievements':
        filtered = filtered.filter(a => a.type === 'achievement');
        break;
      case 'social':
        filtered = filtered.filter(a => ['friend_request', 'group_join', 'message'].includes(a.type));
        break;
      default:
        break;
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'popularity':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    onOpen();
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return FiEdit3;
      case 'like': return FiHeart;
      case 'comment': return FiMessageCircle;
      case 'share': return FiShare2;
      case 'achievement': return FiAward;
      case 'friend_request': return FiUsers;
      case 'group_join': return FiUsers;
      case 'message': return FiMessageCircle;
      case 'upload': return FiUpload;
      case 'download': return FiDownload;
      case 'login': return FiTrendingUp;
      case 'logout': return FiTrendingUp;
      default: return FiTrendingUp;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'post': return 'blue';
      case 'like': return 'red';
      case 'comment': return 'green';
      case 'share': return 'purple';
      case 'achievement': return 'yellow';
      case 'friend_request': return 'teal';
      case 'group_join': return 'cyan';
      case 'message': return 'blue';
      case 'upload': return 'green';
      case 'download': return 'blue';
      case 'login': return 'green';
      case 'logout': return 'gray';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    return activityTime.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Đang tải hoạt động...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="blue.900" fontWeight="bold">
            <Icon as={FiTrendingUp} color="blue.900" mr={2} />
            Hoạt động Profile
          </Heading>
          <Text color="gray.600" fontWeight="medium">
            Theo dõi tất cả hoạt động và tương tác của bạn
          </Text>
        </VStack>
        
        <IconButton
          icon={<FiRefreshCw />}
          onClick={handleRefresh}
          variant="outline"
          colorScheme="blue.900"
        />
      </HStack>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatCard
          label="Hôm nay"
          value={stats.today}
          icon={FiCalendar}
          color="green"
        />
        
        <StatCard
          label="Tuần này"
          value={stats.thisWeek}
          icon={FiCalendar}
          color="blue"
        />
        
        <StatCard
          label="Tháng này"
          value={stats.thisMonth}
          icon={FiCalendar}
          color="purple"
        />
        
        <StatCard
          label="Tổng cộng"
          value={stats.total}
          icon={FiTrendingUp}
          color="orange"
        />
      </SimpleGrid>

      {/* Activity Breakdown */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Phân tích hoạt động</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <VStack spacing={2}>
                          <Box boxSize={8}>
              <FiHeart color="red.500" w="100%" h="100%" />
            </Box>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {stats.interactions}
              </Text>
              <Text fontSize="sm" color="gray.600">Tương tác</Text>
            </VStack>
            
            <VStack spacing={2}>
              <Box boxSize={8}>
                <Icon as={FiEdit3} color="blue.900" w="100%" h="100%" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold" color="blue.900">
                {stats.posts}
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">Bài đăng</Text>
            </VStack>
            
            <VStack spacing={2}>
                          <Box boxSize={8}>
              <FiAward color="yellow.500" w="100%" h="100%" />
            </Box>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {stats.achievements}
              </Text>
              <Text fontSize="sm" color="gray.600">Thành tích</Text>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Filters and Search */}
      <Card bg={cardBg}>
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="1year">1 năm qua</option>
              <option value="all">Tất cả</option>
            </Select>
            
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="all">Tất cả</option>
              <option value="interactions">Tương tác</option>
              <option value="posts">Bài đăng</option>
              <option value="achievements">Thành tích</option>
              <option value="social">Xã hội</option>
            </Select>
            
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="all">Tất cả loại</option>
              <option value="post">Bài đăng</option>
              <option value="like">Thích</option>
              <option value="comment">Bình luận</option>
              <option value="share">Chia sẻ</option>
              <option value="achievement">Thành tích</option>
              <option value="friend_request">Lời mời kết bạn</option>
              <option value="group_join">Tham gia nhóm</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="date">Sắp xếp theo ngày</option>
              <option value="type">Sắp xếp theo loại</option>
              <option value="popularity">Sắp xếp theo độ phổ biến</option>
            </Select>
            
            <Box flex="1" minW="200px">
                          <HStack spacing={2}>
              <FiSearch color="gray.400" />
              <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </HStack>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* Activities List */}
      <VStack spacing={4} align="stretch">
        <AnimatePresence>
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActivityCard
                activity={activity}
                onClick={() => handleActivityClick(activity)}
                getActivityIcon={getActivityIcon}
                getActivityColor={getActivityColor}
                formatTimestamp={formatTimestamp}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </VStack>

      {/* No Results */}
      {filteredActivities.length === 0 && (
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={12}>
            <VStack spacing={4}>
              <FiInfo w={16} h={16} color="gray.400" />
              <Text fontSize="lg" color="gray.500">
                Không tìm thấy hoạt động nào
              </Text>
              <Text fontSize="sm" color="gray.400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={isOpen}
        onClose={onClose}
        activity={selectedActivity}
        getActivityIcon={getActivityIcon}
        getActivityColor={getActivityColor}
        formatTimestamp={formatTimestamp}
      />
    </VStack>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody textAlign="center">
          <VStack spacing={3}>
            <Box boxSize={8}>
              <Icon color={`${color}.500`} w="100%" h="100%" />
            </Box>
            <Text fontSize="3xl" fontWeight="bold" color={`${color}.600`}>
              {value.toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {label}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Activity Card Component
const ActivityCard = ({ activity, onClick, getActivityIcon, getActivityColor, formatTimestamp }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const ActivityIcon = getActivityIcon(activity.type);
  const activityColor = getActivityColor(activity.type);

  return (
    <Card 
      bg={cardBg} 
      border="1px" 
      borderColor={borderColor}
      cursor="pointer"
      onClick={onClick}
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-2px)', 
        shadow: 'md',
        borderColor: `${activityColor}.300`
      }}
    >
      <CardBody>
        <HStack spacing={4} align="start">
          {/* Activity Icon */}
          <Box
            w="50px"
            h="50px"
            borderRadius="full"
            bg={`${activityColor}.100`}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <ActivityIcon color={`${activityColor}.500`} w={6} h={6} />
          </Box>

          {/* Activity Content */}
          <VStack spacing={2} align="start" flex={1}>
            <HStack justify="space-between" w="full">
              <Text fontSize="lg" fontWeight="semibold">
                {activity.title || `Hoạt động ${activity.type}`}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {formatTimestamp(activity.timestamp)}
              </Text>
            </HStack>
            
            {activity.description && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {activity.description}
              </Text>
            )}
            
            <HStack spacing={3} flexWrap="wrap">
              <Badge colorScheme={activityColor} variant="subtle">
                {activity.type}
              </Badge>
              
              {activity.category && (
                <Badge colorScheme="blue" variant="subtle">
                  {activity.category}
                </Badge>
              )}
              
              {activity.location && (
                <Badge colorScheme="teal" variant="subtle">
                  <HStack spacing={1}>
                    <FiMapPinIcon w={3} h={3} />
                    <Text>{activity.location}</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>
            
            {/* Activity Stats */}
            {(activity.likes || activity.comments || activity.shares) && (
              <HStack spacing={4} pt={2}>
                {activity.likes && (
                  <HStack spacing={1}>
                    <FiHeartIcon color="red.500" w={3.5} h={3.5} />
                    <Text fontSize="sm" color="gray.600">{activity.likes}</Text>
                  </HStack>
                )}
                
                {activity.comments && (
                  <HStack spacing={1}>
                    <FiMessageCircleIcon color="blue.500" w={3.5} h={3.5} />
                    <Text fontSize="sm" color="gray.600">{activity.comments}</Text>
                  </HStack>
                )}
                
                {activity.shares && (
                  <HStack spacing={1}>
                    <FiShare2Icon color="green.500" w={3.5} h={3.5} />
                    <Text fontSize="sm" color="gray.600">{activity.shares}</Text>
                  </HStack>
                )}
              </HStack>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

// Activity Detail Modal
const ActivityDetailModal = ({ isOpen, onClose, activity, getActivityIcon, getActivityColor, formatTimestamp }) => {
  if (!activity) return null;

  const ActivityIcon = getActivityIcon(activity.type);
  const activityColor = getActivityColor(activity.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <ActivityIcon color={`${activityColor}.500`} />
            <Text>{activity.title || `Hoạt động ${activity.type}`}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Activity Header */}
            <HStack spacing={4} align="start">
              <Box
                w="80px"
                h="80px"
                borderRadius="full"
                bg={`${activityColor}.100`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <ActivityIcon color={`${activityColor}.500`} w={10} h={10} />
              </Box>

              <VStack spacing={2} align="start" flex={1}>
                <Text fontSize="xl" fontWeight="bold">
                  {activity.title || `Hoạt động ${activity.type}`}
                </Text>
                
                <HStack spacing={3} flexWrap="wrap">
                  <Badge colorScheme={activityColor} size="lg">
                    {activity.type}
                  </Badge>
                  
                  {activity.category && (
                    <Badge colorScheme="blue" size="lg">
                      {activity.category}
                    </Badge>
                  )}
                  
                  <Text fontSize="sm" color="gray.500">
                    {formatTimestamp(activity.timestamp)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Divider />

            {/* Activity Details */}
            <VStack spacing={4} align="stretch">
              {activity.description && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Mô tả:</Text>
                  <Text color="gray.700">{activity.description}</Text>
                </Box>
              )}
              
              {activity.location && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Địa điểm:</Text>
                  <HStack spacing={2}>
                    <FiMapPin color="teal.500" />
                    <Text>{activity.location}</Text>
                  </HStack>
                </Box>
              )}
              
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Thông tin chi tiết:</Text>
                  <VStack spacing={2} align="stretch">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <HStack key={key} justify="space-between">
                        <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                          {key.replace(/_/g, ' ')}:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {typeof value === 'boolean' ? (value ? 'Có' : 'Không') : value}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>

            {/* Activity Stats */}
            {(activity.likes || activity.comments || activity.shares) && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="medium" mb={3}>Thống kê:</Text>
                  <SimpleGrid columns={3} spacing={4}>
                    <VStack spacing={2}>
                      <FiHeartIcon color="red.500" w={6} h={6} />
                      <Text fontSize="2xl" fontWeight="bold" color="red.500">
                        {activity.likes || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Lượt thích</Text>
                    </VStack>
                    
                    <VStack spacing={2}>
                      <FiMessageCircleIcon color="blue.500" w={6} h={6} />
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {activity.comments || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Bình luận</Text>
                    </VStack>
                    
                    <VStack spacing={2}>
                      <FiShare2Icon color="green.500" w={6} h={6} />
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {activity.shares || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Chia sẻ</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileActivity; 