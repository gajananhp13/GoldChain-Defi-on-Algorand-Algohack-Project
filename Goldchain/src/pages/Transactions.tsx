import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  useColorModeValue,
  Spinner,
  Center,
  Stack
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useGold, Transaction } from '../context/GoldContext';
import { useWallet } from '../context/WalletContext';

const Transactions = () => {
  const { transactions } = useGold();
  const { isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Simulating data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortField('timestamp');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format amount with vGold symbol
  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)} vGold`;
  };

  // Get badge color based on transaction type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'green';
      case 'sell':
        return 'red';
      case 'lend':
        return 'blue';
      case 'borrow':
        return 'orange';
      case 'repay':
        return 'teal';
      case 'claim':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Get readable text for transaction type
  const getBadgeText = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Buy';
      case 'sell':
        return 'Sell';
      case 'lend':
        return 'Lend';
      case 'borrow':
        return 'Borrow';
      case 'repay':
        return 'Repay';
      case 'claim':
        return 'Claim';
      default:
        return type;
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // Text search
      const searchMatch =
        searchTerm === '' ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.txHash && tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const statusMatch = statusFilter === 'all' || tx.status === statusFilter;

      // Type filter
      const typeMatch = typeFilter === 'all' || tx.type === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    })
    .sort((a, b) => {
      // Sort based on field and direction
      const aValue = a[sortField as keyof Transaction];
      const bValue = b[sortField as keyof Transaction];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Render sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (!isConnected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="xl" mb={4}>
            Transactions
          </Heading>
          <Text fontSize="lg">
            Please connect your wallet to view your transactions
          </Text>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="xl" mb={4}>
            Transactions
          </Heading>
          <Center h="200px">
            <Spinner size="xl" color="purple.500" />
          </Center>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="left" py={4}>
        <Heading as="h1" size="xl" mb={6}>
          Transaction History
        </Heading>

        {/* Filters */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          mb={6} 
          wrap="wrap"
          justify="space-between"
        >
          <HStack spacing={4} mb={{ base: 4, md: 0 }}>
            <InputGroup w={{ base: 'full', md: '250px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by ID or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              w={{ base: 'full', md: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </Select>

            <Select
              w={{ base: 'full', md: '150px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="lend">Lend</option>
              <option value="borrow">Borrow</option>
              <option value="repay">Repay</option>
              <option value="claim">Claim</option>
            </Select>
          </HStack>

          <Button colorScheme="purple" variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Flex>

        {/* Transactions Table */}
        <Box
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          borderColor={borderColor}
          bg={tableBgColor}
          overflowX="auto"
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th cursor="pointer" onClick={() => handleSort('type')}>
                  <Flex align="center">
                    Type {getSortIcon('type')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('amount')}>
                  <Flex align="center">
                    Amount {getSortIcon('amount')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('timestamp')}>
                  <Flex align="center">
                    Date {getSortIcon('timestamp')}
                  </Flex>
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('status')}>
                  <Flex align="center">
                    Status {getSortIcon('status')}
                  </Flex>
                </Th>
                <Th>Transaction Hash</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.length > 0 ? (
                currentItems.map((tx) => (
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
                    <Td>
                      {tx.txHash ? (
                        <Text fontSize="sm" fontFamily="monospace" isTruncated maxW="150px">
                          {tx.txHash}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          N/A
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8}>
                    <Text color="gray.500">No transactions found</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <Flex justify="space-between" align="center" mt={6}>
            <Text color="gray.600">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                isDisabled={currentPage === 1}
                colorScheme="purple"
                variant="outline"
              >
                Previous
              </Button>
              <Box px={2}>
                Page {currentPage} of {totalPages || 1}
              </Box>
              <Button
                size="sm"
                onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
                isDisabled={currentPage === totalPages || totalPages === 0}
                colorScheme="purple"
                variant="outline"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>
    </Container>
  );
};

export default Transactions; 