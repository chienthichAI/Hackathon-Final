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
  Input,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiSettings,
  FiBell,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiGlobe,
  FiUser,
  FiShield,
  FiEdit3,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiRefreshCw,
  FiSave,
  FiX,
} from 'react-icons/fi';
import { getUserSettings, updateUserSettings, exportProfileData, deleteAccount } from '../../api';

const ProfileSettingsModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Privacy Settings
    privacy: {
      profileVisibility: 'public',
      showStats: true,
      showAchievements: true,
      showActivity: true,
      allowMessages: true,
      allowFriendRequests: true,
      showEmail: false,
      showPhone: false,
      showLocation: false,
      showBirthDate: false,
      showOnlineStatus: true,
      allowSearch: true,
      allowProfileViews: true
    },
    // Notification Settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      achievementAlerts: true,
      friendRequests: true,
      weeklyReports: true,
      achievementNotifications: true,
      friendRequestNotifications: true,
      messageNotifications: true,
      todoReminders: true
    },
    // Theme Settings
    theme: {
      colorScheme: 'auto',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      showAvatars: true,
      showAnimations: true,
      autoPlayVideos: false,
      showTutorials: true,
      showTips: true
    },
    // Language Settings
    language: {
      interface: 'vi',
      content: 'vi'
    },
    // Data Settings
    data: {
      autoBackup: true,
      backupFrequency: 'weekly',
      dataRetention: '1year',
      exportFormat: 'json'
    }
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await getUserSettings();
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if API fails
    }
  };

  const initializeSettings = () => {
    // This function is no longer needed as we load settings from API
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      const response = await updateUserSettings(settings);

      if (response.success) {
        const updatedProfile = response.data;
        onUpdate(updatedProfile.profile);
        
        toast({
          title: '✅ Lưu cài đặt thành công',
          description: 'Cài đặt đã được cập nhật',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: '❌ Lỗi lưu cài đặt',
        description: 'Không thể lưu cài đặt. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
      initializeSettings();
      toast({
        title: '🔄 Đã đặt lại cài đặt',
        description: 'Cài đặt đã được đặt lại về mặc định',
        status: 'info',
        duration: 3000,
      });
    }
  };

  const handleExportData = async () => {
    try {
      const response = await exportProfileData(settings.data.exportFormat);

      if (response.success) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.${settings.data.exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: '✅ Xuất dữ liệu thành công',
          description: 'Dữ liệu profile đã được tải xuống',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: '❌ Lỗi xuất dữ liệu',
        description: 'Không thể xuất dữ liệu. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      try {
        const response = await deleteAccount();
        if (response.success) {
          onUpdate(null); // Assuming onUpdate will handle navigation or state update after deletion
          toast({
            title: '✅ Tài khoản đã được xóa',
            description: 'Tài khoản của bạn đã được xóa thành công.',
            status: 'success',
            duration: 5000,
          });
          onClose();
        } else {
          throw new Error('Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: '❌ Lỗi xóa tài khoản',
          description: 'Không thể xóa tài khoản. Vui lòng thử lại.',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiSettings} color="blue.500" />
            <Text>Cài đặt Profile</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab value="general">Chung</Tab>
              <Tab value="privacy">Riêng tư</Tab>
              <Tab value="notifications">Thông báo</Tab>
              <Tab value="display">Hiển thị</Tab>
              <Tab value="data">Dữ liệu</Tab>
            </TabList>

            <TabPanels>
              {/* General Settings Tab */}
              <TabPanel value="general">
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <Select
                        value={settings.language.interface}
                        onChange={(e) => handleSettingChange('language', 'interface', e.target.value)}
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Giao diện</FormLabel>
                      <Select
                        value={settings.theme.colorScheme}
                        onChange={(e) => handleSettingChange('theme', 'colorScheme', e.target.value)}
                      >
                        <option value="light">Sáng</option>
                        <option value="dark">Tối</option>
                        <option value="auto">Tự động</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Múi giờ</FormLabel>
                      <Select
                        value={settings.theme.timezone}
                        onChange={(e) => handleSettingChange('theme', 'timezone', e.target.value)}
                      >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Định dạng ngày</FormLabel>
                      <Select
                        value={settings.theme.dateFormat}
                        onChange={(e) => handleSettingChange('theme', 'dateFormat', e.target.value)}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Định dạng giờ</FormLabel>
                      <Select
                        value={settings.theme.timeFormat}
                        onChange={(e) => handleSettingChange('theme', 'timeFormat', e.target.value)}
                      >
                        <option value="12h">12 giờ</option>
                        <option value="24h">24 giờ</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Privacy Settings Tab */}
              <TabPanel value="privacy">
                <VStack spacing={6} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Quyền riêng tư</AlertTitle>
                      <AlertDescription>
                        Kiểm soát ai có thể xem thông tin profile của bạn
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <FormControl>
                    <FormLabel>Hiển thị profile</FormLabel>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    >
                      <option value="public">Công khai</option>
                      <option value="friends">Chỉ bạn bè</option>
                      <option value="private">Riêng tư</option>
                    </Select>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị email</FormLabel>
                      <Switch
                        isChecked={settings.privacy.showEmail}
                        onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị số điện thoại</FormLabel>
                      <Switch
                        isChecked={settings.privacy.showPhone}
                        onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị địa chỉ</FormLabel>
                      <Switch
                        isChecked={settings.privacy.showLocation}
                        onChange={(e) => handleSettingChange('privacy', 'showLocation', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị ngày sinh</FormLabel>
                      <Switch
                        isChecked={settings.privacy.showBirthDate}
                        onChange={(e) => handleSettingChange('privacy', 'showBirthDate', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị trạng thái online</FormLabel>
                      <Switch
                        isChecked={settings.privacy.showOnlineStatus}
                        onChange={(e) => handleSettingChange('privacy', 'showOnlineStatus', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Cho phép tìm kiếm</FormLabel>
                      <Switch
                        isChecked={settings.privacy.allowSearch}
                        onChange={(e) => handleSettingChange('privacy', 'allowSearch', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Cho phép nhận tin nhắn</FormLabel>
                      <Switch
                        isChecked={settings.privacy.allowMessages}
                        onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Cho phép lời mời kết bạn</FormLabel>
                      <Switch
                        isChecked={settings.privacy.allowFriendRequests}
                        onChange={(e) => handleSettingChange('privacy', 'allowFriendRequests', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Cho phép xem profile</FormLabel>
                      <Switch
                        isChecked={settings.privacy.allowProfileViews}
                        onChange={(e) => handleSettingChange('privacy', 'allowProfileViews', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Notification Settings Tab */}
              <TabPanel value="notifications">
                <VStack spacing={6} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Thông báo</AlertTitle>
                      <AlertDescription>
                        Tùy chỉnh cách bạn nhận thông báo
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo email</FormLabel>
                      <Switch
                        isChecked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo push</FormLabel>
                      <Switch
                        isChecked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo SMS</FormLabel>
                      <Switch
                        isChecked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo thành tích</FormLabel>
                      <Switch
                        isChecked={settings.notifications.achievementNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'achievementNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo lời mời kết bạn</FormLabel>
                      <Switch
                        isChecked={settings.notifications.friendRequestNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'friendRequestNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Thông báo tin nhắn</FormLabel>
                      <Switch
                        isChecked={settings.notifications.messageNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'messageNotifications', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Nhắc nhở nhiệm vụ</FormLabel>
                      <Switch
                        isChecked={settings.notifications.todoReminders}
                        onChange={(e) => handleSettingChange('notifications', 'todoReminders', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Báo cáo hàng tuần</FormLabel>
                      <Switch
                        isChecked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Display Settings Tab */}
              <TabPanel value="display">
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Chế độ compact</FormLabel>
                      <Switch
                        isChecked={settings.theme.compactMode}
                        onChange={(e) => handleSettingChange('theme', 'compactMode', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị avatar</FormLabel>
                      <Switch
                        isChecked={settings.theme.showAvatars}
                        onChange={(e) => handleSettingChange('theme', 'showAvatars', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị hoạt ảnh</FormLabel>
                      <Switch
                        isChecked={settings.theme.showAnimations}
                        onChange={(e) => handleSettingChange('theme', 'showAnimations', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Tự động phát video</FormLabel>
                      <Switch
                        isChecked={settings.theme.autoPlayVideos}
                        onChange={(e) => handleSettingChange('theme', 'autoPlayVideos', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị hướng dẫn</FormLabel>
                      <Switch
                        isChecked={settings.theme.showTutorials}
                        onChange={(e) => handleSettingChange('theme', 'showTutorials', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Hiển thị mẹo</FormLabel>
                      <Switch
                        isChecked={settings.theme.showTips}
                        onChange={(e) => handleSettingChange('theme', 'showTips', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Data Settings Tab */}
              <TabPanel value="data">
                <VStack spacing={6} align="stretch">
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Quản lý dữ liệu</AlertTitle>
                      <AlertDescription>
                        Quản lý dữ liệu profile và tài khoản của bạn
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Tự động sao lưu</FormLabel>
                      <Switch
                        isChecked={settings.data.autoBackup}
                        onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tần suất sao lưu</FormLabel>
                      <Select
                        value={settings.data.backupFrequency}
                        onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                      >
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                        <option value="monthly">Hàng tháng</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Lưu trữ dữ liệu</FormLabel>
                      <Select
                        value={settings.data.dataRetention}
                        onChange={(e) => handleSettingChange('data', 'dataRetention', e.target.value)}
                      >
                        <option value="6months">6 tháng</option>
                        <option value="1year">1 năm</option>
                        <option value="2years">2 năm</option>
                        <option value="forever">Vĩnh viễn</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Định dạng xuất</FormLabel>
                      <Select
                        value={settings.data.exportFormat}
                        onChange={(e) => handleSettingChange('data', 'exportFormat', e.target.value)}
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Hành động dữ liệu</Heading>
                    
                    <HStack spacing={4}>
                      <Button
                        leftIcon={<FiDownload />}
                        onClick={handleExportData}
                        colorScheme="blue"
                        variant="outline"
                      >
                        Xuất dữ liệu
                      </Button>
                      
                      <Button
                        leftIcon={<FiTrash2 />}
                        onClick={handleDeleteAccount}
                        colorScheme="red"
                        variant="outline"
                      >
                        Xóa tài khoản
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              onClick={handleResetSettings}
              variant="outline"
            >
              Đặt lại
            </Button>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              onClick={handleSaveSettings}
              isLoading={loading}
              loadingText="Đang lưu..."
            >
              Lưu cài đặt
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileSettingsModal; 