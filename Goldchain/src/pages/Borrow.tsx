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
  Tag,
  Badge,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FaCoins, FaWallet, FaClock, FaPercentage, FaArrowRight, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';

// Borrowing term options
const BORROWING_TERMS = [
  { days: 30, interest: 0.05, label: '30 Days', description: '5% Interest' },
  { days: 60, interest: 0.10, label: '60 Days', description: '10% Interest' },
  { days: 90, interest: 0.15, label: '90 Days', description: '15% Interest' },
  { days: 180, interest: 0.25, label: '180 Days', description: '25% Interest' },
];

const COLLATERAL_RATIO = 1.2; // 120% collateral ratio

const Borrow = () => {
  const { isConnected, balance } = useWallet();
  const { vGoldBalance, vGoldPrice, borrowGold, borrowPositions, repayLoan } = useGold();
  const [amount, setAmount] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<number>(BORROWING_TERMS[0].days);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isRepaying, setIsRepaying] = useState<boolean>(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Calculate collateral amount when borrow amount changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const borrowAmount = parseFloat(amount);
      // Calculate required collateral (120% of vGold value in ALGO)
      setCollateralAmount(borrowAmount * vGoldPrice * COLLATERAL_RATIO);
    } else {
      setCollateralAmount(0);
    }
  }, [amount, vGoldPrice]);

  const formatNumber = (value: number): string => {
    return value.toFixed(4);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getInterestRate = (days: number): number => {
    const term = BORROWING_TERMS.find(term => term.days === days);
    return term ? term.interest : 0;
  };

  const calculateRepaymentAmount = (principal: number, days: number): number => {
    const interestRate = getInterestRate(days);
    return principal * (1 + interestRate);
  };

  const getMaxBorrowAmount = (): number => {
    // Calculate max borrow amount based on ALGO balance
    // Max borrow = ALGO balance / (vGoldPrice * collateral ratio)
    return parseFloat(balance) / (vGoldPrice * COLLATERAL_RATIO);
  };

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    const maxBorrow = getMaxBorrowAmount();
    const amountToBorrow = (maxBorrow * val) / 100;
    setAmount(formatNumber(amountToBorrow));
  };

  const handleBorrow = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Validate amount
      const borrowAmount = parseFloat(amount);
      if (isNaN(borrowAmount) || borrowAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Check if collateral is sufficient
      if (collateralAmount > parseFloat(balance)) {
        throw new Error('Insufficient ALGO balance for collateral');
      }
      
      // Execute borrowing
      const transaction = await borrowGold(borrowAmount, selectedTerm);
      
      toast({
        title: 'Borrowing successful',
        description: `You've borrowed ${formatNumber(borrowAmount)} vGold by providing ${formatNumber(collateralAmount)} ALGO as collateral`,
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
        title: 'Borrowing failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepayLoan = async (loanId: string) => {
    setIsRepaying(true);
    setSelectedLoanId(loanId);
    
    try {
      // Find the loan to repay
      const loan = borrowPositions.find(pos => pos.id === loanId);
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      // Check if user has enough vGold to repay
      if (loan.amount > vGoldBalance) {
        throw new Error('Insufficient vGold balance to repay this loan');
      }
      
      // Execute repayment
      const transaction = await repayLoan(loanId);
      
      toast({
        title: 'Loan repaid successfully',
        description: `You've repaid your loan of ${formatNumber(loan.amount)} vGold and your collateral of ${formatNumber(loan.collateral)} ALGO has been returned`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Repayment failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRepaying(false);
      setSelectedLoanId('');
    }
  };

  // Calculate days passed and progress percentage for a loan
  const getLoanProgress = (startDate: number, endDate: number): number => {
    const totalDuration = endDate - startDate;
    const elapsed = Date.now() - startDate;
    return Math.min(100, Math.round((elapsed / totalDuration) * 100));
  };

  // Calculate time left for a loan
  const getTimeLeft = (endDate: number): string => {
    const now = Date.now();
    const timeLeft = endDate - now;
    
    if (timeLeft <= 0) {
      return 'Due now';
    }
    
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Borrow vGold</Heading>
        
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            Please connect your wallet to borrow vGold
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
              <Heading size="md" mb={2}>Borrowing Stats</Heading>
              
              <Stat>
                <StatLabel>ALGO Balance</StatLabel>
                <StatNumber>{formatNumber(parseFloat(balance))} ALGO</StatNumber>
                <StatHelpText>
                  Max borrowable: {formatNumber(getMaxBorrowAmount())} vGold
                </StatHelpText>
              </Stat>
              
              <Divider />
              
              <Stat>
                <StatLabel>Active Borrowing</StatLabel>
                <StatNumber>
                  {formatNumber(
                    borrowPositions
                      .filter(pos => pos.status === 'active')
                      .reduce((sum, pos) => sum + pos.amount, 0)
                  )} vGold
                </StatNumber>
                <StatHelpText>
                  {borrowPositions.filter(pos => pos.status === 'active').length} active loans
                </StatHelpText>
              </Stat>
              
              <Divider />
              
              <Stat>
                <StatLabel>Collateral Ratio</StatLabel>
                <HStack>
                  <Icon as={FaShieldAlt} color="blue.500" />
                  <Text fontWeight="bold">{COLLATERAL_RATIO * 100}%</Text>
                </HStack>
                <StatHelpText>
                  Required for all loans
                </StatHelpText>
              </Stat>
            </VStack>
          </Box>
          
          {/* Borrowing Form */}
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
              <Heading size="md">Borrow vGold with ALGO Collateral</Heading>
              
              <FormControl>
                <FormLabel>Amount to Borrow</FormLabel>
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
                  Select amount using the slider (% of max borrowable):
                </Text>
                
                <Box pt={6} pb={2}>
                  <Slider
                    id="slider"
                    defaultValue={0}
                    min={0}
                    max={100}
                    colorScheme="blue"
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
                      <Icon color="blue.500" as={FaCoins} />
                    </SliderThumb>
                  </Slider>
                </Box>
              </FormControl>
              
              <FormControl>
                <FormLabel>Select Borrowing Period</FormLabel>
                <RadioGroup colorScheme="blue" value={selectedTerm.toString()} onChange={(val) => setSelectedTerm(parseInt(val))}>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    {BORROWING_TERMS.map((term) => (
                      <Card key={term.days} variant="outline" className="card-hover" cursor="pointer">
                        <CardBody p={4}>
                          <Radio value={term.days.toString()} w="100%" h="100%">
                            <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap">
                              <Text fontWeight="bold">{term.label}</Text>
                              <Tag colorScheme="blue">{term.description}</Tag>
                            </Flex>
                          </Radio>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </RadioGroup>
              </FormControl>
              
              <Box p={4} bg={cardBg} borderRadius="md">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="medium">Required Collateral:</Text>
                  <HStack>
                    <Icon as={FaLock} color="blue.500" />
                    <Text fontWeight="bold">{formatNumber(collateralAmount)} ALGO</Text>
                  </HStack>
                </HStack>
                
                <Divider my={3} />
                
                <Flex justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">You Provide</Text>
                    <HStack>
                      <Icon as={FaWallet} color="blue.500" />
                      <Text fontWeight="bold">{formatNumber(collateralAmount)} ALGO</Text>
                    </HStack>
                  </VStack>
                  
                  <Icon as={FaArrowRight} color="gray.400" mx={4} />
                  
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.500">You Receive</Text>
                    <HStack>
                      <Icon as={FaCoins} color="gold.500" />
                      <Text fontWeight="bold">{amount || '0'} vGold</Text>
                    </HStack>
                  </VStack>
                </Flex>
                
                <Divider my={3} />
                
                <Flex justify="space-between">
                  <HStack>
                    <Icon as={FaPercentage} color="red.500" />
                    <Text>Interest Rate:</Text>
                  </HStack>
                  <Text fontWeight="bold">{(getInterestRate(selectedTerm) * 100).toFixed(1)}%</Text>
                </Flex>
                
                <Flex justify="space-between" mt={2}>
                  <HStack>
                    <Icon as={FaClock} color="purple.500" />
                    <Text>Duration:</Text>
                  </HStack>
                  <Text fontWeight="bold">{selectedTerm} days</Text>
                </Flex>
                
                <Flex justify="space-between" mt={2}>
                  <HStack>
                    <Icon as={FaCoins} color="orange.500" />
                    <Text>Repayment Amount:</Text>
                  </HStack>
                  <Text fontWeight="bold">
                    {amount ? formatNumber(calculateRepaymentAmount(parseFloat(amount), selectedTerm)) : '0'} vGold
                  </Text>
                </Flex>
              </Box>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">How borrowing works:</Text>
                  <Text fontSize="sm">
                    1. You provide ALGO as collateral
                    <br />
                    2. You receive vGold to use until the loan term ends
                    <br />
                    3. To get your collateral back, repay the borrowed vGold plus interest
                  </Text>
                </Box>
              </Alert>
              
              {errorMessage && (
                <Alert status="error">
                  <AlertIcon />
                  {errorMessage}
                </Alert>
              )}
              
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<FaWallet />}
                onClick={handleBorrow}
                isLoading={isLoading}
                loadingText="Processing..."
                isDisabled={!isConnected || !amount || parseFloat(amount) <= 0 || collateralAmount > parseFloat(balance)}
              >
                Borrow vGold
              </Button>
            </VStack>
          </Box>
        </HStack>
        
        {/* Active Loans */}
        {isConnected && borrowPositions.filter(pos => pos.status === 'active').length > 0 && (
          <Box
            mt={8}
            p={6}
            shadow="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={bgColor}
          >
            <Heading size="md" mb={4}>Active Loans</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {borrowPositions
                .filter(pos => pos.status === 'active')
                .map(loan => (
                  <Box
                    key={loan.id}
                    p={4}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    bg={cardBg}
                    className="card-hover"
                  >
                    <Flex justify="space-between" mb={2}>
                      <Badge colorScheme="blue" px={2} py={1} borderRadius="full">
                        {(loan.interest * 100).toFixed(1)}% Interest
                      </Badge>
                      <Text fontWeight="bold">{formatNumber(loan.amount)} vGold</Text>
                    </Flex>
                    
                    <HStack justify="space-between" fontSize="sm" mb={1}>
                      <Text color="gray.500">Collateral:</Text>
                      <Text fontWeight="medium">{formatNumber(loan.collateral)} ALGO</Text>
                    </HStack>
                    
                    <HStack justify="space-between" fontSize="sm" mb={1}>
                      <Text color="gray.500">Repayment Amount:</Text>
                      <Text fontWeight="medium">{formatNumber(loan.amount * (1 + loan.interest))} vGold</Text>
                    </HStack>
                    
                    <HStack justify="space-between" fontSize="sm" mb={3}>
                      <Text color="gray.500">Due Date:</Text>
                      <Text>{formatDate(loan.endDate)}</Text>
                    </HStack>
                    
                    <Box mb={3}>
                      <Flex justify="space-between" fontSize="xs" mb={1}>
                        <Text>Progress</Text>
                        <Text>{getTimeLeft(loan.endDate)}</Text>
                      </Flex>
                      <Progress 
                        value={getLoanProgress(loan.startDate, loan.endDate)} 
                        size="sm" 
                        colorScheme={getLoanProgress(loan.startDate, loan.endDate) > 90 ? "red" : "blue"} 
                        borderRadius="full"
                      />
                    </Box>
                    
                    <Button
                      colorScheme="blue"
                      size="sm"
                      width="full"
                      leftIcon={<FaCoins />}
                      onClick={() => handleRepayLoan(loan.id)}
                      isLoading={isRepaying && selectedLoanId === loan.id}
                      loadingText="Repaying..."
                      isDisabled={isRepaying}
                    >
                      Repay Loan
                    </Button>
                  </Box>
                ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Borrow; 