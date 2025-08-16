import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Image,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spacer,
  Tooltip,
  Alert,
  AlertIcon,
  Avatar,
  AvatarBadge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Heading,
  SimpleGrid,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  FiAward,
  FiStar,
  FiDollarSign,
  FiHeart,
  FiEye,
  FiTriangle,
  FiSquare,
  FiVolume,
  FiVolumeX,
  FiSliders,
  FiSearch,
  FiArrowUp,
  FiZap,
  FiImage,
  FiFile,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiPlus,
  FiMinus,
  FiSettings,
  FiInfo,
  FiShoppingBag,
  FiArrowDown,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ProfileDecorations = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [decorations, setDecorations] = useState([]);
  const [userDecorations, setUserDecorations] = useState([]);
  const [equippedDecorations, setEquippedDecorations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterRarity, setFilterRarity] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [equipping, setEquipping] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Rarity colors and icons
  const rarityConfig = {
    common: { color: 'gray', icon: FiStar, bg: 'gray.100', textColor: 'gray.800' },
    rare: { color: 'blue', icon: FiStar, bg: 'blue.100', textColor: 'blue.800' },
    epic: { color: 'orange', icon: FiStar, bg: 'orange.100', textColor: 'orange.800' },
    legendary: { color: 'orange', icon: FiAward, bg: 'orange.100', textColor: 'orange.800' },
    mythic: { color: 'red', icon: FiAward, bg: 'red.100', textColor: 'red.800' }
  };

  // Category icons
  const categoryIcons = {
    frames: FiFile,
    banners: FiImage,
    badges: FiAward,
    effects: FiStar,
    titles: FiAward,
    backgrounds: FiFile,
    animations: FiZap
  };

  useEffect(() => {
    fetchDecorations();
  }, []);

  const fetchDecorations = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockDecorations = [
        {
          id: 1,
          name: 'Golden Frame',
          description: 'Beautiful golden frame for your profile',
          category: 'frames',
          rarity: 'rare',
          price_coins: 1000,
          price_gems: 0,
          is_featured: true,
          effects: { features: ['glow', 'animation', 'sparkle'] }
        },
        {
          id: 2,
          name: 'Dragon Badge',
          description: 'Epic dragon badge with fire effects',
          category: 'badges',
          rarity: 'epic',
          price_coins: 0,
          price_gems: 50,
          is_featured: false,
          effects: { features: ['fire', 'smoke', 'roar'] }
        }
      ];
      
      setDecorations(mockDecorations);
      setCategories([
        { category: 'frames', count: 5, icon: '🖼️' },
        { category: 'badges', count: 3, icon: '🏅' },
        { category: 'effects', count: 8, icon: '✨' }
      ]);
    } catch (error) {
      console.error('Error fetching decorations:', error);
      setDecorations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDecorations = decorations.filter(decoration => {
    const matchesCategory = activeCategory === 'all' || decoration.category === activeCategory;
    const matchesSearch = decoration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decoration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || decoration.rarity === filterRarity;
    
    return matchesCategory && matchesSearch && matchesRarity;
  });

  const sortedDecorations = [...filteredDecorations].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price_coins - b.price_coins;
      case 'price_high':
        return b.price_coins - a.price_coins;
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleDecorationClick = (decoration) => {
    setSelectedDecoration(decoration);
    onOpen();
  };

  const handlePurchase = async (decoration) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make purchases',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const canAfford = decoration.price_gems > 0 
      ? (user.gems || 0) >= decoration.price_gems
      : (user.coins || 0) >= decoration.price_coins;

    if (!canAfford) {
      toast({
        title: 'Insufficient Funds',
        description: decoration.price_gems > 0 
          ? `You need ${decoration.price_gems} gems to purchase this decoration`
          : `You need ${decoration.price_coins} coins to purchase this decoration`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setPurchasing(true);
    try {
      // Mock purchase - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Purchase Successful!',
        description: `You've purchased ${decoration.name}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Add to user decorations
      setUserDecorations(prev => [...prev, { ...decoration, is_equipped: false }]);
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'There was an error processing your purchase',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setPurchasing(false);
      onClose();
    }
  };

  const handleEquip = async (decoration) => {
    setEquipping(true);
    try {
      // Mock equip - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Decoration Equipped!',
        description: `${decoration.name} is now active on your profile!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Update equipped status
      setUserDecorations(prev => 
        prev.map(d => ({
          ...d,
          is_equipped: d.id === decoration.id ? true : d.is_equipped
        }))
      );
      
    } catch (error) {
      console.error('Equip error:', error);
      toast({
        title: 'Equip Failed',
        description: 'There was an error equipping the decoration',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEquipping(false);
    }
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading beautiful decorations...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="purple.50" p={6}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Heading size="xl" color="blue.900" fontWeight="black" mb={4}>
          Profile Decorations
        </Heading>
        <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto" fontWeight="medium">
          Customize your profile with beautiful animated decorations, frames, and effects
        </Text>
      </motion.div>

      {/* User Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card bg={bgColor} shadow="lg">
          <CardBody>
            <Flex justify="space-between" align="center">
              <HStack spacing={6}>
                <HStack spacing={2}>
                                          <Icon as={FiDollarSign} color="yellow.500" boxSize={6} />
                  <VStack spacing={1} align="start">
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">{user?.coins || 0}</Text>
                    <Text fontSize="sm" color="gray.600">Coins</Text>
                  </VStack>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FiStar} color="blue.900" boxSize={6} />
                  <VStack spacing={1} align="start">
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900">{user?.gems || 0}</Text>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">Gems</Text>
                  </VStack>
                </HStack>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiStar} color="blue.500" boxSize={5} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.900">{userDecorations.length}</Text>
                <Text fontSize="sm" color="gray.600">Decorations</Text>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      </motion.div>

      {/* Category Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card bg={bgColor} shadow="lg">
          <CardBody>
            <Wrap spacing={2}>
              <WrapItem>
                <Button
                onClick={() => setActiveCategory('all')}
                  colorScheme={activeCategory === 'all' ? 'blue.900' : 'gray'}
                  variant={activeCategory === 'all' ? 'solid' : 'outline'}
                  size="sm"
                >
                  🌟 All
                </Button>
              </WrapItem>
              {categories.map((category) => (
                <WrapItem key={category.category}>
                  <Button
                  onClick={() => setActiveCategory(category.category)}
                    colorScheme={activeCategory === category.category ? 'blue.900' : 'gray'}
                    variant={activeCategory === category.category ? 'solid' : 'outline'}
                    size="sm"
                >
                  <span>{category.icon}</span>
                  <span>{category.category}</span>
                    <Badge colorScheme="blue.900" ml={1}>{category.count}</Badge>
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          </CardBody>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card bg={bgColor} shadow="lg">
          <CardBody>
            <HStack spacing={4} flexWrap="wrap">
              {/* Search */}
              <Box flex="1" minW="64">
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search decorations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>

              {/* Rarity Filter */}
              <Select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                size="sm"
                w="150px"
              >
                <option value="all">All Rarities</option>
                {Object.keys(rarityConfig).map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </Select>

              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="sm"
                w="150px"
              >
                <option value="name">Sort by Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rarity">Sort by Rarity</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>
      </motion.div>

      {/* Decorations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {sortedDecorations.map((decoration, index) => {
            const rarity = rarityConfig[decoration.rarity];
            const RarityIcon = rarity.icon;
            const CategoryIcon = categoryIcons[decoration.category];
            
            return (
              <motion.div
                key={decoration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  bg={bgColor}
                  shadow="lg"
                  _hover={{ shadow: 'xl' }}
                  transition="all 0.3s"
                  cursor="pointer"
                  overflow="hidden"
                  onClick={() => handleDecorationClick(decoration)}
                >
                  {/* Decoration Preview */}
                  <Box position="relative" h="48" bg="gray.100" overflow="hidden">
                    <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="6xl" animation="pulse 2s infinite">
                        {decoration.category === 'frames' && '🖼️'}
                        {decoration.category === 'banners' && '🎨'}
                        {decoration.category === 'badges' && '🏅'}
                        {decoration.category === 'effects' && '✨'}
                        {decoration.category === 'titles' && '👑'}
                        {decoration.category === 'backgrounds' && '🖼️'}
                        {decoration.category === 'animations' && '🎭'}
                      </Text>
                    </Box>
                    {decoration.is_featured && (
                      <Badge position="absolute" top={2} left={2} colorScheme="red" animation="pulse 2s infinite">
                        <Icon as={FiStar} mr={1} />
                          Featured
                        </Badge>
                    )}
                    <Badge position="absolute" top={2} right={2} colorScheme="blue.900">
                      <Icon as={CategoryIcon} mr={1} />
                        {decoration.category}
                      </Badge>
                      <Badge 
                      position="absolute" bottom={2} right={2}
                        colorScheme={rarity.color}
                      display="flex"
                      alignItems="center"
                      spacing={1}
                      >
                      <Icon as={RarityIcon} boxSize={3} />
                      <Text>{decoration.rarity}</Text>
                      </Badge>
                  </Box>

                  <CardBody>
                    {/* Decoration Info */}
                    <Box mb={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="lg" fontWeight="bold" color="gray.900">{decoration.name}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" mb={3}>{decoration.description}</Text>
                      
                      {/* Effects Preview */}
                      {decoration.effects && decoration.effects.features && (
                        <Wrap spacing={1} mb={3}>
                          {decoration.effects.features.slice(0, 3).map((feature, idx) => (
                            <WrapItem key={idx}>
                              <Badge colorScheme="blue" size="sm">
                              {feature.replace(/_/g, ' ')}
                            </Badge>
                            </WrapItem>
                          ))}
                          {decoration.effects.features.length > 3 && (
                            <WrapItem>
                            <Badge colorScheme="gray" size="sm">
                              +{decoration.effects.features.length - 3} more
                            </Badge>
                            </WrapItem>
                          )}
                        </Wrap>
                      )}
                    </Box>

                    {/* Price */}
                    <HStack justify="space-between" mb={4}>
                      <HStack spacing={2}>
                        {decoration.price_gems > 0 ? (
                          <>
                            <Icon as={FiStar} color="purple.500" />
                            <Text fontWeight="bold" color="purple.600">{decoration.price_gems}</Text>
                          </>
                        ) : (
                          <>
                            <Icon as={FiDollarSign} color="yellow.500" />
                            <Text fontWeight="bold" color="yellow.600">{decoration.price_coins}</Text>
                          </>
                        )}
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(decoration);
                        }}
                      >
                        <Icon as={FiShoppingBag} mr={1} />
                        Purchase
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </Grid>
      </motion.div>

      {/* Decoration Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Text fontSize="2xl">
            {selectedDecoration && (
              <>
                  {selectedDecoration.category === 'frames' && '🖼️'}
                  {selectedDecoration.category === 'banners' && '🎨'}
                  {selectedDecoration.category === 'badges' && '🏅'}
                  {selectedDecoration.category === 'effects' && '✨'}
                  {selectedDecoration.category === 'titles' && '👑'}
                  {selectedDecoration.category === 'backgrounds' && '🖼️'}
                  {selectedDecoration.category === 'animations' && '🎭'}
              </>
            )}
                {selectedDecoration?.name}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDecoration && (
              <VStack spacing={6} align="stretch">
                {/* Decoration Preview */}
                <Box position="relative" h="64" bg="gray.100" borderRadius="lg" overflow="hidden">
                  <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="8xl" animation="pulse 2s infinite">
                      {selectedDecoration.category === 'frames' && '🖼️'}
                      {selectedDecoration.category === 'banners' && '🎨'}
                      {selectedDecoration.category === 'badges' && '🏅'}
                      {selectedDecoration.category === 'effects' && '✨'}
                      {selectedDecoration.category === 'titles' && '👑'}
                      {selectedDecoration.category === 'backgrounds' && '🖼️'}
                      {selectedDecoration.category === 'animations' && '🎭'}
                    </Text>
                  </Box>
                  <HStack position="absolute" bottom={4} right={4} spacing={2}>
                    <Button size="sm" variant="outline">
                      <Icon as={FiTriangle} mr={1} />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Icon as={FiVolume} mr={1} />
                    </Button>
                  </HStack>
                </Box>

                {/* Decoration Details */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>Description</Text>
                  <Text color="gray.600">{selectedDecoration.description}</Text>
                </Box>

                {/* Effects */}
                {selectedDecoration.effects && (
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={2}>Effects</Text>
                    <Wrap spacing={2}>
                      {selectedDecoration.effects.features?.map((feature, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="purple">
                          {feature.replace(/_/g, ' ')}
                        </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* Price and Actions */}
                <HStack spacing={4} justify="space-between">
                  <HStack spacing={4}>
                    {selectedDecoration.price_gems > 0 ? (
                      <HStack spacing={2}>
                        <Icon as={FiStar} color="purple.500" boxSize={6} />
                        <VStack spacing={1} align="start">
                          <Text fontSize="2xl" fontWeight="bold" color="purple.600">{selectedDecoration.price_gems}</Text>
                          <Text fontSize="sm" color="gray.600">Gems</Text>
                        </VStack>
                      </HStack>
                    ) : (
                      <HStack spacing={2}>
                        <Icon as={FiDollarSign} color="yellow.500" boxSize={6} />
                        <VStack spacing={1} align="start">
                          <Text fontSize="2xl" fontWeight="bold" color="yellow.600">{selectedDecoration.price_coins}</Text>
                          <Text fontSize="sm" color="gray.600">Coins</Text>
                        </VStack>
                      </HStack>
                    )}
                  </HStack>
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={() => handlePurchase(selectedDecoration)}
                    isLoading={purchasing}
                    loadingText="Purchasing..."
                  >
                    <Icon as={FiShoppingBag} mr={2} />
                    Purchase Now
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileDecorations; 