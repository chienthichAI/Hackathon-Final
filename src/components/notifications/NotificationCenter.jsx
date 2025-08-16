import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  Button,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Divider,
  Avatar,
  Flex,
  Tooltip,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiCheck,
  FiX,
  FiSettings,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAward,
  FiUsers,
  FiMessageCircle,
  FiCalendar,
  FiTrendingUp,
  FiBookOpen,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  acceptGroupInvitation
} from '../../api';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

export default function NotificationCenter() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    sound: true,
    desktop: true,
    email: true,
    achievements: true,
    studyReminders: true,
    friendActivity: true,
    systemUpdates: true
  });
  const [showPreferences, setShowPreferences] = useState(false);

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsRes, unreadCountRes] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      
      // Handle the response structure from the backend
      if (notificationsRes.data && notificationsRes.data.success) {
        setNotifications(notificationsRes.data.notifications || []);
      } else {
        setNotifications([]);
      }
      
      if (unreadCountRes.data && unreadCountRes.data.success) {
        setUnreadCount(unreadCountRes.data.count || 0);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set default values on error
      setNotifications([]);
      setUnreadCount(0);
      toast({
        title: 'Error',
        description: 'Could not fetch notifications',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await getNotificationPreferences();
      if (response.data && response.data.success) {
        setPreferences(response.data.preferences || {
          sound: true,
          desktop: true,
          email: true,
          achievements: true,
          studyReminders: true,
          friendActivity: true,
          systemUpdates: true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Keep default preferences on error
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    if (preferences.sound) {
      // Play notification sound
      new Audio('/sounds/notification.mp3').play();
    }
    
    if (preferences.desktop && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification.png'
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      // Check if this is a group invitation
      if (notification && notification.type === 'group_invitation') {
        // Extract groupId and invitationId from notification data
        const groupId = notification.data?.groupId;
        const invitationId = notification.data?.invitationId;
        
        if (groupId && invitationId) {
          // Accept the group invitation
          await acceptGroupInvitation(groupId, invitationId);
          
          // Mark notification as read
          await markAsRead(notificationId);
          
          // Update local state
          setNotifications(prev => 
            prev.map(n =>
              n.id === notificationId ? { ...n, read: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          
          // Show success message
          toast({
            title: 'Tham gia nhóm thành công!',
            description: 'Bạn đã được thêm vào nhóm. Chuyển hướng đến group todo...',
            status: 'success',
            duration: 3000
          });
          
          // Navigate to todo page with group-todos tab
          setTimeout(() => {
            navigate(`/todo?tab=group-todos&groupId=${groupId}`);
          }, 1000);
          
          return;
        }
      }
      
      // For other notification types, just mark as read
      await markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error handling notification:', error);
      
      // Show more specific error messages
      let errorMessage = 'Không thể xử lý thông báo. Vui lòng thử lại.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        status: 'error',
        duration: 5000
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Could not mark all as read',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        title: 'Success',
        description: 'Notification deleted',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Could not delete notification',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handlePreferenceChange = async (key, value) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await updateNotificationPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast({
        title: 'Success',
        description: 'Preferences updated',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Could not update preferences',
        status: 'error',
        duration: 3000
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement': return <FiAward />;
      case 'friend': return <FiUsers />;
      case 'message': return <FiMessageCircle />;
      case 'reminder': return <FiCalendar />;
      case 'progress': return <FiTrendingUp />;
      case 'study': return <FiBookOpen />;
      case 'goal': return <FiTarget />;
      case 'system': return <FiZap />;
      default: return <FiBell />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'achievement': return 'purple';
      case 'friend': return 'blue';
      case 'message': return 'green';
      case 'reminder': return 'orange';
      case 'progress': return 'cyan';
      case 'study': return 'teal';
      case 'goal': return 'yellow';
      case 'system': return 'gray';
      default: return 'blue';
    }
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            icon={<FiBell />}
            variant="ghost"
            aria-label="Notifications"
            position="relative"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              position="absolute"
              top="-1"
              right="-1"
              borderRadius="full"
              minW="5"
              textAlign="center"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>

      <PopoverContent
        width="420px"
        maxH="600px"
        overflowY="auto"
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="2xl"
        borderRadius="xl"
        borderWidth="1px"
      >
        <PopoverHeader 
          borderBottomWidth="1px" 
          p={5}
          bgGradient="linear(to-r, blue.50, purple.50)"
          borderBottomColor="blue.200"
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="lg"
                bg="blue.500"
                color="white"
              >
                <FiBell size={18} />
              </Box>
              <VStack spacing={0} align="start">
                <Text 
                  fontWeight="bold" 
                  fontSize="lg"
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                >
                  Notifications
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <IconButton
                icon={<FiSettings />}
                size="sm"
                variant="ghost"
                onClick={() => setShowPreferences(!showPreferences)}
                aria-label="Notification settings"
                color="blue.600"
                _hover={{ bg: "blue.50" }}
              />
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  leftIcon={<FiCheck />}
                  onClick={handleMarkAllAsRead}
                  colorScheme="blue"
                  variant="solid"
                  borderRadius="lg"
                  fontSize="sm"
                  px={4}
                >
                  Mark all read
                </Button>
              )}
            </HStack>
          </HStack>
        </PopoverHeader>

        <PopoverBody p={0}>
          {showPreferences ? (
            <VStack spacing={4} p={6} align="stretch">
              <Text fontWeight="bold" mb={3} fontSize="md" color="gray.700">
                Notification Preferences
              </Text>
              {Object.entries(preferences).map(([key, value]) => (
                <FormControl
                  key={key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={3}
                  borderRadius="lg"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  transition="all 0.2s"
                >
                  <FormLabel mb={0} fontSize="sm" fontWeight="medium" color="gray.700">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </FormLabel>
                  <Switch
                    isChecked={value}
                    onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                    colorScheme="blue"
                    size="md"
                  />
                </FormControl>
              ))}
            </VStack>
          ) : (
            <>
          {loading ? (
                <Flex justify="center" align="center" p={8}>
                  <VStack spacing={3}>
                    <Spinner size="lg" color="blue.500" thickness="3px" />
                    <Text color="gray.500" fontSize="sm">Loading notifications...</Text>
                  </VStack>
                </Flex>
              ) : (!Array.isArray(notifications) || notifications.length === 0) ? (
                <Box p={8} textAlign="center" color="gray.500">
                  <VStack spacing={3}>
                    <Box
                      p={4}
                      borderRadius="full"
                      bg="gray.100"
                      color="gray.400"
                    >
                      <FiBell size={24} />
                    </Box>
                    <Text fontWeight="medium">No notifications</Text>
                    <Text fontSize="sm">You're all caught up!</Text>
                  </VStack>
            </Box>
              ) : (
                <VStack spacing={0} align="stretch">
                  {Array.isArray(notifications) && notifications.map((notification, index) => (
                    <MotionBox
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      p={4}
                      borderBottomWidth={index === notifications.length - 1 ? "0px" : "1px"}
                      borderColor={borderColor}
                      bg={notification.read ? 'transparent' : 'blue.50'}
                      _hover={{ 
                        bg: notification.read ? 'gray.50' : 'blue.100',
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg'
                      }}
                      transition="all 0.3s ease"
                      position="relative"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        bg: notification.read ? 'transparent' : 'blue.500',
                        borderRadius: '0 2px 2px 0'
                      }}
                    >
                      <HStack spacing={4} align="start">
                        <Box
                          p={3}
                          borderRadius="xl"
                          bg={`${getNotificationColor(notification.type)}.100`}
                          color={`${getNotificationColor(notification.type)}.600`}
                          boxShadow="sm"
                          flexShrink={0}
                        >
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <VStack flex={1} spacing={2} align="start">
                          <Text 
                            fontWeight="semibold" 
                            fontSize="md"
                            color={notification.read ? 'gray.600' : 'gray.800'}
                            lineHeight="1.2"
                          >
                            {notification.title}
                          </Text>
                          <Text 
                            fontSize="sm" 
                            color="gray.600"
                            lineHeight="1.4"
                          >
                            {notification.message}
                          </Text>
                          <Text 
                            fontSize="xs" 
                            color="gray.500"
                            fontWeight="medium"
                          >
                            {new Date(notification.createdAt).toLocaleString()}
                          </Text>
                        </VStack>
                        <VStack spacing={2} flexShrink={0}>
                          {!notification.read && (
                            <IconButton
                              icon={<FiCheck />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              aria-label="Mark as read"
                              color="green.600"
                              _hover={{ bg: "green.50" }}
                              borderRadius="lg"
                            />
                          )}
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(notification.id)}
                            aria-label="Delete notification"
                            color="red.500"
                            _hover={{ bg: "red.50" }}
                            borderRadius="lg"
                          />
                        </VStack>
                      </HStack>
                    </MotionBox>
                  ))}
            </VStack>
          )}
            </>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
