import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  Text, 
  Flex, 
  Icon, 
  Divider, 
  HStack, 
  Stack, 
  Button, 
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  Center,
} from '@chakra-ui/react';
import { FaCoins, FaWallet, FaChartLine, FaClock, FaExchangeAlt, FaHandHoldingUsd } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold, Transaction } from '../context/GoldContext';

const Dashboard = () => {
  const { account, balance, isConnected } = useWallet();
  const { vGoldBalance, vGoldPrice, transactions, lendPositions, borrowPositions } = useGold();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [activePositions, setActivePositions] = useState(0);
  
  // Define color mode values outside of conditional returns
  const statBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');
  const tableBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Calculate portfolio value
    const activeLendValue = lendPositions
      .filter(pos => pos.status === 'active')
      .reduce((sum, pos) => sum + pos.amount * (1 + pos.interest), 0);
    
    const borrowValue = borrowPositions
      .filter(pos => pos.status === 'active')
      .reduce((sum, pos) => sum + pos.amount, 0);
    
    setPortfolioValue(vGoldBalance + activeLendValue - borrowValue);
    
    // Count active positions
    setActivePositions(
      lendPositions.filter(pos => pos.status === 'active').length +
      borrowPositions.filter(pos => pos.status === 'active').length
    );

    return () => clearTimeout(timer);
  }, [vGoldBalance, lendPositions, borrowPositions]);

  const formatAmount = (amount: number) => {
    return amount.toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'green';
      case 'sell':
        return 'red';
      case 'lend':
        return 'purple';
      case 'borrow':
        return 'orange';
      case 'repay':
        return 'blue';
      case 'claim':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const getBadgeText = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!isConnected) {
    return (
      <Container maxW="container.lg" py={10} px={{ base: 4, md: 8 }}>
        <Center py={10}>
          <VStack spacing={6}>
            <Heading>Connect Your Wallet</Heading>
            <Text align="center">
              Please connect your wallet to view your dashboard
            </Text>
            <Button
              leftIcon={<FaWallet />}
              colorScheme="purple"
              size="lg"
              onClick={() => alert('Please use the connect wallet button in the navbar')}
            >
              Connect Wallet
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={10} px={{ base: 4, md: 8 }}>
      {isLoading ? (
        <Center py={10}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="gold.500"
            size="xl"
          />
        </Center>
      ) : (
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl">Dashboard</Heading>
          
          {/* Overview Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Stat
              px={6}
              py={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={statBg}
              borderColor={borderColor}
              className="card-hover"
            >
              <StatLabel fontWeight="medium">Portfolio Value</StatLabel>
              <StatNumber className="balance-animation">{formatAmount(portfolioValue)} vGold</StatNumber>
              <StatHelpText>
                <HStack>
                  <FaCoins color="#FFC300" />
                  <Text>${(portfolioValue * 48.72).toFixed(2)} USD</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Stat
              px={6}
              py={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={statBg}
              borderColor={borderColor}
              className="card-hover"
            >
              <StatLabel fontWeight="medium">vGold Balance</StatLabel>
              <StatNumber>{formatAmount(vGoldBalance)}</StatNumber>
              <StatHelpText>
                <HStack>
                  <FaWallet color="#805AD5" />
                  <Text>{formatAmount(parseFloat(balance))} ALGO in wallet</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Stat
              px={6}
              py={4}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={statBg}
              borderColor={borderColor}
              className="card-hover"
            >
              <StatLabel fontWeight="medium">Active Positions</StatLabel>
              <StatNumber>{activePositions}</StatNumber>
              <StatHelpText>
                <HStack>
                  <FaHandHoldingUsd color="#38A169" />
                  <Text>Across lending and borrowing</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          {/* Quick Actions */}
          <Box
            p={6}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Button
                as={RouterLink} 
                to="/buy"
                size="lg" 
                leftIcon={<FaCoins />} 
                colorScheme="yellow"
                variant="outline"
                className="card-hover"
              >
                Buy vGold
              </Button>
              <Button
                as={RouterLink} 
                to="/lend"
                size="lg" 
                leftIcon={<FaHandHoldingUsd />} 
                colorScheme="purple"
                variant="outline"
                className="card-hover"
              >
                Lend vGold
              </Button>
              <Button
                as={RouterLink} 
                to="/borrow"
                size="lg" 
                leftIcon={<FaWallet />} 
                colorScheme="orange"
                variant="outline"
                className="card-hover"
              >
                Borrow vGold
              </Button>
            </SimpleGrid>
          </Box>
          
          {/* Activity Tabs */}
          <Tabs variant="enclosed" colorScheme="purple">
            <TabList>
              <Tab>Recent Transactions</Tab>
              <Tab>Active Positions</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0} pt={4}>
                <Box
                  mt={4}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  borderColor={borderColor}
                  bg={tableBgColor}
                >
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Amount</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <Tr key={tx.id}>
                          <Td>
                            <Badge colorScheme={getBadgeColor(tx.type)}>
                              {getBadgeText(tx.type)}
                            </Badge>
                          </Td>
                          <Td>{formatAmount(tx.amount)}</Td>
                          <Td>{formatDate(tx.timestamp)}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                tx.status === 'completed'
                                  ? 'green'
                                  : tx.status === 'pending'
                                  ? 'yellow'
                                  : 'red'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  
                  {transactions.length === 0 ? (
                    <Box p={4} textAlign="center">
                      <Text color="gray.500">No transactions yet</Text>
                    </Box>
                  ) : transactions.length > 5 ? (
                    <Box p={4} textAlign="center">
                      <Button
                        as={RouterLink}
                        to="/transactions"
                        size="sm"
                        colorScheme="purple"
                        variant="link"
                      >
                        View All Transactions
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              </TabPanel>
              
              <TabPanel p={0} pt={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  {/* Lending Positions */}
                  <Box
                    p={5}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="lg"
                    bg={bgColor}
                    borderColor={borderColor}
                  >
                    <Heading size="sm" mb={4}>Lending Positions</Heading>
                    
                    {lendPositions.filter(pos => pos.status === 'active').length === 0 ? (
                      <Text color="gray.500">No active lending positions</Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {lendPositions
                          .filter(pos => pos.status === 'active')
                          .slice(0, 3)
                          .map((position) => (
                            <Box 
                              key={position.id} 
                              p={3} 
                              borderWidth="1px" 
                              borderRadius="md"
                              borderColor={borderColor}
                            >
                              <Flex justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <FaHandHoldingUsd color="#805AD5" />
                                    <Text fontWeight="medium">{formatAmount(position.amount)} vGold</Text>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.500">
                                    Matures: {formatDate(position.endDate)}
                                  </Text>
                                </VStack>
                                <Badge colorScheme="purple">
                                  {(position.interest * 100).toFixed(1)}% Interest
                                </Badge>
                              </Flex>
                            </Box>
                          ))}
                          
                        {lendPositions.filter(pos => pos.status === 'active').length > 3 && (
                          <Button
                            as={RouterLink}
                            to="/portfolio"
                            size="sm"
                            colorScheme="purple"
                            variant="link"
                          >
                            View All Lending Positions
                          </Button>
                        )}
                      </VStack>
                    )}
                  </Box>
                  
                  {/* Borrowing Positions */}
                  <Box
                    p={5}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="lg"
                    bg={bgColor}
                    borderColor={borderColor}
                  >
                    <Heading size="sm" mb={4}>Borrowing Positions</Heading>
                    
                    {borrowPositions.filter(pos => pos.status === 'active').length === 0 ? (
                      <Text color="gray.500">No active borrowing positions</Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {borrowPositions
                          .filter(pos => pos.status === 'active')
                          .slice(0, 3)
                          .map((position) => (
                            <Box 
                              key={position.id} 
                              p={3} 
                              borderWidth="1px" 
                              borderRadius="md"
                              borderColor={borderColor}
                            >
                              <Flex justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <FaWallet color="#DD6B20" />
                                    <Text fontWeight="medium">{formatAmount(position.amount)} vGold</Text>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.500">
                                    Due: {formatDate(position.endDate)}
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing={1}>
                                  <Badge colorScheme="orange">
                                    {(position.interest * 100).toFixed(1)}% Interest
                                  </Badge>
                                  <Text fontSize="xs" color="gray.500">
                                    Collateral: {formatAmount(position.collateral)} ALGO
                                  </Text>
                                </VStack>
                              </Flex>
                            </Box>
                          ))}
                          
                        {borrowPositions.filter(pos => pos.status === 'active').length > 3 && (
                          <Button
                            as={RouterLink}
                            to="/portfolio"
                            size="sm"
                            colorScheme="orange"
                            variant="link"
                          >
                            View All Borrowing Positions
                          </Button>
                        )}
                      </VStack>
                    )}
                  </Box>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      )}
    </Container>
  );
};

export default Dashboard; 