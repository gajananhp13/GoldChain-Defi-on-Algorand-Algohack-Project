import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  RadioGroup,
  Radio,
  SimpleGrid,
  Divider,
  Select,
  Alert,
  AlertIcon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  InputGroup,
  InputRightAddon,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Tag,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FaCoins, FaHandHoldingUsd, FaClock, FaPercentage, FaArrowRight } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';

// Lending term options
const LENDING_TERMS = [
  { days: 30, interest: 0.03, label: '30 Days', description: '3% Interest' },
  { days: 60, interest: 0.07, label: '60 Days', description: '7% Interest' },
  { days: 90, interest: 0.12, label: '90 Days', description: '12% Interest' },
  { days: 180, interest: 0.20, label: '180 Days', description: '20% Interest' },
];

const Lend = () => {
  const { isConnected } = useWallet();
  const { vGoldBalance, lendGold, lendPositions } = useGold();
  const [amount, setAmount] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<number>(LENDING_TERMS[0].days);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeLendValue, setActiveLendValue] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Calculate active lending value
  useEffect(() => {
    const activeLoans = lendPositions.filter(pos => pos.status === 'active');
    const totalValue = activeLoans.reduce((sum, pos) => {
      return sum + pos.amount;
    }, 0);
    setActiveLendValue(totalValue);
  }, [lendPositions]);

  const formatNumber = (value: number): string => {
    return value.toFixed(4);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getInterestRate = (days: number): number => {
    const term = LENDING_TERMS.find(term => term.days === days);
    return term ? term.interest : 0;
  };

  const calculateReturns = (principal: number, days: number): number => {
    const interestRate = getInterestRate(days);
    return principal * (1 + interestRate);
  };

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    const amountToLend = (vGoldBalance * val) / 100;
    setAmount(formatNumber(amountToLend));
  };

  const handleLend = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Validate amount
      const lendAmount = parseFloat(amount);
      if (isNaN(lendAmount) || lendAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Check if user has enough vGold
      if (lendAmount > vGoldBalance) {
        throw new Error('Insufficient vGold balance');
      }
      
      // Execute lending
      const transaction = await lendGold(lendAmount, selectedTerm);
      
      toast({
        title: 'Lending successful',
        description: `You've lent ${formatNumber(lendAmount)} vGold for ${selectedTerm} days`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setAmount('');
      setSliderValue(0);
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({
        title: 'Lending failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Lend vGold</Heading>
        
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            Please connect your wallet to lend vGold
          </Alert>
        )}
        
        <HStack spacing={8} align="flex-start" wrap={{ base: 'wrap', md: 'nowrap' }}>
          {/* Stats Section */}
          <Box
            p={5}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
            flex="1"
            minW={{ base: '100%', md: '250px' }}
            maxW={{ base: '100%', md: '300px' }}
            className="card-hover"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={2}>Lending Stats</Heading>
              
              <Stat>
                <StatLabel>Available Balance</StatLabel>
                <StatNumber className="balance-animation">{formatNumber(vGoldBalance)} vGold</StatNumber>
              </Stat>
              
              <Divider />
              
              <Stat>
                <StatLabel>Active Lending</StatLabel>
                <StatNumber>{formatNumber(activeLendValue)} vGold</StatNumber>
                <StatHelpText>
                  {lendPositions.filter(pos => pos.status === 'active').length} active positions
                </StatHelpText>
              </Stat>
            </VStack>
          </Box>
          
          {/* Lending Form */}
          <Box
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
            flex="2"
            p={6}
            minW={{ base: '100%', md: '0' }}
            className="card-hover"
          >
            <VStack spacing={6} align="stretch">
              <Heading size="md">Lend Your vGold</Heading>
              
              <FormControl>
                <FormLabel>Amount to Lend</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    disabled={!isConnected}
                  />
                  <InputRightAddon children="vGold" />
                </InputGroup>
                
                <Text mt={2} fontSize="sm" color="gray.500">
                  Select amount using the slider:
                </Text>
                
                <Box pt={6} pb={2}>
                  <Slider
                    id="slider"
                    defaultValue={0}
                    min={0}
                    max={100}
                    colorScheme="purple"
                    onChange={handleSliderChange}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    isDisabled={!isConnected}
                    value={sliderValue}
                  >
                    <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                      25%
                    </SliderMark>
                    <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                      50%
                    </SliderMark>
                    <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>
                      75%
                    </SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Icon color="purple.500" as={FaCoins} />
                    </SliderThumb>
                  </Slider>
                </Box>
              </FormControl>
              
              <FormControl>
                <FormLabel>Select Lending Period</FormLabel>
                <RadioGroup colorScheme="purple" value={selectedTerm.toString()} onChange={(val) => setSelectedTerm(parseInt(val))}>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    {LENDING_TERMS.map((term) => (
                      <Card key={term.days} variant="outline" className="card-hover" cursor="pointer">
                        <CardBody p={4}>
                          <Radio value={term.days.toString()} w="100%" h="100%">
                            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
                              <Text fontWeight="bold">{term.label}</Text>
                              <Tag colorScheme="purple">{term.description}</Tag>
                            </Flex>
                          </Radio>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </RadioGroup>
              </FormControl>
              
              <Box p={4} bg={cardBg} borderRadius="md">
                <Flex justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">You Lend</Text>
                    <HStack>
                      <Icon as={FaCoins} color="gold.500" />
                      <Text fontWeight="bold">{amount || '0'} vGold</Text>
                    </HStack>
                  </VStack>
                  
                  <Icon as={FaArrowRight} color="gray.400" mx={4} />
                  
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">You Receive After {selectedTerm} Days</Text>
                    <HStack>
                      <Icon as={FaCoins} color="purple.500" />
                      <Text fontWeight="bold">
                        {amount ? formatNumber(calculateReturns(parseFloat(amount), selectedTerm)) : '0'} vGold
                      </Text>
                    </HStack>
                  </VStack>
                </Flex>
                
                <Divider my={3} />
                
                <Flex justify="space-between">
                  <HStack>
                    <Icon as={FaPercentage} color="green.500" />
                    <Text>Interest Rate:</Text>
                  </HStack>
                  <Text fontWeight="bold">{(getInterestRate(selectedTerm) * 100).toFixed(1)}%</Text>
                </Flex>
                
                <Flex justify="space-between" mt={2}>
                  <HStack>
                    <Icon as={FaClock} color="blue.500" />
                    <Text>Duration:</Text>
                  </HStack>
                  <Text fontWeight="bold">{selectedTerm} days</Text>
                </Flex>
                
                <Flex justify="space-between" mt={2}>
                  <HStack>
                    <Icon as={FaHandHoldingUsd} color="purple.500" />
                    <Text>Estimated Interest:</Text>
                  </HStack>
                  <Text fontWeight="bold">
                    {amount ? formatNumber(parseFloat(amount) * getInterestRate(selectedTerm)) : '0'} vGold
                  </Text>
                </Flex>
              </Box>
              
              {errorMessage && (
                <Alert status="error">
                  <AlertIcon />
                  {errorMessage}
                </Alert>
              )}
              
              <Button
                colorScheme="purple"
                size="lg"
                leftIcon={<FaHandHoldingUsd />}
                onClick={handleLend}
                isLoading={isLoading}
                loadingText="Processing..."
                isDisabled={!isConnected || !amount || parseFloat(amount) <= 0}
              >
                Lend vGold
              </Button>
            </VStack>
          </Box>
        </HStack>
        
        {/* Active Lending Positions */}
        {isConnected && lendPositions.filter(pos => pos.status === 'active').length > 0 && (
          <Box
            mt={8}
            p={6}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
          >
            <Heading size="md" mb={4}>Active Lending Positions</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {lendPositions
                .filter(pos => pos.status === 'active')
                .map(position => (
                  <Box
                    key={position.id}
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={cardBg}
                    className="card-hover"
                  >
                    <Flex justify="space-between" mb={2}>
                      <Badge colorScheme="purple" px={2} py={1} borderRadius="full">
                        {(position.interest * 100).toFixed(1)}% Interest
                      </Badge>
                      <Text fontWeight="bold">{formatNumber(position.amount)} vGold</Text>
                    </Flex>
                    <Divider my={2} />
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="gray.500">Started:</Text>
                      <Text>{formatDate(position.startDate)}</Text>
                    </HStack>
                    <HStack justify="space-between" fontSize="sm">
                      <Text color="gray.500">Ends:</Text>
                      <Text>{formatDate(position.endDate)}</Text>
                    </HStack>
                    <HStack justify="space-between" fontSize="sm" mt={2}>
                      <Text color="gray.500">Returns:</Text>
                      <Text fontWeight="bold">{formatNumber(position.amount * (1 + position.interest))} vGold</Text>
                    </HStack>
                  </Box>
                ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Lend; 