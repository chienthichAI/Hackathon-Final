import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  HStack as HStackChakra,
  Icon,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  IconButton,
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiClock,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiUsers,
  FiCalendar,
  FiBarChart,
  FiCircle,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';

const ProfileAnalytics = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchAnalyticsData();
  }, [userId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${userId}/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.analytics);
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Không thể tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Đang tải dữ liệu phân tích...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Không có dữ liệu</AlertTitle>
          <AlertDescription>
            Chưa có dữ liệu phân tích cho profile này
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="blue.900" fontWeight="bold">
            <Icon as={FiBarChart} color="blue.900" mr={2} />
            Phân tích Profile
          </Heading>
          <Text color="gray.600" fontWeight="medium">
            Thống kê chi tiết về hoạt động và tương tác của bạn
          </Text>
        </VStack>
        
        <HStack spacing={3}>
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
          
          <IconButton
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
            variant="outline"
            colorScheme="blue.900"
            size="sm"
          />
        </HStack>
      </HStack>

      {/* Overview Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatCard
          label="Lượt xem Profile"
          value={analyticsData.profileViews || 0}
          change={analyticsData.profileViewsChange || 0}
          icon={FiTrendingUp}
          color="blue"
        />
        
        <StatCard
          label="Lượt thích"
          value={analyticsData.totalLikes || 0}
          change={analyticsData.likesChange || 0}
          icon={FiHeart}
          color="red"
        />
        
        <StatCard
          label="Bình luận"
          value={analyticsData.totalComments || 0}
          change={analyticsData.commentsChange || 0}
          icon={FiMessageCircle}
          color="green"
        />
        
        <StatCard
          label="Chia sẻ"
          value={analyticsData.totalShares || 0}
          change={analyticsData.sharesChange || 0}
          icon={FiShare2}
          color="purple"
        />
      </SimpleGrid>

      {/* Detailed Analytics Tabs */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <Tabs variant="enclosed">
          <TabList>
            <Tab value="overview">Tổng quan</Tab>
            <Tab value="activity">Hoạt động</Tab>
            <Tab value="engagement">Tương tác</Tab>
            <Tab value="growth">Tăng trưởng</Tab>
            <Tab value="comparison">So sánh</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel value="overview">
              <ProfileOverviewTab data={analyticsData} />
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value="activity">
              <ProfileActivityTab data={analyticsData} />
            </TabPanel>

            {/* Engagement Tab */}
            <TabPanel value="engagement">
              <ProfileEngagementTab data={analyticsData} />
            </TabPanel>

            {/* Growth Tab */}
            <TabPanel value="growth">
              <ProfileGrowthTab data={analyticsData} />
            </TabPanel>

            {/* Comparison Tab */}
            <TabPanel value="comparison">
              <ProfileComparisonTab data={analyticsData} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </VStack>
  );
};

// Stat Card Component
const StatCard = ({ label, value, change, icon: Icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getChangeColor = (change) => {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'gray';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <FiTrendingUp />;
    if (change < 0) return <FiTrendingDown />;
    return <FiTrendingUp />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3} align="center">
            <Icon color={`${color}.500`} w={6} h={6} />
            
            <VStack spacing={1} align="center">
              <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
                {value.toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {label}
              </Text>
            </VStack>
            
            <HStack spacing={1}>
              {getChangeIcon(change)}
              <Text
                fontSize="sm"
                color={`${getChangeColor(change)}.500`}
                fontWeight="medium"
              >
                {change > 0 ? '+' : ''}{change}%
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Profile Overview Tab
const ProfileOverviewTab = ({ data }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      {/* Profile Performance */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Hiệu suất Profile</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Điểm Profile</Text>
                <Text fontSize="sm" color="gray.600">
                  {data.profileScore || 0}/100
                </Text>
              </HStack>
              <Progress 
                value={data.profileScore || 0} 
                colorScheme="blue" 
                size="lg"
                borderRadius="full"
              />
            </Box>
            
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">Tỷ lệ hoàn thành</Text>
                <Text fontSize="sm" color="gray.600">
                  {data.completionRate || 0}%
                </Text>
              </HStack>
              <Progress 
                value={data.completionRate || 0} 
                colorScheme="green" 
                size="lg"
                borderRadius="full"
              />
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Thống kê cơ bản</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm">Ngày hoạt động</Text>
                <Badge colorScheme="blue">{data.activeDays || 0}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Thời gian trung bình/ngày</Text>
                <Badge colorScheme="green">{data.avgTimePerDay || 0} phút</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Tỷ lệ tương tác</Text>
                <Badge colorScheme="purple">{data.engagementRate || 0}%</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Thành tích</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm">Nhiệm vụ hoàn thành</Text>
                <Badge colorScheme="green">{data.completedTasks || 0}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Thành tích đạt được</Text>
                <Badge colorScheme="yellow">{data.achievements || 0}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm">Chuỗi ngày</Text>
                <Badge colorScheme="orange">{data.currentStreak || 0} ngày</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

// Profile Activity Tab
const ProfileActivityTab = ({ data }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      {/* Daily Activity Chart */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Hoạt động hàng ngày</Heading>
        </CardHeader>
        <CardBody>
          <Box h="300px" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={4}>
              <FiBarChart w={16} h={16} color="gray.400" />
              <Text color="gray.500">Biểu đồ hoạt động sẽ được hiển thị ở đây</Text>
              <Text fontSize="sm" color="gray.400">
                Dữ liệu: {data.dailyActivity?.length || 0} ngày
              </Text>
            </VStack>
          </Box>
        </CardBody>
      </Card>

      {/* Activity Breakdown */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Phân loại hoạt động</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {data.activityBreakdown?.map((activity, index) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="sm">{activity.type}</Text>
                  <Badge colorScheme="blue">{activity.count}</Badge>
                </HStack>
              )) || (
                <Text fontSize="sm" color="gray.500">Không có dữ liệu</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Thời gian hoạt động</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {data.timeDistribution?.map((time, index) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="sm">{time.period}</Text>
                  <Badge colorScheme="green">{time.percentage}%</Badge>
                </HStack>
              )) || (
                <Text fontSize="sm" color="gray.500">Không có dữ liệu</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

// Profile Engagement Tab
const ProfileEngagementTab = ({ data }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      {/* Engagement Metrics */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card bg={cardBg}>
          <CardBody textAlign="center">
            <VStack spacing={3}>
              <FiHeart color="red.500" w={8} h={8} />
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {data.engagementMetrics?.likes || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Lượt thích</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody textAlign="center">
            <VStack spacing={3}>
              <FiMessageCircle color="blue.500" w={8} h={8} />
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {data.engagementMetrics?.comments || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Bình luận</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody textAlign="center">
            <VStack spacing={3}>
              <FiShare2 color="green.500" w={8} h={8} />
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {data.engagementMetrics?.shares || 0}
              </Text>
              <Text fontSize="sm" color="gray.600">Chia sẻ</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Engagement Trends */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Xu hướng tương tác</Heading>
        </CardHeader>
        <CardBody>
          <Box h="300px" display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={4}>
              <FiTrendingUp w={16} h={16} color="gray.400" />
              <Text color="gray.500">Biểu đồ xu hướng sẽ được hiển thị ở đây</Text>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
};

// Profile Growth Tab
const ProfileGrowthTab = ({ data }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      {/* Growth Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Tăng trưởng Profile</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Tăng trưởng người theo dõi</Text>
                  <Text fontSize="sm" color="green.500">
                    +{data.growthMetrics?.followerGrowth || 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={Math.min(data.growthMetrics?.followerGrowth || 0, 100)} 
                  colorScheme="green" 
                  size="sm"
                />
              </Box>
              
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Tăng trưởng tương tác</Text>
                  <Text fontSize="sm" color="blue.500">
                    +{data.growthMetrics?.engagementGrowth || 0}%
                  </Text>
                </HStack>
                <Progress 
                  value={Math.min(data.growthMetrics?.engagementGrowth || 0, 100)} 
                  colorScheme="blue" 
                  size="sm"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Mục tiêu</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">Level hiện tại</Text>
                  <Text fontSize="sm" color="purple.500">
                    {data.growthMetrics?.currentLevel || 1}
                  </Text>
                </HStack>
                <Progress 
                  value={data.growthMetrics?.levelProgress || 0} 
                  colorScheme="purple" 
                  size="sm"
                />
              </Box>
              
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm">XP cần để lên level</Text>
                  <Text fontSize="sm" color="orange.500">
                    {data.growthMetrics?.xpToNextLevel || 0} XP
                  </Text>
                </HStack>
                <Progress 
                  value={data.growthMetrics?.xpProgress || 0} 
                  colorScheme="orange" 
                  size="sm"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

// Profile Comparison Tab
const ProfileComparisonTab = ({ data }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={6} align="stretch">
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>So sánh Profile</AlertTitle>
          <AlertDescription>
            So sánh hiệu suất của bạn với người dùng khác
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">So với trung bình</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {data.comparisonData?.averageComparison?.map((item, index) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="sm">{item.metric}</Text>
                  <Badge 
                    colorScheme={item.yourValue > item.averageValue ? 'green' : 'red'}
                  >
                    {item.yourValue > item.averageValue ? '+' : ''}
                    {((item.yourValue - item.averageValue) / item.averageValue * 100).toFixed(1)}%
                  </Badge>
                </HStack>
              )) || (
                <Text fontSize="sm" color="gray.500">Không có dữ liệu so sánh</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="sm">Xếp hạng</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {data.comparisonData?.rankings?.map((rank, index) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="sm">{rank.category}</Text>
                  <Badge colorScheme="blue">#{rank.position}</Badge>
                </HStack>
              )) || (
                <Text fontSize="sm" color="gray.500">Không có dữ liệu xếp hạng</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default ProfileAnalytics; 