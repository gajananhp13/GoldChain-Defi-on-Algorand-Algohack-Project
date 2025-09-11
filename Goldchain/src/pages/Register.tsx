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
  Checkbox,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FaWallet, FaUserAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';

interface RegisterProps {
  setUser: (user: any) => void;
}

export default function Register({ setUser }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { connectWallet, isConnected, address } = useWallet();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) newErrors.terms = 'You must agree to the terms and conditions';
    
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to register the user
      // For the demo, we're simulating a successful registration
      setTimeout(() => {
        const mockUser = {
          id: Date.now().toString(),
          name,
          email,
          isVerified: true,
        };
        
        localStorage.setItem('goldchain_user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: 'Account created.',
          description: "We've created your account for you.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/dashboard');
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to create your account.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsSubmitting(false);
    }
  };

  const handleRegisterWithWallet = async () => {
    setError({});
    setIsSubmitting(true);
    
    try {
      if (!isConnected) {
        await connectWallet('pera');
      }
      
      if (address) {
        // In a real application, this would verify the wallet signature
        const mockUser = {
          id: Date.now().toString(),
          name: `Wallet User ${address.substring(0, 4)}`,
          email: `${address.substring(0, 6)}...${address.substring(address.length - 4)}@wallet.eth`,
          wallet: address,
          isVerified: true,
        };
        
        localStorage.setItem('goldchain_user', JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: 'Account created.',
          description: "Your wallet has been successfully connected.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        navigate('/dashboard');
      }
      setIsSubmitting(false);
    } catch (err) {
      setError({ wallet: 'Failed to connect wallet. Please try again.' });
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
            Create your account
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to start your gold investment journey ✨
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
            onClick={handleRegisterWithWallet}
            isLoading={isSubmitting && !email}
            mb={6}
            className="shimmer-border"
          >
            Register with MetaMask
          </Button>
          
          <HStack mb={6}>
            <Divider />
            <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
              OR REGISTER WITH EMAIL
            </Text>
            <Divider />
          </HStack>
          
          <form onSubmit={handleRegister}>
            <Stack spacing={4}>
              <FormControl id="name" isRequired isInvalid={!!error.name}>
                <FormLabel>Full Name</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                  <InputRightElement width="4.5rem">
                    <Icon as={FaUserAlt} color="gray.400" />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{error.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="email" isRequired isInvalid={!!error.email}>
                <FormLabel>Email address</FormLabel>
                <InputGroup>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                  <InputRightElement width="4.5rem">
                    <Icon as={FaEnvelope} color="gray.400" />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{error.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isRequired isInvalid={!!error.password}>
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
                <FormErrorMessage>{error.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired isInvalid={!!error.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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
                <FormErrorMessage>{error.confirmPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="terms" isInvalid={!!error.terms}>
                <Checkbox
                  colorScheme="blue"
                  isChecked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                >
                  I agree to the Terms of Service and Privacy Policy
                </Checkbox>
                <FormErrorMessage>{error.terms}</FormErrorMessage>
              </FormControl>
              
              {error.wallet && (
                <Text color="red.500" fontSize="sm">
                  {error.wallet}
                </Text>
              )}
              
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={'gold.500'}
                  color={'white'}
                  _hover={{
                    bg: 'gold.400',
                  }}
                  type="submit"
                  isLoading={isSubmitting && !!email}
                  leftIcon={<FaLock />}
                  className="pulse"
                >
                  Sign up
                </Button>
              </Stack>
              
              <Stack pt={6}>
                <Text align={'center'}>
                  Already a user? <Link as={RouterLink} to="/login" color={'gold.500'} fontWeight="semibold">Login</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
        
        <VStack spacing={2}>
          <Text fontSize="sm" color="gray.500">
            By signing up, you agree to our
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