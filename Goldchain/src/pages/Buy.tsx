import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  InputGroup,
  InputRightAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaCoins, FaExchangeAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';

const Buy = () => {
  const { balance, isConnected } = useWallet();
  const { vGoldBalance, vGoldPrice, buyGold, sellGold } = useGold();
  const [buyAmount, setBuyAmount] = useState<number | string>('');
  const [sellAmount, setSellAmount] = useState<number | string>('');
  const [buyAlgoAmount, setBuyAlgoAmount] = useState<number>(0);
  const [sellAlgoAmount, setSellAlgoAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buySliderValue, setBuySliderValue] = useState<number>(0);
  const [sellSliderValue, setSellSliderValue] = useState<number>(0);
  const [showBuyTooltip, setShowBuyTooltip] = useState<boolean>(false);
  const [showSellTooltip, setShowSellTooltip] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.700');
  const summaryBg = useColorModeValue('gray.50', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const valueColor = useColorModeValue('gray.800', 'whiteAlpha.900');

  useEffect(() => {
    const amount = parseFloat(buyAmount.toString());
    setBuyAlgoAmount(isNaN(amount) ? 0 : amount * vGoldPrice);
  }, [buyAmount, vGoldPrice]);

  useEffect(() => {
    const amount = parseFloat(sellAmount.toString());
    setSellAlgoAmount(isNaN(amount) ? 0 : amount * vGoldPrice);
  }, [sellAmount, vGoldPrice]);

  const formatBalance = (balance: string | number): string => {
    return (typeof balance === 'string' ? parseFloat(balance) : balance).toFixed(4);
  };

  const handleAmountChange = (type: 'buy' | 'sell', value: string) => {
    // Allow empty string for controlled input, otherwise keep the raw user input (numeric string)
    const nextValue = value === '' ? '' : value;
    if (type === 'buy') setBuyAmount(nextValue);
    else setSellAmount(nextValue);
  };

  const handleBuySliderChange = (val: number) => {
    setBuySliderValue(val);
    const algoBalance = parseFloat(balance);
    const percentAmount = (algoBalance * val) / 100;
    const computedBuyVGold = vGoldPrice > 0 ? percentAmount / vGoldPrice : 0;
    setBuyAmount(formatBalance(computedBuyVGold));
  };

  const handleSellSliderChange = (val: number) => {
    setSellSliderValue(val);
    const percentAmount = (vGoldBalance * val) / 100;
    setSellAmount(formatBalance(percentAmount));
  };

  const handleBuy = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const amount = parseFloat(buyAmount.toString());
      if (isNaN(amount) || amount <= 0) throw new Error('Please enter a valid amount');
      if (buyAlgoAmount > parseFloat(balance)) throw new Error('Insufficient ALGO balance');
      
      await buyGold(amount);
      setBuyAmount('');
      setBuySliderValue(0);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const amount = parseFloat(sellAmount.toString());
      if (isNaN(amount) || amount <= 0) throw new Error('Please enter a valid amount');
      if (amount > vGoldBalance) throw new Error('Insufficient vGold balance');

      await sellGold(amount);
      setSellAmount('');
      setSellSliderValue(0);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Buy & Sell vGold</Heading>
        
        {!isConnected && (
          <Alert status="warning">
            <AlertIcon />
            Please connect your wallet to buy or sell vGold
          </Alert>
        )}
        
        <HStack spacing={8} align="flex-start" wrap={{ base: 'wrap', md: 'nowrap' }}>
          <Box p={5} shadow="md" borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={bgColor} flex="1" minW={{ base: '100%', md: '250px' }} maxW={{ base: '100%', md: '300px' }} className="card-hover">
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={2}>Current Balances</Heading>
              <Stat>
                <StatLabel>vGold Balance</StatLabel>
                <StatNumber className="balance-animation">{formatBalance(vGoldBalance)} vGold</StatNumber>
                <StatHelpText>≈ {formatBalance(vGoldBalance * vGoldPrice)} ALGO</StatHelpText>
              </Stat>
              <Divider />
              <Stat>
                <StatLabel>ALGO Balance</StatLabel>
                <StatNumber>{formatBalance(balance)}</StatNumber>
                <StatHelpText>≈ {formatBalance(parseFloat(balance) / vGoldPrice)} vGold</StatHelpText>
              </Stat>
              <Divider />
              <Stat>
                <StatLabel>Exchange Rate</StatLabel>
                <HStack><Text fontWeight="bold">1 vGold =</Text><Text>{formatBalance(vGoldPrice)} ALGO</Text></HStack>
                <HStack><Text fontWeight="bold">1 ALGO =</Text><Text>{formatBalance(1 / vGoldPrice)} vGold</Text></HStack>
              </Stat>
            </VStack>
          </Box>
          
          <Box flex="2" p={0} shadow="md" borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={bgColor} minW={{ base: '100%', md: '0' }} className="card-hover">
            <Tabs colorScheme="gold" isFitted>
              <TabList>
                <Tab fontSize="lg" fontWeight="medium" py={4} _selected={{ color: "gold.800", borderColor: "gold.500" }}>Buy vGold</Tab>
                <Tab fontSize="lg" fontWeight="medium" py={4} _selected={{ color: "red.600", borderColor: "red.500" }}>Sell vGold</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={6} align="stretch" p={2}>
                    <FormControl>
                      <FormLabel>Amount of vGold to buy</FormLabel>
                      <InputGroup size="lg">
                        <Input type="number" value={buyAmount} onChange={(e) => handleAmountChange('buy', e.target.value)} placeholder="0.0" disabled={!isConnected} />
                        <InputRightAddon children="vGold" />
                      </InputGroup>
                      <Box pt={6} pb={2}>
                        <Slider defaultValue={0} min={0} max={100} colorScheme="gold" onChange={handleBuySliderChange} onMouseEnter={() => setShowBuyTooltip(true)} onMouseLeave={() => setShowBuyTooltip(false)} isDisabled={!isConnected} value={buySliderValue}>
                          <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>25%</SliderMark>
                          <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>50%</SliderMark>
                          <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>75%</SliderMark>
                          <SliderTrack><SliderFilledTrack /></SliderTrack>
                          <Tooltip hasArrow bg='gold.500' color='white' placement='top' isOpen={showBuyTooltip} label={`${buySliderValue}%`}><SliderThumb boxSize={6}><Box color='gold.500' as={FaCoins} /></SliderThumb></Tooltip>
                        </Slider>
                      </Box>
                    </FormControl>
                    <Box p={4} bg={summaryBg} borderRadius="md">
                      <HStack justify="space-between"><Text color={labelColor}>You Pay:</Text><Text fontWeight="bold" color={valueColor}>{formatBalance(buyAlgoAmount)} ALGO</Text></HStack>
                      <HStack justify="space-between" mt={2}><Text color={labelColor}>You Receive:</Text><Text fontWeight="bold" color={valueColor}>{buyAmount ? formatBalance(buyAmount) : '0'} vGold</Text></HStack>
                      <HStack justify="space-between" mt={2}><Text color={labelColor}>Exchange Rate:</Text><Text color={valueColor}>1 vGold = {formatBalance(vGoldPrice)} ALGO</Text></HStack>
                    </Box>
                    {errorMessage && <Alert status="error"><AlertIcon />{errorMessage}</Alert>}
                    <Button colorScheme="gold" size="lg" leftIcon={<FaCoins />} onClick={handleBuy} isLoading={isLoading} loadingText="Processing..." isDisabled={!isConnected || buyAmount === '' || parseFloat(buyAmount.toString()) <= 0}>Buy vGold</Button>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={6} align="stretch" p={2}>
                    <FormControl>
                      <FormLabel>Amount of vGold to sell</FormLabel>
                      <InputGroup size="lg">
                        <Input type="number" value={sellAmount} onChange={(e) => handleAmountChange('sell', e.target.value)} placeholder="0.0" disabled={!isConnected} />
                        <InputRightAddon children="vGold" />
                      </InputGroup>
                      <Box pt={6} pb={2}>
                        <Slider defaultValue={0} min={0} max={100} colorScheme="red" onChange={handleSellSliderChange} onMouseEnter={() => setShowSellTooltip(true)} onMouseLeave={() => setShowSellTooltip(false)} isDisabled={!isConnected} value={sellSliderValue}>
                          <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>25%</SliderMark>
                          <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>50%</SliderMark>
                          <SliderMark value={75} mt='1' ml='-2.5' fontSize='sm'>75%</SliderMark>
                          <SliderTrack><SliderFilledTrack /></SliderTrack>
                          <Tooltip hasArrow bg='red.500' color='white' placement='top' isOpen={showSellTooltip} label={`${sellSliderValue}%`}><SliderThumb boxSize={6}><Box color='red.500' as={FaExchangeAlt} /></SliderThumb></Tooltip>
                        </Slider>
                      </Box>
                    </FormControl>
                    <Box p={4} bg={summaryBg} borderRadius="md">
                      <HStack justify="space-between"><Text color={labelColor}>You Sell:</Text><Text fontWeight="bold" color={valueColor}>{sellAmount ? formatBalance(sellAmount) : '0'} vGold</Text></HStack>
                      <HStack justify="space-between" mt={2}><Text color={labelColor}>You Receive:</Text><Text fontWeight="bold" color={valueColor}>{formatBalance(sellAlgoAmount)} ALGO</Text></HStack>
                      <HStack justify="space-between" mt={2}><Text color={labelColor}>Exchange Rate:</Text><Text color={valueColor}>1 vGold = {formatBalance(vGoldPrice)} ALGO</Text></HStack>
                    </Box>
                    {errorMessage && <Alert status="error"><AlertIcon />{errorMessage}</Alert>}
                    <Button colorScheme="red" size="lg" leftIcon={<FaExchangeAlt />} onClick={handleSell} isLoading={isLoading} loadingText="Processing..." isDisabled={!isConnected || sellAmount === '' || parseFloat(sellAmount.toString()) <= 0}>Sell vGold</Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Buy;