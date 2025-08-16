import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Text,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Heading,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Badge,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiShield,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiGlobe,
  FiUser,
  FiUsers,
  FiMessageCircle,
  FiHeart,
  FiShare2,
  FiSearch,
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

const ProfilePrivacyModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    // Profile Visibility
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: false,
    showBirthDate: false,
    showOnlineStatus: true,
    allowSearch: true,
    allowMessages: true,
    allowFriendRequests: true,
    allowProfileViews: true,
    
    // Content Visibility
    showPosts: true,
    showTodos: true,
    showAchievements: true,
    showActivity: true,
    showFriends: true,
    showGroups: true,
    
    // Interaction Permissions
    allowComments: true,
    allowLikes: true,
    allowShares: true,
    allowMentions: true,
    allowTags: true,
    
    // Search & Discovery
    allowDiscovery: true,
    showInLeaderboards: true,
    showInSuggestions: true,
    
    // Data Access
    allowDataExport: true,
    allowDataAnalytics: true,
    allowThirdPartyAccess: false,
    
    // Advanced Privacy
    hideFromBots: true,
    requireApprovalForTags: true,
    blurSensitiveContent: false,
    autoHideInactive: false,
  });

  // Privacy score calculation
  const [privacyScore, setPrivacyScore] = useState(85);
  const [privacyLevel, setPrivacyLevel] = useState('Good');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (profile && isOpen) {
      initializePrivacySettings();
    }
  }, [profile, isOpen]);

  useEffect(() => {
    calculatePrivacyScore();
  }, [privacySettings]);

  const initializePrivacySettings = () => {
    if (!profile) return;
    
    setPrivacySettings({
      profileVisibility: profile.privacy?.profileVisibility || 'public',
      showEmail: profile.privacy?.showEmail || false,
      showPhone: profile.privacy?.showPhone || false,
      showLocation: profile.privacy?.showLocation || false,
      showBirthDate: profile.privacy?.showBirthDate || false,
      showOnlineStatus: profile.privacy?.showOnlineStatus !== false,
      allowSearch: profile.privacy?.allowSearch !== false,
      allowMessages: profile.privacy?.allowMessages !== false,
      allowFriendRequests: profile.privacy?.allowFriendRequests !== false,
      allowProfileViews: profile.privacy?.allowProfileViews !== false,
      showPosts: profile.privacy?.showPosts !== false,
      showTodos: profile.privacy?.showTodos !== false,
      showAchievements: profile.privacy?.showAchievements !== false,
      showActivity: profile.privacy?.showActivity !== false,
      showFriends: profile.privacy?.showFriends !== false,
      showGroups: profile.privacy?.showGroups !== false,
      allowComments: profile.privacy?.allowComments !== false,
      allowLikes: profile.privacy?.allowLikes !== false,
      allowShares: profile.privacy?.allowShares !== false,
      allowMentions: profile.privacy?.allowMentions !== false,
      allowTags: profile.privacy?.allowTags !== false,
      allowDiscovery: profile.privacy?.allowDiscovery !== false,
      showInLeaderboards: profile.privacy?.showInLeaderboards !== false,
      showInSuggestions: profile.privacy?.showInSuggestions !== false,
      allowDataExport: profile.privacy?.allowDataExport !== false,
      allowDataAnalytics: profile.privacy?.allowDataAnalytics !== false,
      allowThirdPartyAccess: profile.privacy?.allowThirdPartyAccess || false,
      hideFromBots: profile.privacy?.hideFromBots !== false,
      requireApprovalForTags: profile.privacy?.requireApprovalForTags !== false,
      blurSensitiveContent: profile.privacy?.blurSensitiveContent || false,
      autoHideInactive: profile.privacy?.autoHideInactive || false,
    });
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculatePrivacyScore = () => {
    let score = 100;
    const settings = privacySettings;
    
    // Deduct points for public settings
    if (settings.profileVisibility === 'public') score -= 10;
    if (settings.showEmail) score -= 15;
    if (settings.showPhone) score -= 15;
    if (settings.showLocation) score -= 10;
    if (settings.showBirthDate) score -= 10;
    if (settings.showOnlineStatus) score -= 5;
    if (settings.allowSearch) score -= 5;
    if (settings.allowDiscovery) score -= 5;
    if (settings.showInLeaderboards) score -= 5;
    if (settings.allowThirdPartyAccess) score -= 20;
    
    // Add points for private settings
    if (settings.profileVisibility === 'private') score += 10;
    if (settings.hideFromBots) score += 5;
    if (settings.requireApprovalForTags) score += 5;
    if (settings.blurSensitiveContent) score += 5;
    
    score = Math.max(0, Math.min(100, score));
    setPrivacyScore(score);
    
    if (score >= 80) setPrivacyLevel('Excellent');
    else if (score >= 60) setPrivacyLevel('Good');
    else if (score >= 40) setPrivacyLevel('Fair');
    else setPrivacyLevel('Poor');
  };

  const getPrivacyLevelColor = (level) => {
    switch (level) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'yellow';
      case 'Poor': return 'red';
      default: return 'gray';
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/profile/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ privacy: privacySettings })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile.profile);
        
        toast({
          title: '✅ Lưu quyền riêng tư thành công',
          description: 'Cài đặt quyền riêng tư đã được cập nhật',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to save privacy settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: '❌ Lỗi lưu quyền riêng tư',
        description: 'Không thể lưu cài đặt quyền riêng tư. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPrivacy = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt quyền riêng tư về mặc định?')) {
      initializePrivacySettings();
      toast({
        title: '🔄 Đã đặt lại quyền riêng tư',
        description: 'Cài đặt quyền riêng tư đã được đặt lại về mặc định',
        status: 'info',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiShield} color="purple.500" />
            <Text>Quyền riêng tư Profile</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Privacy Score Overview */}
            <Box p={6} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
              <HStack justify="space-between" mb={4}>
                <Heading size="md" color="purple.700">Điểm quyền riêng tư</Heading>
                <Badge colorScheme={getPrivacyLevelColor(privacyLevel)} size="lg">
                  {privacyLevel}
                </Badge>
              </HStack>
              
              <VStack spacing={4}>
                <Progress 
                  value={privacyScore} 
                  colorScheme={getPrivacyLevelColor(privacyLevel)} 
                  size="lg"
                  borderRadius="full"
                />
                
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                  <Stat textAlign="center">
                    <StatLabel fontSize="sm">Điểm tổng</StatLabel>
                    <StatNumber color="purple.600" fontSize="2xl">
                      {privacyScore}/100
                    </StatNumber>
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel fontSize="sm">Mức độ</StatLabel>
                    <StatNumber color={`${getPrivacyLevelColor(privacyLevel)}.600`} fontSize="2xl">
                      {privacyLevel}
                    </StatNumber>
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel fontSize="sm">Cài đặt</StatLabel>
                    <StatNumber color="blue.600" fontSize="2xl">
                      {Object.keys(privacySettings).length}
                    </StatNumber>
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel fontSize="sm">Trạng thái</StatLabel>
                    <StatNumber color="green.600" fontSize="2xl">
                      {privacySettings.profileVisibility}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Privacy Settings Accordion */}
            <Accordion allowMultiple>
              {/* Profile Visibility Section */}
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={3}>
                      <Icon as={FiUser} color="blue.500" />
                      <Text fontWeight="semibold">Hiển thị Profile</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Hiển thị profile</FormLabel>
                      <Select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      >
                        <option value="public">Công khai - Ai cũng có thể xem</option>
                        <option value="friends">Bạn bè - Chỉ bạn bè có thể xem</option>
                        <option value="private">Riêng tư - Chỉ bạn có thể xem</option>
                      </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị email</FormLabel>
                        <Switch
                          isChecked={privacySettings.showEmail}
                          onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị số điện thoại</FormLabel>
                        <Switch
                          isChecked={privacySettings.showPhone}
                          onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị địa chỉ</FormLabel>
                        <Switch
                          isChecked={privacySettings.showLocation}
                          onChange={(e) => handlePrivacyChange('showLocation', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị ngày sinh</FormLabel>
                        <Switch
                          isChecked={privacySettings.showBirthDate}
                          onChange={(e) => handlePrivacyChange('showBirthDate', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị trạng thái online</FormLabel>
                        <Switch
                          isChecked={privacySettings.showOnlineStatus}
                          onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép tìm kiếm</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowSearch}
                          onChange={(e) => handlePrivacyChange('allowSearch', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép nhận tin nhắn</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowMessages}
                          onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép lời mời kết bạn</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowFriendRequests}
                          onChange={(e) => handlePrivacyChange('allowFriendRequests', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép xem profile</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowProfileViews}
                          onChange={(e) => handlePrivacyChange('allowProfileViews', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Content Visibility Section */}
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={3}>
                      <Icon as={FiEye} color="green.500" />
                      <Text fontWeight="semibold">Hiển thị Nội dung</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị bài đăng</FormLabel>
                        <Switch
                          isChecked={privacySettings.showPosts}
                          onChange={(e) => handlePrivacyChange('showPosts', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị nhiệm vụ</FormLabel>
                        <Switch
                          isChecked={privacySettings.showTodos}
                          onChange={(e) => handlePrivacyChange('showTodos', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị thành tích</FormLabel>
                        <Switch
                          isChecked={privacySettings.showAchievements}
                          onChange={(e) => handlePrivacyChange('showAchievements', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị hoạt động</FormLabel>
                        <Switch
                          isChecked={privacySettings.showActivity}
                          onChange={(e) => handlePrivacyChange('showActivity', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị danh sách bạn bè</FormLabel>
                        <Switch
                          isChecked={privacySettings.showFriends}
                          onChange={(e) => handlePrivacyChange('showFriends', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị nhóm</FormLabel>
                        <Switch
                          isChecked={privacySettings.showGroups}
                          onChange={(e) => handlePrivacyChange('showGroups', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Interaction Permissions Section */}
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={3}>
                      <Icon as={FiUsers} color="orange.500" />
                      <Text fontWeight="semibold">Quyền Tương tác</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép bình luận</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowComments}
                          onChange={(e) => handlePrivacyChange('allowComments', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép thích</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowLikes}
                          onChange={(e) => handlePrivacyChange('allowLikes', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép chia sẻ</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowShares}
                          onChange={(e) => handlePrivacyChange('allowShares', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép nhắc đến</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowMentions}
                          onChange={(e) => handlePrivacyChange('allowMentions', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép gắn thẻ</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowTags}
                          onChange={(e) => handlePrivacyChange('allowTags', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Search & Discovery Section */}
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={3}>
                      <Icon as={FiGlobe} color="teal.500" />
                      <Text fontWeight="semibold">Tìm kiếm & Khám phá</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Cho phép khám phá</FormLabel>
                        <Switch
                          isChecked={privacySettings.allowDiscovery}
                          onChange={(e) => handlePrivacyChange('allowDiscovery', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị trong bảng xếp hạng</FormLabel>
                        <Switch
                          isChecked={privacySettings.showInLeaderboards}
                          onChange={(e) => handlePrivacyChange('showInLeaderboards', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Hiển thị trong gợi ý</FormLabel>
                        <Switch
                          isChecked={privacySettings.showInSuggestions}
                          onChange={(e) => handlePrivacyChange('showInSuggestions', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Advanced Privacy Section */}
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack spacing={3}>
                      <Icon as={FiSettings} color="purple.500" />
                      <Text fontWeight="semibold">Quyền riêng tư Nâng cao</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Quyền riêng tư nâng cao</AlertTitle>
                        <AlertDescription>
                          Các cài đặt này giúp bảo vệ profile của bạn tốt hơn
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Ẩn khỏi bot</FormLabel>
                        <Switch
                          isChecked={privacySettings.hideFromBots}
                          onChange={(e) => handlePrivacyChange('hideFromBots', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Yêu cầu phê duyệt tag</FormLabel>
                        <Switch
                          isChecked={privacySettings.requireApprovalForTags}
                          onChange={(e) => handlePrivacyChange('requireApprovalForTags', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Làm mờ nội dung nhạy cảm</FormLabel>
                        <Switch
                          isChecked={privacySettings.blurSensitiveContent}
                          onChange={(e) => handlePrivacyChange('blurSensitiveContent', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Tự động ẩn khi không hoạt động</FormLabel>
                        <Switch
                          isChecked={privacySettings.autoHideInactive}
                          onChange={(e) => handlePrivacyChange('autoHideInactive', e.target.checked)}
                          colorScheme="blue"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            {/* Privacy Tips */}
            <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
              <HStack spacing={3} mb={3}>
                <Icon as={FiInfo} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">Mẹo bảo mật</Text>
              </HStack>
              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" color="blue.600">
                  • Sử dụng cài đặt "Chỉ bạn bè" để kiểm soát ai có thể xem profile
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Tắt hiển thị thông tin cá nhân nhạy cảm như email, số điện thoại
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Bật "Ẩn khỏi bot" để tránh bị thu thập dữ liệu tự động
                </Text>
                <Text fontSize="sm" color="blue.600">
                  • Kiểm tra cài đặt quyền riêng tư thường xuyên
                </Text>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={handleResetPrivacy}
              variant="outline"
            >
              Đặt lại
            </Button>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="purple"
              onClick={handleSavePrivacy}
              isLoading={loading}
              loadingText="Đang lưu..."
            >
              Lưu quyền riêng tư
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfilePrivacyModal; 