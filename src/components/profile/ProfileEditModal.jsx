import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Avatar,
  AvatarBadge,
  IconButton,
  useToast,
  Divider,
  Text,
  Badge,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Box,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Icon,
  Tooltip,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiCalendar,
  FiCamera,
  FiPlus,
  FiX,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiBookOpen,
  FiTarget,
  FiStar,
  FiHeart,
  FiMusic,
  FiFilm,
  FiZap,
  FiCode,
  FiCamera as FiCameraIcon,
  FiTrash2,
  FiDownload,
  FiUpload,
} from 'react-icons/fi';

const ProfileEditModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    displayName: '',
    firstName: '',
    lastName: '',
    bio: '',
    statusMessage: '',
    birthDate: '',
    gender: '',
    
    // Contact Info
    email: '',
    phone: '',
    location: '',
    timezone: '',
    website: '',
    
    // Social Links
    github: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
    
    // Skills & Interests
    skills: [],
    interests: [],
    languages: [],
    
    // Education & Work
    education: [],
    workExperience: [],
    
    // Preferences
    isPublic: true,
    showEmail: false,
    showPhone: false,
    showLocation: false,
    showBirthDate: false,
    allowMessages: true,
    allowFriendRequests: true,
    
    // Custom Fields
    customFields: {},
  });

  // UI state
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (profile && isOpen) {
      initializeFormData();
    }
  }, [profile, isOpen]);

  const initializeFormData = () => {
    if (!profile) return;
    
    setFormData({
      displayName: profile.displayName || profile.user?.name || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      bio: profile.bio || '',
      statusMessage: profile.statusMessage || '',
      birthDate: profile.birthDate || '',
      gender: profile.gender || '',
      email: profile.user?.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      timezone: profile.timezone || '',
      website: profile.website || '',
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      twitter: profile.twitter || '',
      instagram: profile.instagram || '',
      facebook: profile.facebook || '',
      youtube: profile.youtube || '',
      skills: profile.skills || [],
      interests: profile.interests || [],
      languages: profile.languages || [],
      education: profile.education || [],
      workExperience: profile.workExperience || [],
      isPublic: profile.isPublic !== false,
      showEmail: profile.showEmail || false,
      showPhone: profile.showPhone || false,
      showLocation: profile.showLocation || false,
      showBirthDate: profile.showBirthDate || false,
      allowMessages: profile.allowMessages !== false,
      allowFriendRequests: profile.allowFriendRequests !== false,
      customFields: profile.customFields || {},
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayFieldChange = (field, operation, value, index = null) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      let newArray;
      
      switch (operation) {
        case 'add':
          newArray = [...currentArray, value];
          break;
        case 'remove':
          newArray = currentArray.filter((_, i) => i !== index);
          break;
        case 'update':
          newArray = currentArray.map((item, i) => i === index ? value : item);
          break;
        default:
          return prev;
      }
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onUpdate(updatedProfile.profile);
        onClose();
        
        toast({
          title: '✅ Cập nhật thành công',
          description: 'Profile đã được cập nhật',
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: '❌ Lỗi cập nhật',
        description: 'Không thể cập nhật profile. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        // Update avatar in form data
        handleInputChange('avatar', result.avatarUrl);
        
        toast({
          title: '✅ Tải avatar thành công',
          description: 'Avatar đã được cập nhật',
          status: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: '❌ Lỗi tải avatar',
        description: 'Không thể tải avatar. Vui lòng thử lại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: '❌ Mật khẩu không khớp',
        description: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast({
          title: '✅ Đổi mật khẩu thành công',
          description: 'Mật khẩu đã được cập nhật',
          status: 'success',
          duration: 3000,
        });
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: '❌ Lỗi đổi mật khẩu',
        description: 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor} border="1px" borderColor={borderColor}>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FiEdit3} color="blue.500" />
            <Text>Chỉnh sửa Profile</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab value="basic">Thông tin cơ bản</Tab>
              <Tab value="contact">Liên hệ</Tab>
              <Tab value="social">Mạng xã hội</Tab>
              <Tab value="skills">Kỹ năng & Sở thích</Tab>
              <Tab value="education">Học vấn & Công việc</Tab>
              <Tab value="preferences">Tùy chọn</Tab>
              <Tab value="security">Bảo mật</Tab>
            </TabList>

            <TabPanels>
              {/* Basic Info Tab */}
              <TabPanel value="basic">
                <VStack spacing={6} align="stretch">
                  {/* Avatar Section */}
                  <Box textAlign="center">
                    <Box position="relative" display="inline-block">
                      <Avatar
                        size="2xl"
                        name={formData.displayName}
                        src={profile?.avatar}
                        border="4px solid white"
                        shadow="lg"
                      />
                      <IconButton
                        icon={<FiCamera />}
                        position="absolute"
                        bottom={0}
                        right={0}
                        colorScheme="blue"
                        borderRadius="full"
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload').click()}
                        isLoading={uploading}
                      />
                    </Box>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleAvatarUpload(e.target.files[0])}
                    />
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Nhấp để thay đổi avatar
                    </Text>
                  </Box>

                  {/* Basic Fields */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Tên hiển thị</FormLabel>
                      <Input
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Tên hiển thị của bạn"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Họ</FormLabel>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Họ"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tên</FormLabel>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Tên"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Giới tính</FormLabel>
                      <Select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        placeholder="Chọn giới tính"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                        <option value="prefer-not-to-say">Không muốn nói</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ngày sinh</FormLabel>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Múi giờ</FormLabel>
                      <Select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        placeholder="Chọn múi giờ"
                      >
                        <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">America/New_York (GMT-5)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Giới thiệu</FormLabel>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Giới thiệu về bản thân..."
                      rows={4}
                    />
                    <FormHelperText>
                      Hãy chia sẻ một chút về bản thân, sở thích, hoặc mục tiêu của bạn
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Trạng thái</FormLabel>
                    <Input
                      value={formData.statusMessage}
                      onChange={(e) => handleInputChange('statusMessage', e.target.value)}
                      placeholder="Bạn đang làm gì?"
                    />
                    <FormHelperText>
                      Ví dụ: "Đang học React", "Đang làm việc", "Đang nghỉ ngơi"
                    </FormHelperText>
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Contact Info Tab */}
              <TabPanel value="contact">
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                        isReadOnly
                      />
                      <FormHelperText>Email không thể thay đổi</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Số điện thoại</FormLabel>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+84 123 456 789"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Địa chỉ</FormLabel>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Thành phố, Quốc gia"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Website</FormLabel>
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Social Links Tab */}
              <TabPanel value="social">
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiGithub} />
                          <Text>GitHub</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="username"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiLinkedin} />
                          <Text>LinkedIn</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="profile-url"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiTwitter} />
                          <Text>Twitter</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="@username"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>
                        <HStack spacing={2}>
                          <Icon as={FiInstagram} />
                          <Text>Instagram</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        value={formData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        placeholder="username"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </TabPanel>

              {/* Skills & Interests Tab */}
              <TabPanel value="skills">
                <VStack spacing={6} align="stretch">
                  {/* Skills */}
                  <FormControl>
                    <FormLabel>Kỹ năng</FormLabel>
                    <HStack spacing={2}>
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Thêm kỹ năng mới"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSkill.trim()) {
                            handleArrayFieldChange('skills', 'add', newSkill.trim());
                            setNewSkill('');
                          }
                        }}
                      />
                      <Button
                        leftIcon={<FiPlus />}
                        onClick={() => {
                          if (newSkill.trim()) {
                            handleArrayFieldChange('skills', 'add', newSkill.trim());
                            setNewSkill('');
                          }
                        }}
                        colorScheme="blue"
                        size="md"
                      >
                        Thêm
                      </Button>
                    </HStack>
                    <Wrap mt={3}>
                      {formData.skills.map((skill, index) => (
                        <WrapItem key={index}>
                          <Tag size="lg" colorScheme="blue" borderRadius="full">
                            <TagLabel>{skill}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleArrayFieldChange('skills', 'remove', null, index)}
                            />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </FormControl>

                  {/* Interests */}
                  <FormControl>
                    <FormLabel>Sở thích</FormLabel>
                    <HStack spacing={2}>
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Thêm sở thích mới"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newInterest.trim()) {
                            handleArrayFieldChange('interests', 'add', newInterest.trim());
                            setNewInterest('');
                          }
                        }}
                      />
                      <Button
                        leftIcon={<FiPlus />}
                        onClick={() => {
                          if (newInterest.trim()) {
                            handleArrayFieldChange('interests', 'add', newInterest.trim());
                            setNewInterest('');
                          }
                        }}
                        colorScheme="green"
                        size="md"
                      >
                        Thêm
                      </Button>
                    </HStack>
                    <Wrap mt={3}>
                      {formData.interests.map((interest, index) => (
                        <WrapItem key={index}>
                          <Tag size="lg" colorScheme="green" borderRadius="full">
                            <TagLabel>{interest}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleArrayFieldChange('interests', 'remove', null, index)}
                            />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </FormControl>

                  {/* Languages */}
                  <FormControl>
                    <FormLabel>Ngôn ngữ</FormLabel>
                    <HStack spacing={2}>
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Thêm ngôn ngữ mới"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newLanguage.trim()) {
                            handleArrayFieldChange('languages', 'add', newLanguage.trim());
                            setNewLanguage('');
                          }
                        }}
                      />
                      <Button
                        leftIcon={<FiPlus />}
                        onClick={() => {
                          if (newLanguage.trim()) {
                            handleArrayFieldChange('languages', 'add', newLanguage.trim());
                            setNewLanguage('');
                          }
                        }}
                        colorScheme="purple"
                        size="md"
                      >
                        Thêm
                      </Button>
                    </HStack>
                    <Wrap mt={3}>
                      {formData.languages.map((language, index) => (
                        <WrapItem key={index}>
                          <Tag size="lg" colorScheme="purple" borderRadius="full">
                            <TagLabel>{language}</TagLabel>
                            <TagCloseButton
                              onClick={() => handleArrayFieldChange('languages', 'remove', null, index)}
                            />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Education & Work Tab */}
              <TabPanel value="education">
                <VStack spacing={6} align="stretch">
                  <Text fontSize="lg" fontWeight="semibold">Học vấn</Text>
                  {/* Education form would go here */}
                  
                  <Text fontSize="lg" fontWeight="semibold">Kinh nghiệm làm việc</Text>
                  {/* Work experience form would go here */}
                  
                  <Text fontSize="sm" color="gray.600">
                    Tính năng này sẽ được phát triển trong phiên bản tiếp theo
                  </Text>
                </VStack>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value="preferences">
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Profile công khai</FormLabel>
                    <Switch
                      isChecked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Hiển thị email</FormLabel>
                    <Switch
                      isChecked={formData.showEmail}
                      onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Hiển thị số điện thoại</FormLabel>
                    <Switch
                      isChecked={formData.showPhone}
                      onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Hiển thị địa chỉ</FormLabel>
                    <Switch
                      isChecked={formData.showLocation}
                      onChange={(e) => handleInputChange('showLocation', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Cho phép nhận tin nhắn</FormLabel>
                    <Switch
                      isChecked={formData.allowMessages}
                      onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Cho phép lời mời kết bạn</FormLabel>
                    <Switch
                      isChecked={formData.allowFriendRequests}
                      onChange={(e) => handleInputChange('allowFriendRequests', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value="security">
                <VStack spacing={6} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Bảo mật tài khoản</AlertTitle>
                      <AlertDescription>
                        Thay đổi mật khẩu để bảo vệ tài khoản của bạn
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <FormControl>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <InputRightElement>
                        <IconButton
                          icon={showPassword ? <FiEyeOff /> : <FiEye />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </FormControl>

                  <Button
                    colorScheme="red"
                    onClick={handlePasswordChange}
                    isLoading={loading}
                    loadingText="Đang thay đổi..."
                  >
                    Thay đổi mật khẩu
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Đang lưu..."
            >
              Lưu thay đổi
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileEditModal; 