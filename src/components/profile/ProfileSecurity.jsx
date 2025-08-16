import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Button,
  IconButton,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  useToast,
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import {
  FiShield,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff,
  FiKey,
  FiUserCheck,
  FiUserX,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiSettings,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit3,
  FiPlus,
  FiMinus,
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
  FiTarget as FiTargetIcon,
  FiBookOpen as FiBookOpenIcon,
  FiCode as FiCodeIcon,
  FiEdit3 as FiEdit3Icon,
  FiMusic as FiMusicIcon,
  FiZap as FiZapIcon,
  FiCamera as FiCameraIcon,
  FiVideo as FiVideoIcon,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSecurity = ({ userId: propUserId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorData, setTwoFactorData] = useState({
    enabled: false,
    method: 'app',
    backupCodes: [],
  });
  const [sessions, setSessions] = useState([]);
  const [securityScore, setSecurityScore] = useState(75);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: is2FAOpen, onOpen: on2FAOpen, onClose: on2FAClose } = useDisclosure();
  const { isOpen: isSessionsOpen, onOpen: onSessionsOpen, onClose: onSessionsClose } = useDisclosure();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Sử dụng userId prop nếu có, nếu không thì dùng từ context
  const currentUserId = propUserId || user?.userId || user?.id;
  
  // Debug: Log chi tiết về user ID
  console.log('=== DEBUG ProfileSecurity User ID ===');
  console.log('Prop userId:', propUserId);
  console.log('User object:', user);
  console.log('User ID (user.id):', user?.id);
  console.log('User ID (user.userId):', user?.userId);
  console.log('Final currentUserId:', currentUserId);

  useEffect(() => {
    console.log('=== ProfileSecurity Component Mounted ===');
    console.log('Prop userId:', propUserId);
    console.log('Context user:', user);
    console.log('Current user ID:', currentUserId);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchSecurityData();
    }
  }, [currentUserId]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Debug: Log chi tiết
      console.log('=== DEBUG ProfileSecurity ===');
      console.log('User from context:', user);
      console.log('Current user ID:', currentUserId);
      console.log('Token:', localStorage.getItem('token'));
      
      if (!currentUserId) {
        console.error('❌ Không có user ID');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/profile/${currentUserId}/security`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityData(data.security);
        setTwoFactorData(data.twoFactor || { enabled: false, method: 'app', backupCodes: [] });
        setSessions(data.sessions || []);
        calculateSecurityScore(data.security);
      } else {
        console.error('Security API response:', response.status, response.statusText);
        console.error('Response body:', await response.text());
        throw new Error('Failed to fetch security data');
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (security) => {
    if (!security) return 75;
    
    let score = 100;
    
    // Password strength
    if (security.passwordStrength === 'weak') score -= 20;
    else if (security.passwordStrength === 'medium') score -= 10;
    
    // 2FA
    if (!security.twoFactorEnabled) score -= 25;
    
    // Recent password change
    if (security.daysSincePasswordChange > 90) score -= 15;
    
    // Suspicious activity
    if (security.suspiciousActivity) score -= 10;
    
    // Login attempts
    if (security.failedLoginAttempts > 5) score -= 10;
    
    score = Math.max(0, Math.min(100, score));
    setSecurityScore(score);
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

    if (passwordData.newPassword.length < 8) {
      toast({
        title: '❌ Mật khẩu quá ngắn',
        description: 'Mật khẩu phải có ít nhất 8 ký tự',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setChangingPassword(true);
      
      const response = await fetch('/api/profile/security/password', {
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
        onPasswordClose();
        fetchSecurityData();
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi đổi mật khẩu',
        description: 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handle2FAToggle = async () => {
    try {
      setEnabling2FA(true);
      
      if (twoFactorData.enabled) {
        // Disable 2FA
        const response = await fetch('/api/profile/security/2fa/disable', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setTwoFactorData(prev => ({ ...prev, enabled: false }));
          toast({
            title: '❌ Đã tắt 2FA',
            description: 'Xác thực 2 yếu tố đã bị tắt',
            status: 'info',
            duration: 3000,
          });
        }
      } else {
        // Enable 2FA
        on2FAOpen();
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi cài đặt 2FA',
        description: 'Không thể thay đổi trạng thái 2FA',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/profile/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: '✅ Đã kết thúc phiên',
          description: 'Phiên đăng nhập đã bị kết thúc',
          status: 'success',
          duration: 3000,
        });
        fetchSecurityData();
      }
    } catch (error) {
      toast({
        title: '❌ Lỗi kết thúc phiên',
        description: 'Không thể kết thúc phiên',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRefresh = () => {
    fetchSecurityData();
  };

  const getSecurityLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'green' };
    if (score >= 70) return { level: 'Good', color: 'blue' };
    if (score >= 50) return { level: 'Fair', color: 'yellow' };
    return { level: 'Poor', color: 'red' };
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Đang tải thông tin bảo mật...</Text>
        </VStack>
      </Center>
    );
  }

  const securityLevel = getSecurityLevel(securityScore);

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="blue.900" fontWeight="bold">
            <Icon as={FiShield} color="blue.900" mr={2} />
            Bảo mật Profile
          </Heading>
          <Text color="gray.600" fontWeight="medium">
            Quản lý bảo mật và bảo vệ tài khoản của bạn
          </Text>
        </VStack>
        
        <IconButton
          icon={<FiRefreshCw />}
          onClick={handleRefresh}
          variant="outline"
          colorScheme="blue.900"
        />
      </HStack>

      {/* Security Score */}
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Điểm bảo mật</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="lg" fontWeight="semibold">Mức độ bảo mật</Text>
              <Badge colorScheme={securityLevel.color} size="lg">
                {securityLevel.level}
              </Badge>
            </HStack>
            
            <Progress 
              value={securityScore} 
              colorScheme={securityLevel.color} 
              size="lg"
              borderRadius="full"
            />
            
            <Text fontSize="sm" color="gray.600">
              {securityScore}/100 điểm - {securityLevel.level}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Security Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard
          label="Mật khẩu"
          value={securityData?.passwordStrength || 'Unknown'}
          icon={FiKey}
          color={securityData?.passwordStrength === 'strong' ? 'green' : 'orange'}
        />
        
        <StatCard
          label="2FA"
          value={twoFactorData.enabled ? 'Bật' : 'Tắt'}
          icon={FiShield}
          color={twoFactorData.enabled ? 'green' : 'red'}
        />
        
        <StatCard
          label="Phiên hoạt động"
          value={sessions.length}
          icon={FiUserCheck}
          color="blue.900"
        />
      </SimpleGrid>

      {/* Security Settings */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <Tabs variant="enclosed">
          <TabList>
            <Tab value="password">Mật khẩu</Tab>
            <Tab value="2fa">Xác thực 2 yếu tố</Tab>
            <Tab value="sessions">Phiên đăng nhập</Tab>
            <Tab value="activity">Hoạt động bảo mật</Tab>
          </TabList>

          <TabPanels>
            {/* Password Tab */}
            <TabPanel value="password">
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Bảo mật mật khẩu</AlertTitle>
                    <AlertDescription>
                      Sử dụng mật khẩu mạnh và thay đổi thường xuyên
                    </AlertDescription>
                  </Box>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">Trạng thái mật khẩu</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Độ mạnh:</Text>
                          <Badge colorScheme={securityData?.passwordStrength === 'strong' ? 'green' : 'orange'}>
                            {securityData?.passwordStrength || 'Unknown'}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Lần thay đổi cuối:</Text>
                          <Text fontSize="sm">
                            {securityData?.daysSincePasswordChange || 0} ngày trước
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Lần đăng nhập thất bại:</Text>
                          <Text fontSize="sm" color="red.500">
                            {securityData?.failedLoginAttempts || 0}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">Hành động</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <Button
                          colorScheme="blue"
                          onClick={onPasswordOpen}
                          leftIcon={<FiEdit3 />}
                          w="full"
                        >
                          Thay đổi mật khẩu
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {/* Handle password reset */}}
                          leftIcon={<FiRefreshCw />}
                          w="full"
                        >
                          Đặt lại mật khẩu
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* 2FA Tab */}
            <TabPanel value="2fa">
              <VStack spacing={6} align="stretch">
                <Alert status={twoFactorData.enabled ? "success" : "warning"}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>
                      {twoFactorData.enabled ? '2FA đã được bật' : '2FA chưa được bật'}
                    </AlertTitle>
                    <AlertDescription>
                      {twoFactorData.enabled 
                        ? 'Tài khoản của bạn được bảo vệ bởi xác thực 2 yếu tố'
                        : 'Bật 2FA để tăng cường bảo mật cho tài khoản'
                      }
                    </AlertDescription>
                  </Box>
                </Alert>

                <Card bg={cardBg}>
                  <CardBody>
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Xác thực 2 yếu tố</Text>
                        <Text fontSize="sm" color="gray.600">
                          {twoFactorData.enabled 
                            ? 'Đang sử dụng ứng dụng xác thực'
                            : 'Chưa được kích hoạt'
                          }
                        </Text>
                      </VStack>
                      
                      <Switch
                        isChecked={twoFactorData.enabled}
                        onChange={handle2FAToggle}
                        colorScheme="green"
                        size="lg"
                        isDisabled={enabling2FA}
                      />
                    </HStack>
                  </CardBody>
                </Card>

                {twoFactorData.enabled && (
                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">Cài đặt 2FA</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Phương thức:</Text>
                          <Badge colorScheme="blue">{twoFactorData.method}</Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Mã dự phòng:</Text>
                          <Badge colorScheme="green">
                            {twoFactorData.backupCodes?.length || 0} mã
                          </Badge>
                        </HStack>
                        
                        <Button
                          variant="outline"
                          onClick={() => {/* Handle 2FA settings */}}
                          leftIcon={<FiSettings />}
                          size="sm"
                        >
                          Cài đặt 2FA
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Sessions Tab */}
            <TabPanel value="sessions">
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Phiên đăng nhập hiện tại
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => {/* Terminate all sessions */}}
                  >
                    Kết thúc tất cả
                  </Button>
                </HStack>

                <VStack spacing={3} align="stretch">
                  {sessions.map((session, index) => (
                    <Card key={index} bg={cardBg}>
                      <CardBody>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="medium">
                                {session.device} - {session.browser}
                              </Text>
                              {session.isCurrent && (
                                <Badge colorScheme="green" size="sm">Hiện tại</Badge>
                              )}
                            </HStack>
                            
                            <Text fontSize="sm" color="gray.600">
                              {session.location} • {session.ipAddress}
                            </Text>
                            
                            <Text fontSize="sm" color="gray.500">
                              Đăng nhập: {new Date(session.lastActive).toLocaleString('vi-VN')}
                            </Text>
                          </VStack>
                          
                          {!session.isCurrent && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleTerminateSession(session.id)}
                            >
                              Kết thúc
                            </Button>
                          )}
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>
            </TabPanel>

            {/* Security Activity Tab */}
            <TabPanel value="activity">
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Hoạt động bảo mật</AlertTitle>
                    <AlertDescription>
                      Theo dõi các hoạt động liên quan đến bảo mật tài khoản
                    </AlertDescription>
                  </Box>
                </Alert>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">Đăng nhập gần đây</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Đăng nhập thành công:</Text>
                          <Badge colorScheme="green">
                            {securityData?.successfulLogins || 0}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Đăng nhập thất bại:</Text>
                          <Badge colorScheme="red">
                            {securityData?.failedLogins || 0}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Lần cuối đăng nhập:</Text>
                          <Text fontSize="sm">
                            {securityData?.lastLogin ? new Date(securityData.lastLogin).toLocaleString('vi-VN') : 'N/A'}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="sm">Cảnh báo bảo mật</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm">Hoạt động đáng ngờ:</Text>
                          <Badge colorScheme={securityData?.suspiciousActivity ? 'red' : 'green'}>
                            {securityData?.suspiciousActivity ? 'Có' : 'Không'}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Thay đổi mật khẩu:</Text>
                          <Badge colorScheme="blue">
                            {securityData?.passwordChanges || 0}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm">Thay đổi email:</Text>
                          <Badge colorScheme="purple">
                            {securityData?.emailChanges || 0}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Thay đổi mật khẩu</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
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
                <InputGroup>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onPasswordClose}>
                Hủy
              </Button>
              <Button
                colorScheme="blue"
                onClick={handlePasswordChange}
                isLoading={changingPassword}
                loadingText="Đang thay đổi..."
              >
                Thay đổi mật khẩu
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onClose={on2FAClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Thiết lập 2FA</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Text>
                  Quét mã QR bằng ứng dụng xác thực như Google Authenticator hoặc Authy
                </Text>
              </Alert>

              <Box textAlign="center" p={6} bg="gray.100" borderRadius="lg">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Mã QR sẽ được hiển thị ở đây
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Trong môi trường thực tế, mã QR sẽ được hiển thị
                </Text>
              </Box>

              <FormControl>
                <FormLabel>Mã xác thực</FormLabel>
                <Input
                  placeholder="Nhập mã 6 số từ ứng dụng"
                  maxLength={6}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={on2FAClose}>
                Hủy
              </Button>
              <Button colorScheme="green">
                Kích hoạt 2FA
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const MotionCard = motion.create(Card);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody textAlign="center">
          <VStack spacing={3}>
            <Icon color={`${color}.500`} w={8} h={8} />
            <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
              {value}
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {label}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </MotionCard>
  );
};

export default ProfileSecurity; 