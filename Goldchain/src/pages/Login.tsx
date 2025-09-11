import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Link,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
  Divider,
  useToast,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaWallet, FaEnvelope, FaLock } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';

interface LoginProps {
  setUser: (user: any) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { connectWallet, isConnected, address } = useWallet();

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to authenticate the user
      // For the demo, we're simulating a successful login
      setTimeout(() => {
        const mockUser = {
          id: '1',
          email,
          name: 'Demo User',
          isVerified: true,
        };
        
        localStorage.setItem('goldchain_user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: 'Login successful',
          description: "Welcome back to GoldChain!",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/dashboard');
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      setError('Invalid email or password');
      setIsSubmitting(false);
    }
  };

  const handleLoginWithWallet = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!isConnected) {
        await connectWallet('pera');
      }
      
      if (address) {
        // In a real application, this would verify the wallet signature
        const mockUser = {
          id: '2',
          email: `${address.substring(0, 6)}...${address.substring(address.length - 4)}@algorand.wallet`,
          name: 'Wallet User',
          wallet: address,
          isVerified: true,
        };
        
        localStorage.setItem('goldchain_user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: 'Wallet login successful',
          description: "Welcome to GoldChain!",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/dashboard');
      }
      setIsSubmitting(false);
    } catch (error) {
      setError('Failed to connect wallet. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Flex
      minH={'80vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      className="fade-in"
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} minW={{ base: "90%", md: "450px" }}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'} className="gold-text">
            Sign in to your account
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our gold investment features ✨
          </Text>
        </Stack>
        
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
          className="slide-in-up"
        >
          <Button
            w={'full'}
            colorScheme={'messenger'}
            leftIcon={<FaWallet />}
            onClick={handleLoginWithWallet}
            isLoading={isSubmitting && !email}
            mb={6}
            className="shimmer-border"
          >
            Sign in with Algorand Wallet
          </Button>
          
          <HStack mb={6}>
            <Divider />
            <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
              OR CONTINUE WITH
            </Text>
            <Divider />
          </HStack>
          
          <form onSubmit={handleLogin}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired isInvalid={!!error && !email}>
                <FormLabel>Email address</FormLabel>
                <InputGroup>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    pr="4.5rem"
                  />
                  <InputRightElement width="4.5rem">
                    <Icon as={FaEnvelope} color="gray.400" />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{!email && error}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isRequired isInvalid={!!error && !password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() => setShowPassword((showPassword) => !showPassword)}
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{!password && error}</FormErrorMessage>
              </FormControl>
              
              {error && email && password && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
              
              <Stack spacing={5}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  align={'start'}
                  justify={'space-between'}
                >
                  <Link color={'blue.400'}>Forgot password?</Link>
                </Stack>
                <Button
                  bg={'gold.500'}
                  color={'white'}
                  _hover={{
                    bg: 'gold.400',
                  }}
                  type="submit"
                  isLoading={!!(isSubmitting && email)}
                  loadingText="Signing in..."
                  leftIcon={<FaLock />}
                  className="pulse"
                >
                  Sign in
                </Button>
                
                <HStack justify="center" spacing={1}>
                  <Text align={'center'}>
                    Don't have an account?
                  </Text>
                  <Link as={RouterLink} to="/register" color={'gold.500'} fontWeight="semibold">
                    Sign up
                  </Link>
                </HStack>
              </Stack>
            </Stack>
          </form>
        </Box>
        
        <VStack spacing={2}>
          <Text fontSize="sm" color="gray.500">
            By signing in, you agree to our
          </Text>
          <HStack spacing={1} fontSize="sm">
            <Link color="blue.400">Terms of Service</Link>
            <Text color="gray.500">and</Text>
            <Link color="blue.400">Privacy Policy</Link>
          </HStack>
        </VStack>
      </Stack>
    </Flex>
  );
} 