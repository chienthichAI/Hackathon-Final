import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Heading, Stack, Text, useToast } from '@chakra-ui/react';
import { useLocation, useNavigate  } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      setLoading(true);
      const res = await apiRegister(name, email, password);
      
      if (res.data.success) {
        toast({
          title: 'Success',
          description: 'Registration successful! Please log in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      maxW="md" 
      mx="auto" 
      mt={20} 
      p={3} 
      borderWidth={1} 
      borderRadius="2xl" 
      boxShadow="xl"
      bg="gray.900"
      borderColor="gray.700"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="50vh"
    >
      {/* Subtle accent line at top */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        h="1px" 
        bgGradient="to-r"
        gradientFrom="gray.800"
        gradientTo="orange.400"
        opacity={0.8}
      />
      
      {/* Main content */}
      <Box textAlign="center" mb={6}>
        <Heading 
          size="xl" 
          mb={3} 
          bgGradient="to-r"
          gradientFrom="white"
          gradientTo="orange.200"
          bgClip="text"
          fontWeight="black"
        >
          Register
        </Heading>
        <Text fontSize="lg" color="white" fontWeight="medium">
          Create a new account
        </Text>
      </Box>
      
      <Stack spacing={3} maxW="lg" mx="auto">
        <Box display="flex" alignItems="center" gap={4}>
          <Text fontSize="md" fontWeight="semibold" color="gray.200" minW="100px">
            Full Name
          </Text>
          <Input 
            placeholder="Enter your full name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            size="md"
            borderRadius="xl"
            borderColor="gray.600"
            _hover={{ borderColor: "orange.300" }}
            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)" }}
            bg="gray.800"
            color="white"
            _placeholder={{ color: "gray.400" }}
            py={3}
            px={4}
            flex={1}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={4}>
          <Text fontSize="md" fontWeight="semibold" color="gray.200" minW="100px">
            Email
          </Text>
          <Input 
            placeholder="Enter your email address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            size="md"
            borderRadius="xl"
            borderColor="gray.600"
            _hover={{ borderColor: "orange.300" }}
            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)" }}
            bg="gray.800"
            color="white"
            _placeholder={{ color: "gray.400" }}
            py={3}
            px={4}
            flex={1}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={4}>
          <Text fontSize="md" fontWeight="semibold" color="gray.200" minW="100px">
            Password
          </Text>
          <Input 
            placeholder="Create a strong password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            size="md"
            borderRadius="xl"
            borderColor="gray.600"
            _hover={{ borderColor: "orange.300" }}
            _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)" }}
            bg="gray.800"
            color="white"
            _placeholder={{ color: "gray.400" }}
            py={3}
            px={4}
            flex={1}
          />
        </Box>
        
        <Button 
          size="sm"
          bg="transparent"
          _hover={{
            bg: "gray.800",
            transform: "translateY(-2px)",
            boxShadow: "xl"
          }}
          _active={{
            transform: "translateY(0px)"
          }}
          color="#fb923c"
          fontWeight="black"
          fontSize="sm"
          py={1.5}
          px={1}
          borderRadius="md"
          boxShadow="none"
          transition="all 0.3s"
          isLoading={loading}
          onClick={handleRegister}
          border="1px solid"
          borderColor="#fb923c"
        >
          Register
        </Button>
      </Stack>
      
      <Box mt={8} textAlign="center">
        <Text fontSize="md" color="gray.300">
          Already have an account?{' '}
          <a 
            href="/login" 
            style={{
              color: '#fb923c',
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: '1px solid #fb923c',
              paddingBottom: '1px'
            }}
          >
            Sign in
          </a>
        </Text>
      </Box>
    </Box>
  );
} 