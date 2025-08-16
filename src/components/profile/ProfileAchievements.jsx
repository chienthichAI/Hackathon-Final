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
  Progress,
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
  Wrap,
  WrapItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import {
  FiAward,
  FiStar,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiSearch,
  FiEye,
  FiDownload,
  FiShare2,
  FiHeart,
  FiMessageCircle,
  FiUsers,
  FiZap,
  FiBookOpen,
  FiCalendar,
  FiMapPin,
  FiGithub,
  FiCode,
  FiEdit3,
  FiMusic,
  FiCamera,
  FiVideo,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle as FiCheckCircleIcon,
  FiXCircle,
} from 'react-icons/fi';

const ProfileAchievements = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    totalPoints: 0,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  useEffect(() => {
    filterAndSortAchievements();
  }, [achievements, activeTab, filterRarity, sortBy, searchTerm]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${userId}/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        calculateStats(data.achievements || []);
      } else {
        throw new Error('Failed to fetch achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (achievementsList) => {
    const stats = {
      total: achievementsList.length,
      unlocked: achievementsList.filter(a => a.unlocked).length,
      locked: achievementsList.filter(a => !a.unlocked).length,
      rare: achievementsList.filter(a => a.rarity === 'rare').length,
      epic: achievementsList.filter(a => a.rarity === 'epic').length,
      legendary: achievementsList.filter(a => a.rarity === 'legendary').length,
      totalPoints: achievementsList.reduce((sum, a) => sum + (a.points || 0), 0),
    };
    setStats(stats);
  };

  const filterAndSortAchievements = () => {
    let filtered = [...achievements];

    // Filter by tab
    switch (activeTab) {
      case 'unlocked':
        filtered = filtered.filter(a => a.unlocked);
        break;
      case 'locked':
        filtered = filtered.filter(a => !a.unlocked);
        break;
      case 'recent':
        filtered = filtered.filter(a => a.unlocked).slice(0, 10);
        break;
      default:
        break;
    }

    // Filter by rarity
    if (filterRarity !== 'all') {
      filtered = filtered.filter(a => a.rarity === filterRarity);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort achievements
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.unlockedAt || 0) - new Date(a.unlockedAt || 0);
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });

    setFilteredAchievements(filtered);
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    onOpen();
  };

  const handleRefresh = () => {
    fetchAchievements();
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'gray';
      case 'rare': return 'blue';
      case 'epic': return 'purple';
      case 'legendary': return 'orange';
      default: return 'gray';
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'common': return FiStar;
      case 'rare': return FiStar;
      case 'epic': return FiAward;
      case 'legendary': return FiAward;
      default: return FiStar;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'learning': return FiBookOpen;
      case 'social': return FiUsers;
      case 'creative': return FiEdit3;
      case 'gaming': return FiZap;
      case 'coding': return FiCode;
      case 'music': return FiMusic;
      case 'photography': return FiCamera;
      case 'video': return FiVideo;
      default: return FiStar;
    }
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Đang tải thành tích...</Text>
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
            <Icon as={FiAward} color="blue.900" mr={2} />
            Thành tích & Huy hiệu
          </Heading>
          <Text color="gray.600" fontWeight="medium">
            Khám phá và theo dõi tiến độ thành tích của bạn
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
          label="Tổng thành tích"
          value={stats.total}
          icon={FiAward}
          color="blue"
        />
        
        <StatCard
          label="Đã mở khóa"
          value={stats.unlocked}
          icon={FiCheckCircle}
          color="green"
        />
        
        <StatCard
          label="Chưa mở khóa"
          value={stats.locked}
          icon={FiClock}
          color="orange"
        />
        
        <StatCard
          label="Tổng điểm"
          value={stats.totalPoints}
          icon={FiStar}
          color="purple"
        />
      </SimpleGrid>

      {/* Progress Bar */}
      <Card bg={cardBg}>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="lg" fontWeight="semibold">Tiến độ mở khóa</Text>
              <Text fontSize="lg" color="blue.900" fontWeight="bold">
                {stats.unlocked}/{stats.total}
              </Text>
            </HStack>
            
            <Progress 
              value={stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0} 
              colorScheme="blue.900" 
              size="lg"
              borderRadius="full"
            />
            
            <Text fontSize="sm" color="gray.600">
              {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}% hoàn thành
            </Text>
          </VStack>
        </CardBody>
      </Card>

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
              <option value="all">Tất cả</option>
              <option value="unlocked">Đã mở khóa</option>
              <option value="locked">Chưa mở khóa</option>
              <option value="recent">Gần đây</option>
            </Select>
            
            <Select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="all">Tất cả độ hiếm</option>
              <option value="common">Thường</option>
              <option value="rare">Hiếm</option>
              <option value="epic">Epic</option>
              <option value="legendary">Huyền thoại</option>
            </Select>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              w="150px"
            >
              <option value="date">Sắp xếp theo ngày</option>
              <option value="name">Sắp xếp theo tên</option>
              <option value="points">Sắp xếp theo điểm</option>
              <option value="rarity">Sắp xếp theo độ hiếm</option>
            </Select>
            
            <Box flex="1" minW="200px">
              <HStack spacing={2}>
                <Icon as={FiSearch} color="gray.400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thành tích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </HStack>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* Achievements Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <AchievementCard
                achievement={achievement}
                onClick={() => handleAchievementClick(achievement)}
                getRarityColor={getRarityColor}
                getRarityIcon={getRarityIcon}
                getCategoryIcon={getCategoryIcon}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SimpleGrid>

      {/* No Results */}
      {filteredAchievements.length === 0 && (
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={12}>
            <VStack spacing={4}>
                              <Icon as={FiInfo} w="16" h="16" color="gray.400" />
              <Text fontSize="lg" color="gray.500">
                Không tìm thấy thành tích nào
              </Text>
              <Text fontSize="sm" color="gray.400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        isOpen={isOpen}
        onClose={onClose}
        achievement={selectedAchievement}
        getRarityColor={getRarityColor}
        getRarityIcon={getRarityIcon}
        getCategoryIcon={getCategoryIcon}
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
            <Icon color={`${color}.500`} w="8" h="8" />
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

// Achievement Card Component
const AchievementCard = ({ achievement, onClick, getRarityColor, getRarityIcon, getCategoryIcon }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const RarityIcon = getRarityIcon(achievement.rarity);
  const CategoryIcon = getCategoryIcon(achievement.category);

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
        borderColor: getRarityColor(achievement.rarity) + '.300'
      }}
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Achievement Icon */}
          <Box textAlign="center" position="relative">
            <Box
              w="80px"
              h="80px"
              mx="auto"
              borderRadius="full"
              bg={achievement.unlocked ? `${getRarityColor(achievement.rarity)}.100` : 'gray.100'}
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Icon 
                as={achievement.unlocked ? FiAward : FiClock}
                w="10"
                h="10"
                color={achievement.unlocked ? `${getRarityColor(achievement.rarity)}.500` : 'gray.400'}
              />
              
              {/* Rarity Badge */}
              <Badge
                position="absolute"
                top={-2}
                right={-2}
                colorScheme={getRarityColor(achievement.rarity)}
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
              >
                <HStack spacing={1}>
                  <RarityIcon size={12} />
                  <Text>{achievement.rarity}</Text>
                </HStack>
              </Badge>
            </Box>
          </Box>

          {/* Achievement Info */}
          <VStack spacing={2} align="stretch">
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              {achievement.name}
            </Text>
            
            <Text fontSize="sm" color="gray.600" textAlign="center" noOfLines={2}>
              {achievement.description}
            </Text>
            
            <HStack justify="center" spacing={2}>
              <Badge colorScheme="blue" variant="subtle">
                <HStack spacing={1}>
                  <CategoryIcon size={12} />
                  <Text>{achievement.category}</Text>
                </HStack>
              </Badge>
              
              <Badge colorScheme="green" variant="subtle">
                {achievement.points} XP
              </Badge>
            </HStack>
          </VStack>

          {/* Unlock Status */}
          {achievement.unlocked ? (
            <HStack justify="center" spacing={2}>
              <Icon as={FiCheckCircle} color="green.500" />
              <Text fontSize="sm" color="green.600" fontWeight="medium">
                Đã mở khóa
              </Text>
            </HStack>
          ) : (
            <HStack justify="center" spacing={2}>
              <Icon as={FiClock} color="orange.500" />
              <Text fontSize="sm" color="orange.600" fontWeight="medium">
                Chưa mở khóa
              </Text>
            </HStack>
          )}

          {/* Progress Bar for Locked Achievements */}
          {!achievement.unlocked && achievement.progress && (
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.600">Tiến độ</Text>
                <Text fontSize="xs" color="gray.600">
                  {achievement.progress.current}/{achievement.progress.required}
                </Text>
              </HStack>
              <Progress 
                value={(achievement.progress.current / achievement.progress.required) * 100} 
                colorScheme={getRarityColor(achievement.rarity)} 
                size="sm"
                borderRadius="full"
              />
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Achievement Detail Modal
const AchievementDetailModal = ({ isOpen, onClose, achievement, getRarityColor, getRarityIcon, getCategoryIcon }) => {
  if (!achievement) return null;

  const RarityIcon = getRarityIcon(achievement.rarity);
  const CategoryIcon = getCategoryIcon(achievement.category);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiAward} color={`${getRarityColor(achievement.rarity)}.500`} />
            <Text>{achievement.name}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Achievement Icon */}
            <Box textAlign="center">
              <Box
                w="120px"
                h="120px"
                mx="auto"
                borderRadius="full"
                bg={achievement.unlocked ? `${getRarityColor(achievement.rarity)}.100` : 'gray.100'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <Icon 
                  as={achievement.unlocked ? FiAward : FiClock}
                  w="16"
                  h="16"
                  color={achievement.unlocked ? `${getRarityColor(achievement.rarity)}.500` : 'gray.400'}
                />
              </Box>
            </Box>

            {/* Achievement Details */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" textAlign="center" fontWeight="medium">
                {achievement.description}
              </Text>
              
              <HStack justify="center" spacing={4}>
                <Badge colorScheme={getRarityColor(achievement.rarity)} size="lg">
                  <HStack spacing={2}>
                    <RarityIcon size={16} />
                    <Text>{achievement.rarity}</Text>
                  </HStack>
                </Badge>
                
                <Badge colorScheme="blue" size="lg">
                  <HStack spacing={2}>
                    <CategoryIcon size={16} />
                    <Text>{achievement.category}</Text>
                  </HStack>
                </Badge>
                
                <Badge colorScheme="green" size="lg">
                  {achievement.points} XP
                </Badge>
              </HStack>
            </VStack>

            <Divider />

            {/* Achievement Info */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Trạng thái:</Text>
                <Badge 
                  colorScheme={achievement.unlocked ? 'green' : 'orange'}
                  size="lg"
                >
                  {achievement.unlocked ? 'Đã mở khóa' : 'Chưa mở khóa'}
                </Badge>
              </HStack>
              
              {achievement.unlocked && achievement.unlockedAt && (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Ngày mở khóa:</Text>
                  <Text>{new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}</Text>
                </HStack>
              )}
              
              {achievement.requirements && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Yêu cầu:</Text>
                  <List spacing={2}>
                    {achievement.requirements.map((req, index) => (
                      <ListItem key={index}>
                        <ListIcon 
                          as={req.completed ? FiCheckCircleIcon : FiXCircle} 
                          color={req.completed ? 'green.500' : 'red.500'} 
                        />
                        {req.description}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {!achievement.unlocked && achievement.progress && (
                <Box>
                  <Text fontWeight="medium" mb={2}>Tiến độ:</Text>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">
                      {achievement.progress.current}/{achievement.progress.required}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {Math.round((achievement.progress.current / achievement.progress.required) * 100)}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={(achievement.progress.current / achievement.progress.required) * 100} 
                    colorScheme={getRarityColor(achievement.rarity)} 
                    size="lg"
                    borderRadius="full"
                  />
                </Box>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileAchievements; 