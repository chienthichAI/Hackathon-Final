import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  IconButton,
  Tooltip,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Link,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Center,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiMail,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiMessageCircle,
  FiSettings,
  FiShare2,
  FiEye,
  FiHeart,
  FiAward,
  FiZap,
  FiTarget,
  FiClock,
  FiStar,
  FiShield,
  FiEdit,
  FiCamera,
  FiExternalLink,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';
import { sendFriendRequest, getUserProfile, updateUserProfile } from '../../api';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function UserProfileCard({ userId, isOwnProfile = false, onProfileUpdate }) {
  const { user } = useAuth();
  const { userProgress } = useGamification();
  const toast = useToast();
  
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  
  // Modal controls
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  useEffect(() => {
    fetchProfile();
  }, [userId]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userId);
      setProfile(response.data.profile);
      setFriendshipStatus(response.data.friendshipStatus);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: '❌ Lỗi tải profile',
        description: 'Không thể tải thông tin người dùng',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendFriendRequest = async () => {
    try {
      setSendingRequest(true);
      await sendFriendRequest(userId);
      setFriendshipStatus('pending');
      
      toast({
        title: '✅ Đã gửi lời mời kết bạn',
        description: 'Lời mời kết bạn đã được gửi thành công',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Lỗi gửi lời mời',
        description: error.response?.data?.message || 'Không thể gửi lời mời kết bạn',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSendingRequest(false);
    }
  };
  
  const getOnlineStatusColor = (status) => {
    switch (status) {
      case 'online': return 'green';
      case 'away': return 'yellow';
      case 'busy': return 'red';
      default: return 'gray';
    }
  };
  
  const getOnlineStatusText = (status) => {
    switch (status) {
      case 'online': return 'Đang online';
      case 'away': return 'Vắng mặt';
      case 'busy': return 'Bận';
      default: return 'Offline';
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
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    
    return lastActiveDate.toLocaleDateString('vi-VN');
  };
  
  const getLevelProgress = () => {
    if (!userProgress) return { current: 0, next: 100, percentage: 0 };
    
    const current = userProgress.level || 1;
    const currentXP = userProgress.currentXP || 0;
    const nextLevelXP = userProgress.nextLevelXP || 100;
    const percentage = Math.min((currentXP / nextLevelXP) * 100, 100);
    
    return { current, next: current + 1, percentage };
  };
  
  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
            <Text>Đang tải profile...</Text>
          </VStack>
      </Center>
    );
  }
  
  if (!profile) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Icon as={FiUserX} boxSize={16} color="red.500" />
            <Text>Không tìm thấy profile</Text>
          </VStack>
      </Center>
    );
  }
  
  const levelProgress = getLevelProgress();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card shadow="lg" overflow="hidden">
        {/* Profile Header */}
        <Box
          bg="linear-gradient(135deg, purple.500 0%, pink.500 100%)"
          h="120px"
          position="relative"
    >
      {/* Cover Image */}
      {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Cover"
            w="full"
            h="full"
            objectFit="cover"
          />
          )}
          
          {/* Online Status Badge */}
          <Badge
              position="absolute"
              top={4}
              right={4}
            colorScheme={getOnlineStatusColor(profile.onlineStatus)}
            size="lg"
            px={3}
            py={1}
          >
            <HStack spacing={1}>
              <Box
                w={2}
                h={2}
                borderRadius="full"
                bg={getOnlineStatusColor(profile.onlineStatus)}
                animation={profile.onlineStatus === 'online' ? 'pulse 2s infinite' : 'none'}
            />
              <Text fontSize="sm">{getOnlineStatusText(profile.onlineStatus)}</Text>
            </HStack>
          </Badge>
        </Box>
      
        {/* Profile Info */}
        <CardBody pt={0}>
        <VStack spacing={6} align="stretch">
            {/* Avatar and Basic Info */}
            <HStack spacing={4} align="start">
                <Avatar
                size="2xl"
                  src={profile.avatar}
                name={profile.displayName || profile.username}
                  border="4px solid white"
                boxShadow="lg"
                position="relative"
                top="-40px"
              />
              
              <VStack align="start" spacing={2} flex={1} pt={2}>
                <HStack spacing={3} align="center">
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {profile.displayName || profile.username}
                  </Text>
                  
                  {profile.isVerified && (
                    <Badge colorScheme="blue" size="sm">
                      <HStack spacing={1}>
                        <Icon as={FiShield} />
                        <Text>Đã xác thực</Text>
                </HStack>
                  </Badge>
                  )}
                </HStack>
                
                <Text color="gray.600" fontSize="lg">
                  @{profile.username}
                </Text>
                
                {profile.bio && (
                  <Text color="gray.700" fontSize="md">
                    {profile.bio}
                  </Text>
                )}
                
                {/* Location and Website */}
                <HStack spacing={4} color="gray.500">
                  {profile.location && (
                    <HStack spacing={1}>
                      <Icon as={FiMapPin} />
                      <Text fontSize="sm">{profile.location}</Text>
                    </HStack>
                  )}
                  
                  {profile.website && (
                    <HStack spacing={1}>
                      <Icon as={FiGlobe} />
                      <Link href={profile.website} isExternal fontSize="sm">
                        {profile.website}
                      </Link>
                    </HStack>
                  )}
                  
                  <HStack spacing={1}>
                    <Icon as={FiCalendar} />
                    <Text fontSize="sm">
                      Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            
            {/* Action Buttons */}
              <VStack spacing={2} align="end">
              {isOwnProfile ? (
                <Button
                    leftIcon={<Icon as={FiEdit} />}
                    colorScheme="blue.900"
                  onClick={onEditOpen}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <VStack spacing={2}>
                    {friendshipStatus === 'none' && (
                    <Button
                        leftIcon={<Icon as={FiUserPlus} />}
                      colorScheme="blue"
                      onClick={handleSendFriendRequest}
                      isLoading={sendingRequest}
                      loadingText="Đang gửi..."
                    >
                      Kết bạn
                    </Button>
                  )}
                  
                  {friendshipStatus === 'pending' && (
                      <Badge colorScheme="yellow" size="lg">
                        <HStack spacing={1}>
                          <Icon as={FiClock} />
                          <Text>Đã gửi lời mời</Text>
                        </HStack>
                      </Badge>
                    )}
                    
                    {friendshipStatus === 'friends' && (
                      <Badge colorScheme="green" size="lg">
                        <HStack spacing={1}>
                          <Icon as={FiUserCheck} />
                          <Text>Bạn bè</Text>
                        </HStack>
                      </Badge>
                    )}
                    
                    <Button
                      leftIcon={<Icon as={FiMessageCircle} />}
                      variant="outline"
                      colorScheme="blue.900"
                    >
                      Nhắn tin
                    </Button>
                  </VStack>
                  )}
                </VStack>
              </HStack>
          
          <Divider />
          
            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat textAlign="center">
                <StatLabel color="gray.600" fontWeight="semibold">Level</StatLabel>
                <StatNumber color="blue.900" fontSize="2xl" fontWeight="bold">
                  {levelProgress.current}
                </StatNumber>
                <StatHelpText fontWeight="medium">
                  <Progress
                    value={levelProgress.percentage}
                    size="sm"
                    colorScheme="blue.900"
                    borderRadius="full"
                  />
                </StatHelpText>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel color="gray.600" fontWeight="semibold">XP</StatLabel>
                <StatNumber color="blue.600" fontSize="2xl" fontWeight="bold">
                  {userProgress?.currentXP || 0}
                </StatNumber>
                <StatHelpText fontWeight="medium">Điểm kinh nghiệm</StatHelpText>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel color="gray.600" fontWeight="semibold">Nhiệm vụ</StatLabel>
                <StatNumber color="green.600" fontSize="2xl" fontWeight="bold">
                  {userProgress?.completedTodos || 0}
                </StatNumber>
                <StatHelpText fontWeight="medium">Đã hoàn thành</StatHelpText>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel color="gray.600" fontWeight="semibold">Thành tích</StatLabel>
                <StatNumber color="orange.600" fontSize="2xl" fontWeight="bold">
                  {userProgress?.achievements?.length || 0}
                </StatNumber>
                <StatHelpText fontWeight="medium">Đã đạt được</StatHelpText>
              </Stat>
            </SimpleGrid>
            
            <Divider />
          
            {/* Social Stats */}
                <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                Thống kê xã hội
                  </Text>
              
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <HStack spacing={2} justify="center">
                  <Icon as={FiHeart} color="red.500" />
                  <VStack spacing={0} align="center">
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      {profile.stats?.likes || 0}
                    </Text>
                    <Text fontSize="sm" color="gray.600">Lượt thích</Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={2} justify="center">
                  <Icon as={FiMessageCircle} color="blue.500" />
                  <VStack spacing={0} align="center">
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      {profile.stats?.comments || 0}
                    </Text>
                    <Text fontSize="sm" color="gray.600">Bình luận</Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={2} justify="center">
                  <Icon as={FiShare2} color="green.500" />
                  <VStack spacing={0} align="center">
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      {profile.stats?.shares || 0}
                  </Text>
                    <Text fontSize="sm" color="gray.600">Chia sẻ</Text>
            </VStack>
                </HStack>
                
                <HStack spacing={2} justify="center">
                  <Icon as={FiUser} color="purple.500" />
                  <VStack spacing={0} align="center">
                    <Text fontSize="xl" fontWeight="bold" color="gray.800">
                      {profile.stats?.connections || 0}
              </Text>
                    <Text fontSize="sm" color="gray.600">Kết nối</Text>
                  </VStack>
              </HStack>
              </SimpleGrid>
            </Box>
        </VStack>
      </CardBody>
      </Card>
      
      {/* Profile Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Chỉnh sửa Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Chức năng chỉnh sửa profile sẽ được mở rộng trong phiên bản tiếp theo.
                Hiện tại bạn có thể sử dụng tab "Chỉnh sửa" trong Profile Dashboard.
              </Text>
              
                <Button
                colorScheme="purple"
                onClick={() => {
                  onEditClose();
                  // Navigate to edit tab
                  window.location.hash = '#edit';
                }}
              >
                Mở Profile Dashboard
                </Button>
            </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
    </MotionBox>
  );
}
