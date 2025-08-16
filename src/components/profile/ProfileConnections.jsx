import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Avatar,
  AvatarBadge,
  Button,
  IconButton,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  HStack as HStackChakra,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart,
  FiCircle,
  FiDownload,
  FiUpload,
  FiEdit3,
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiClock,
  FiMapPin,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
  FiCalendar,
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
  FiGlobe as FiGlobeIcon,
  FiGithub as FiGithubIcon,
  FiLinkedin as FiLinkedinIcon,
  FiTwitter as FiTwitterIcon,
  FiInstagram as FiInstagramIcon,
  FiMail as FiMailIcon,
  FiPhone as FiPhoneIcon,
  FiCalendar as FiCalendarIcon,
  FiStar as FiStarIcon,
  FiAward as FiAwardIcon,
  FiAward as FiTrophyIcon,
  FiTarget as FiTargetIcon,
  FiBookOpen as FiBookOpenIcon,
  FiCode as FiCodeIcon,
  FiEdit3 as FiEdit3Icon,
  FiMusic as FiMusicIcon,
  FiZap as FiZapIcon,
  FiCamera as FiCameraIcon,
  FiVideo as FiVideoIcon,
} from 'react-icons/fi';

const ProfileConnections = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalFriends: 0,
    onlineFriends: 0,
    pendingRequests: 0,
    sentRequests: 0,
    mutualFriends: 0,
    totalGroups: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRequestOpen, onOpen: onRequestOpen, onClose: onRequestClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchConnections();
  }, [userId]);

  useEffect(() => {
    filterAndSortConnections();
  }, [connections, activeTab, filterStatus, sortBy, searchTerm]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${userId}/connections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
        calculateStats(data.connections || []);
      } else {
        throw new Error('Failed to fetch connections');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (connectionsList) => {
    const stats = {
      totalFriends: connectionsList.filter(c => c.status === 'accepted').length,
      onlineFriends: connectionsList.filter(c => c.status === 'accepted' && c.isOnline).length,
      pendingRequests: connectionsList.filter(c => c.status === 'pending' && !c.isIncoming).length,
      sentRequests: connectionsList.filter(c => c.status === 'pending' && c.isIncoming).length,
      mutualFriends: connectionsList.filter(c => c.status === 'accepted' && c.mutualFriends > 0).length,
      totalGroups: connectionsList.filter(c => c.type === 'group').length,
    };
    setStats(stats);
  };

  const filterAndSortConnections = () => {
    let filtered = [...connections];

    // Filter by tab
    switch (activeTab) {
      case 'friends':
        filtered = filtered.filter(c => c.status === 'accepted');
        break;
      case 'pending':
        filtered = filtered.filter(c => c.status === 'pending');
        break;
      case 'requests':
        filtered = filtered.filter(c => c.status === 'pending' && c.isIncoming);
        break;
      case 'groups':
        filtered = filtered.filter(c => c.type === 'group');
        break;
      default:
        break;
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort connections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'lastActive':
          return new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
        case 'mutualFriends':
          return (b.mutualFriends || 0) - (a.mutualFriends || 0);
        default:
          return 0;
      }
    });

    setFilteredConnections(filtered);
  };

  const handleConnectionClick = (connection) => {
    setSelectedConnection(connection);
    onOpen();
  };

  const handleAcceptRequest = async (connectionId) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: '✅ Đã chấp nhận lời mời',
          description: 'Bạn đã kết bạn thành công',
          status: 'success',
          duration: 3000,
        });
        fetchConnections();
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi chấp nhận lời mời',
        description: 'Không thể chấp nhận lời mời. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRejectRequest = async (connectionId) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: '❌ Đã từ chối lời mời',
          description: 'Lời mời kết bạn đã bị từ chối',
          status: 'info',
          duration: 3000,
        });
        fetchConnections();
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi từ chối lời mời',
        description: 'Không thể từ chối lời mời. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRemoveFriend = async (connectionId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy kết bạn?')) {
      try {
        const response = await fetch(`/api/connections/${connectionId}/remove`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          toast({
            title: '❌ Đã hủy kết bạn',
            description: 'Bạn đã hủy kết bạn thành công',
            status: 'info',
            duration: 3000,
          });
          fetchConnections();
        }
      } catch (error) {
        toast({
          title: '❌ Lỗi hủy kết bạn',
          description: 'Không thể hủy kết bạn. Vui lòng thử lại.',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  const handleRefresh = () => {
    fetchConnections();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Đã kết bạn';
      case 'pending': return 'Đang chờ';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const formatLastActive = (lastActive) => {
    if (!lastActive) return 'Chưa xác định';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Đang tải kết nối...</Text>
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
            <Icon as={FiUsers} color="blue.900" mr={2} />
            Kết nối & Bạn bè
          </Heading>
          <Text color="gray.600" fontWeight="medium">
            Quản lý danh sách bạn bè và kết nối của bạn
          </Text>
        </VStack>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<FiUserPlus />}
            colorScheme="blue.900"
            bg="blue.900"
            color="white"
            _hover={{ bg: "blue.800" }}
            _active={{ bg: "blue.950" }}
            onClick={onRequestOpen}
          >
            Tìm bạn bè
          </Button>
          
          <IconButton
            icon={<FiRefreshCw />}
            onClick={handleRefresh}
            variant="outline"
            colorScheme="blue.900"
            borderColor="blue.900"
            color="blue.900"
            _hover={{ bg: "blue.50" }}
          />
        </HStack>
      </HStack>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        <StatCard
          label="Bạn bè"
          value={stats.totalFriends}
          icon={FiUserCheck}
          color="green"
        />
        
        <StatCard
          label="Đang online"
          value={stats.onlineFriends}
          icon={FiUsers}
          color="blue"
        />
        
        <StatCard
          label="Lời mời chờ"
          value={stats.pendingRequests}
          icon={FiClock}
          color="yellow"
        />
        
        <StatCard
          label="Bạn chung"
          value={stats.mutualFriends}
          icon={FiUsers}
          color="purple"
        />
        
        <StatCard
          label="Nhóm"
          value={stats.totalGroups}
          icon={FiUsers}
          color="blue.900"
        />
      </SimpleGrid>

      {/* Filters and Search */}
      <Card bg={cardBg}>
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="friends">Bạn bè</option>
              <option value="pending">Đang chờ</option>
              <option value="requests">Lời mời</option>
              <option value="groups">Nhóm</option>
            </Select>
            
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="accepted">Đã kết bạn</option>
              <option value="pending">Đang chờ</option>
              <option value="rejected">Đã từ chối</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="status">Sắp xếp theo trạng thái</option>
              <option value="lastActive">Sắp xếp theo hoạt động</option>
              <option value="mutualFriends">Sắp xếp theo bạn chung</option>
            </Select>
            
            <Box flex="1" minW="200px">
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* Connections Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <AnimatePresence>
          {filteredConnections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ConnectionCard
                connection={connection}
                onClick={() => handleConnectionClick(connection)}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onRemove={handleRemoveFriend}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                formatLastActive={formatLastActive}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SimpleGrid>

      {/* No Results */}
      {filteredConnections.length === 0 && (
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={12}>
            <VStack spacing={4}>
              <Icon as={FiInfo} boxSize={16} color="gray.400" />
              <Text fontSize="lg" color="gray.500">
                Không tìm thấy kết nối nào
              </Text>
              <Text fontSize="sm" color="gray.400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Connection Detail Modal */}
      <ConnectionDetailModal
        isOpen={isOpen}
        onClose={onClose}
        connection={selectedConnection}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        formatLastActive={formatLastActive}
      />

      {/* Find Friends Modal */}
      <FindFriendsModal
        isOpen={isRequestOpen}
        onClose={onRequestClose}
        onRefresh={fetchConnections}
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
              <Icon color={`${color}.500`} size="full" />
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

// Connection Card Component
const ConnectionCard = ({ 
  connection, 
  onClick, 
  onAccept, 
  onReject, 
  onRemove,
  getStatusColor,
  getStatusText,
  formatLastActive
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Card 
      bg={cardBg} 
      border="1px" 
      borderColor={borderColor}
      cursor="pointer"
      onClick={onClick}
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-4px)', 
        shadow: 'lg',
        borderColor: `${getStatusColor(connection.status)}.300`
      }}
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Connection Header */}
          <HStack spacing={3} align="start">
            <Box position="relative">
              <Avatar
                size="lg"
                name={connection.name}
                src={connection.avatar}
                border="3px solid white"
                shadow="lg"
              />
              {/* Online Status */}
              {connection.isOnline && (
                <Box
                  position="absolute"
                  bottom={2}
                  right={2}
                  w={4}
                  h={4}
                  bg="green.500"
                  borderRadius="full"
                  border="2px solid white"
                />
              )}
            </Box>
            
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="lg" fontWeight="bold">
                {connection.name}
              </Text>
              
              <Text fontSize="sm" color="gray.600">
                @{connection.username}
              </Text>
              
              <Badge colorScheme={getStatusColor(connection.status)} size="sm">
                {getStatusText(connection.status)}
              </Badge>
            </VStack>
          </HStack>

          {/* Connection Info */}
          {connection.bio && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {connection.bio}
            </Text>
          )}
          
          <HStack justify="space-between" fontSize="sm" color="gray.500">
            <Text>Hoạt động: {formatLastActive(connection.lastActive)}</Text>
            {connection.mutualFriends > 0 && (
              <Text>{connection.mutualFriends} bạn chung</Text>
            )}
          </HStack>

          {/* Action Buttons */}
          {connection.status === 'pending' && connection.isIncoming && (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="green"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(connection.id);
                }}
                flex={1}
              >
                Chấp nhận
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(connection.id);
                }}
                flex={1}
              >
                Từ chối
              </Button>
            </HStack>
          )}
          
          {connection.status === 'accepted' && (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                leftIcon={<FiMessageCircle />}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message
                }}
                flex={1}
              >
                Nhắn tin
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(connection.id);
                }}
                flex={1}
              >
                Hủy kết bạn
              </Button>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Connection Detail Modal
const ConnectionDetailModal = ({ isOpen, onClose, connection, getStatusColor, getStatusText, formatLastActive }) => {
  if (!connection) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Avatar name={connection.name} src={connection.avatar} size="md" />
            <Text>{connection.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Connection Info */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Trạng thái:</Text>
                <Badge colorScheme={getStatusColor(connection.status)} size="lg">
                  {getStatusText(connection.status)}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Username:</Text>
                <Text>@{connection.username}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Hoạt động lần cuối:</Text>
                <Text>{formatLastActive(connection.lastActive)}</Text>
              </HStack>
              
              {connection.mutualFriends > 0 && (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Bạn chung:</Text>
                  <Text>{connection.mutualFriends} người</Text>
                </HStack>
              )}
            </VStack>

            <Divider />

            {/* Bio */}
            {connection.bio && (
              <Box>
                <Text fontWeight="medium" mb={2}>Giới thiệu:</Text>
                <Text color="gray.700">{connection.bio}</Text>
              </Box>
            )}

            {/* Additional Info */}
            {connection.location && (
              <HStack spacing={2}>
                <Icon as={FiMapPin} color="teal.500" />
                <Text>{connection.location}</Text>
              </HStack>
            )}
            
            {connection.website && (
              <HStack spacing={2}>
                <Icon as={FiGlobe} color="blue.500" />
                <Text>{connection.website}</Text>
              </HStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Find Friends Modal
const FindFriendsModal = ({ isOpen, onClose, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const toast = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetUserId: userId })
      });

      if (response.ok) {
        toast({
          title: '✅ Đã gửi lời mời',
          description: 'Lời mời kết bạn đã được gửi',
          status: 'success',
          duration: 3000,
        });
        onRefresh();
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi gửi lời mời',
        description: 'Không thể gửi lời mời. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tìm bạn bè</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Tìm kiếm theo tên, username hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </InputGroup>
            
            <Button
              colorScheme="blue"
              onClick={handleSearch}
              isLoading={searching}
              loadingText="Đang tìm..."
            >
              Tìm kiếm
            </Button>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontWeight="medium">Kết quả tìm kiếm:</Text>
                {searchResults.map((user) => (
                  <HStack key={user.id} justify="space-between" p={3} bg="gray.50" borderRadius="lg">
                    <HStack spacing={3}>
                      <Avatar name={user.name} src={user.avatar} size="sm" />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{user.name}</Text>
                        <Text fontSize="sm" color="gray.600">@{user.username}</Text>
                      </VStack>
                    </HStack>
                    
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleSendRequest(user.id)}
                    >
                      Kết bạn
                    </Button>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileConnections; 