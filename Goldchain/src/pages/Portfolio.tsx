import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  VStack,
  HStack,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  useColorModeValue,
  Divider,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaCoins, FaWallet, FaHandHoldingUsd, FaExchangeAlt, FaChartPie } from 'react-icons/fa';
import { useGold, LendPosition, BorrowPosition } from '../context/GoldContext';
import { useWallet } from '../context/WalletContext';

const Portfolio = () => {
  const { vGoldBalance, vGoldPrice, lendPositions, borrowPositions, claimLendReturns, repayLoan } = useGold();
  const { address, isConnected, balance } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [lendingValue, setLendingValue] = useState(0);
  const [borrowingValue, setBorrowingValue] = useState(0);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Calculate portfolio metrics
    if (isConnected) {
      // Calculate total value of lending positions
      const lendingTotal = lendPositions
        .filter(pos => pos.status === 'active')
        .reduce((sum, pos) => {
          const daysElapsed = (Date.now() - pos.startDate) / (1000 * 60 * 60 * 24);
          const interestAccrued = pos.amount * pos.interest * (daysElapsed / 365);
          return sum + pos.amount + interestAccrued;
        }, 0);
      
      setLendingValue(lendingTotal);
      
      // Calculate total value of borrowing positions
      const borrowingTotal = borrowPositions
        .filter(pos => pos.status === 'active')
        .reduce((sum, pos) => sum + pos.amount, 0);
      
      setBorrowingValue(borrowingTotal);
      
      // Calculate total portfolio value (balance + lending - borrowing)
      setPortfolioValue(vGoldBalance + lendingTotal - borrowingTotal);
    }

    return () => clearTimeout(timer);
  }, [isConnected, vGoldBalance, lendPositions, borrowPositions]);

  // Format currency values
  const formatNumber = (num: number) => {
    return num.toFixed(4);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Calculate time remaining for a position
  const getTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const difference = endDate - now;
    
    if (difference <= 0) {
      return 'Matured';
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  // Handle claim returns action
  const handleClaimReturns = async (lendId: string) => {
    setProcessingAction(lendId);
    try {
      await claimLendReturns(lendId);
      // No need to update state, it will be handled by the context
    } catch (error) {
      console.error('Error claiming returns:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle repay loan action
  const handleRepayLoan = async (borrowId: string) => {
    setProcessingAction(borrowId);
    try {
      await repayLoan(borrowId);
      // No need to update state, it will be handled by the context
    } catch (error) {
      console.error('Error repaying loan:', error);
    } finally {
      setProcessingAction(null);
    }
  };

  if (!isConnected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          Please connect your wallet to view your portfolio.
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center py={10}>
          <VStack>
            <Spinner size="xl" color="gold.500" thickness="4px" speed="0.65s" />
            <Text mt={4}>Loading your portfolio...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl" mb={2}>Portfolio Overview</Heading>
        
        {/* Portfolio Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat
            px={6}
            py={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={cardBg}
            borderColor={borderColor}
            className="card-hover"
          >
            <StatLabel fontWeight="medium">Total Portfolio Value</StatLabel>
            <StatNumber>{formatNumber(portfolioValue)} vGold</StatNumber>
            <StatHelpText>
              <HStack>
                <Icon as={FaChartPie} color="gold.500" />
                <Text>${(portfolioValue * vGoldPrice * 1000).toFixed(2)} USD</Text>
              </HStack>
            </StatHelpText>
          </Stat>
          
          <Stat
            px={6}
            py={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={cardBg}
            borderColor={borderColor}
            className="card-hover"
          >
            <StatLabel fontWeight="medium">vGold Balance</StatLabel>
            <StatNumber>{formatNumber(vGoldBalance)} vGold</StatNumber>
            <StatHelpText>
              <HStack>
                <Icon as={FaCoins} color="gold.500" />
                <Text>${(vGoldBalance * vGoldPrice * 1000).toFixed(2)} USD</Text>
              </HStack>
            </StatHelpText>
          </Stat>
          
          <Stat
            px={6}
            py={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={cardBg}
            borderColor={borderColor}
            className="card-hover"
          >
            <StatLabel fontWeight="medium">Wallet Balance</StatLabel>
            <StatNumber>{formatNumber(parseFloat(balance))} ALGO</StatNumber>
            <StatHelpText>
              <HStack>
                <Icon as={FaWallet} color="purple.500" />
                <Text>{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</Text>
              </HStack>
            </StatHelpText>
          </Stat>
        </SimpleGrid>
        
        <Divider my={6} />
        
        {/* Positions Tabs */}
        <Tabs colorScheme="gold" variant="enclosed">
          <TabList>
            <Tab>Lending Positions ({lendPositions.length})</Tab>
            <Tab>Borrowing Positions ({borrowPositions.length})</Tab>
          </TabList>
          
          <TabPanels>
            {/* Lending Positions Tab */}
            <TabPanel px={0}>
              <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg={tableBg}
                shadow="md"
              >
                {lendPositions.length === 0 ? (
                  <Box p={6} textAlign="center">
                    <Text fontSize="lg" color="gray.500">You don't have any lending positions yet.</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>Start earning interest by lending your vGold.</Text>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Amount</Th>
                        <Th>Interest Rate</Th>
                        <Th>Start Date</Th>
                        <Th>End Date</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {lendPositions.map((position) => (
                        <Tr key={position.id} _hover={{ bg: hoverBg }}>
                          <Td fontWeight="medium">{formatNumber(position.amount)} vGold</Td>
                          <Td>{(position.interest * 100).toFixed(2)}%</Td>
                          <Td>{formatDate(position.startDate)}</Td>
                          <Td>{formatDate(position.endDate)}</Td>
                          <Td>
                            <Badge
                              colorScheme={position.status === 'active' ? 'green' : 'gray'}
                              borderRadius="full"
                              px={2}
                            >
                              {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                            </Badge>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {position.status === 'active' ? getTimeRemaining(position.endDate) : ''}
                            </Text>
                          </Td>
                          <Td>
                            {position.status === 'active' && Date.now() >= position.endDate ? (
                              <Button
                                size="sm"
                                colorScheme="gold"
                                isLoading={processingAction === position.id}
                                onClick={() => handleClaimReturns(position.id)}
                              >
                                Claim Returns
                              </Button>
                            ) : position.status === 'active' ? (
                              <Text fontSize="sm" color="gray.500">Not yet matured</Text>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Completed</Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </TabPanel>
            
            {/* Borrowing Positions Tab */}
            <TabPanel px={0}>
              <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg={tableBg}
                shadow="md"
              >
                {borrowPositions.length === 0 ? (
                  <Box p={6} textAlign="center">
                    <Text fontSize="lg" color="gray.500">You don't have any borrowing positions yet.</Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>Need funds? Borrow against your collateral.</Text>
                  </Box>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Amount</Th>
                        <Th>Interest Rate</Th>
                        <Th>Collateral</Th>
                        <Th>Start Date</Th>
                        <Th>Due Date</Th>
                        <Th>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {borrowPositions.map((position) => (
                        <Tr key={position.id} _hover={{ bg: hoverBg }}>
                          <Td fontWeight="medium">{formatNumber(position.amount)} vGold</Td>
                          <Td>{(position.interest * 100).toFixed(2)}%</Td>
                          <Td>{formatNumber(position.collateral)} ALGO</Td>
                          <Td>{formatDate(position.startDate)}</Td>
                          <Td>{formatDate(position.endDate)}</Td>
                          <Td>
                            <Badge
                              colorScheme={position.status === 'active' ? 'orange' : 'green'}
                              borderRadius="full"
                              px={2}
                            >
                              {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                            </Badge>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {position.status === 'active' ? getTimeRemaining(position.endDate) : ''}
                            </Text>
                          </Td>
                          <Td>
                            {position.status === 'active' ? (
                              <Button
                                size="sm"
                                colorScheme="gold"
                                isLoading={processingAction === position.id}
                                onClick={() => handleRepayLoan(position.id)}
                              >
                                Repay Loan
                              </Button>
                            ) : (
                              <Text fontSize="sm" color="gray.500">Repaid</Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default Portfolio; 