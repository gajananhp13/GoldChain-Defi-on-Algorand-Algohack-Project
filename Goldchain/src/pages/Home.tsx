import React, { useEffect, useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Image,
  HStack,
  VStack,
  IconProps,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  ScaleFade,
} from '@chakra-ui/react';
import {
  FaCoins,
  FaWallet,
  FaHandHoldingUsd,
  FaShieldAlt,
  FaChartLine,
  FaLock,
  FaSyncAlt,
  FaArrowRight,
  FaEthereum,
  FaUniversity,
} from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { usePrice } from '../context/PriceContext';
import goldVaultImg from '../assets/GoldVault.png';

const Feature = ({ title, text, icon, delay }: {
  title: string;
  text: string;
  icon: React.ReactElement;
  delay: number;
}) => {
  return (
    <Stack 
      className="slide-in-up" 
      style={{ animationDelay: `${delay}s` }}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow={'lg'}
      p={6}
      rounded={'xl'}
      border={'1px'}
      borderColor={useColorModeValue('gray.100', 'gray.600')}
      _hover={{
        borderColor: 'gold.500',
        transform: 'translateY(-5px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'gold.500'}
        mb={4}
        className="shimmer"
      >
        {icon}
      </Flex>
      <Heading fontSize={'xl'}>{title}</Heading>
      <Text color={'gray.600'} align={'left'}>
        {text}
      </Text>
    </Stack>
  );
};

const Home = () => {
  const { connectWallet, isConnected } = useWallet();
  const { prices } = usePrice();
  const [scrollPosition, setScrollPosition] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showVault, setShowVault] = useState(false);
  
  // Animation timers
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVault(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const goldPrice = (prices['gold'] || { usd: 2450 }).usd;
  const bitcoinPrice = (prices['bitcoin'] || { usd: 65000 }).usd;
  const maticPrice = (prices['algorand'] || { usd: 0.20 }).usd;
  
  return (
    <Box overflow="hidden">
      {/* Hero Section */}
      <Container maxW={'7xl'} ref={heroRef}>
        <Stack
          align={'center'}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: 'column', md: 'row' }}
          position="relative"
        >
          {/* Removed gold-wave background box */}
          
          <Stack flex={1} spacing={{ base: 6, md: 12 }} zIndex="1">
            <Box textAlign={{ base: 'center', md: 'left' }}>
              <Heading
                lineHeight={1.1}
                fontWeight={700}
                fontSize={{ base: '4xl', sm: '5xl', lg: '7xl' }}
                mb={4}
                className="hero-title"
              >
                <Text
                  as={'span'}
                  position={'relative'}
                  display="inline-block"
                  className="hero-highlight"
                >
                  Digital Gold,
                </Text>
                <br />
                <Text 
                  as={'span'} 
                  className="gold-text hero-glow"
                  display="inline-block"
                  position="relative"
                >
                  Real Value
                </Text>
              </Heading>
              
              <Text 
                color={'gray.300'} 
                fontSize={{ base: 'lg', md: 'xl' }}
                lineHeight={1.6}
                maxW={{ base: '100%', md: '90%' }}
                className="slide-in-up hero-description"
                fontWeight={400}
              >
                GoldChain makes gold accessible to everyone. Buy, lend, and borrow digital gold (vGold) backed by real physical gold reserves.
                <br />
                <Text as="span" color="gold.300" fontWeight={500}>
                  Experience all the benefits of gold ownership without the hassle of storage and security.
                </Text>
              </Text>
            </Box>
            
            <HStack wrap="wrap" spacing={4}>
              <Badge colorScheme="green" p={2} borderRadius="full" className="floating" fontSize="sm">
                <HStack>
                  <Icon as={FaLock} />
                  <Text>100% Backed by Physical Gold</Text>
                </HStack>
              </Badge>
              
              <Badge colorScheme="purple" p={2} borderRadius="full" className="floating" style={{ animationDelay: '0.5s' }} fontSize="sm">
                <HStack>
                  <Icon as={FaEthereum} />
                  <Text>Algorand Network</Text>
                </HStack>
              </Badge>
              
              <Badge colorScheme="blue" p={2} borderRadius="full" className="floating" style={{ animationDelay: '1s' }} fontSize="sm">
                <HStack>
                  <Icon as={FaUniversity} />
                  <Text>Audited & Secure</Text>
                </HStack>
              </Badge>
            </HStack>
            
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: 'column', sm: 'row' }}
            >
              {isConnected ? (
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'normal'}
                  px={6}
                  colorScheme={'gold'}
                  bg={'gold.500'}
                  _hover={{ bg: 'gold.400' }}
                  className="gold-bar-shine"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  rounded={'full'}
                  size={'lg'}
                  fontWeight={'normal'}
                  px={6}
                  colorScheme={'gold'}
                  bg={'gold.500'}
                  _hover={{ bg: 'gold.400' }}
                  onClick={() => connectWallet('pera')}
                  className="gold-bar-shine"
                >
                  Connect Wallet
                </Button>
              )}
              <Button
                as={RouterLink}
                to="/buy"
                rounded={'full'}
                size={'lg'}
                fontWeight={'normal'}
                px={6}
                leftIcon={<FaCoins />}
                variant="outline"
                color={'goldRoyal.400'}
                borderColor={'goldRoyal.400'}
                _hover={{ bg: 'goldRoyal.50' }}
                className="shimmer"
              >
                Buy vGold
              </Button>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify={'center'}
            align={'center'}
            position={'relative'}
            w={'full'}
            zIndex="1"
          >
            <ScaleFade initialScale={0.8} in={showVault}>
              <Box
                position={'relative'}
                height={'350px'}
                rounded={'2xl'}
                boxShadow={'2xl'}
                width={'full'}
                overflow={'hidden'}
                className="vault-door"
                bg={useColorModeValue('white', 'gray.700')}
                style={{
                  transform: `translateY(${scrollPosition * -0.05}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <Image
                  alt={'Secure vault with gold assets and Algorand Pera branding'}
                  fit={'contain'}
                  align={'center'}
                  w={'100%'}
                  h={'100%'}
                  src={goldVaultImg}
                  className="gold-stack"
                />
              </Box>
            </ScaleFade>
          </Flex>
        </Stack>
      </Container>

      {/* Live Price Ticker */}
      <Box 
        bg="gold.500" 
        py={2} 
        color="white"
        overflow="hidden"
        position="relative"
      >
        <Box className="price-ticker">
          <HStack spacing={10} px={10}>
            <HStack>
              <FaCoins />
              <Text fontWeight="bold">Gold: ${goldPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaEthereum} />
              <Text fontWeight="bold">ALGO: ${maticPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCoins} />
              <Text fontWeight="bold">Bitcoin: ${bitcoinPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <FaCoins />
              <Text fontWeight="bold">Gold: ${goldPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaEthereum} />
              <Text fontWeight="bold">ALGO: ${maticPrice.toFixed(2)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCoins} />
              <Text fontWeight="bold">Bitcoin: ${bitcoinPrice.toFixed(2)}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box bg={useColorModeValue('gold.50', 'gray.900')} py={10}>
        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
            <Stat className="slide-in-up gold-bar-shine">
              <StatLabel>Active Users</StatLabel>
              <StatNumber className="gold-text">10,200+</StatNumber>
              <StatHelpText>Global investors</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.1s' }}>
              <StatLabel>vGold in Circulation</StatLabel>
              <StatNumber className="gold-text">124,000</StatNumber>
              <StatHelpText>Worth of digital gold</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.2s' }}>
              <StatLabel>APY on Lending</StatLabel>
              <StatNumber className="gold-text">6.2%</StatNumber>
              <StatHelpText>Average return</StatHelpText>
            </Stat>
            <Stat className="slide-in-up gold-bar-shine" style={{ animationDelay: '0.3s' }}>
              <StatLabel>Physical Gold Backing</StatLabel>
              <StatNumber className="gold-text">100%</StatNumber>
              <StatHelpText>Security guaranteed</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxW={'7xl'} py={16}>
        <VStack spacing={12}>
          <Box textAlign="center" maxW="container.md" mx="auto">
            <Heading as="h2" size="xl" mb={4} className="gold-text">
              Why Choose GoldChain?
            </Heading>
            <Text color="gray.600">
              GoldChain is revolutionizing the way you invest in gold by combining the stability of precious metals with the flexibility of blockchain technology.
            </Text>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
            <Feature
              icon={<Icon as={FaCoins} w={10} h={10} />}
              title={'Tokenized Gold'}
              text={'Each vGold token is backed by real, physical gold stored in secure vaults and regularly audited.'}
              delay={0}
            />
            <Feature
              icon={<Icon as={FaHandHoldingUsd} w={10} h={10} />}
              title={'Earn Interest'}
              text={'Lend your vGold and earn attractive interest rates, turning your idle gold into a productive asset.'}
              delay={0.1}
            />
            <Feature
              icon={<Icon as={FaWallet} w={10} h={10} />}
              title={'Instant Liquidity'}
              text={'Convert your vGold to ALGO or other cryptocurrencies instantly, 24/7, without traditional market restrictions.'}
              delay={0.2}
            />
            <Feature
              icon={<Icon as={FaShieldAlt} w={10} h={10} />}
              title={'Secure & Insured'}
              text={'Your physical gold is stored in high-security vaults and fully insured against theft or loss.'}
              delay={0.3}
            />
            <Feature
              icon={<Icon as={FaChartLine} w={10} h={10} />}
              title={'Portfolio Diversification'}
              text={'Reduce overall risk in your investment portfolio with gold, a proven store of value for thousands of years.'}
              delay={0.4}
            />
            <Feature
              icon={<Icon as={FaSyncAlt} w={10} h={10} />}
              title={'Smart Contracts'}
              text={'All transactions are executed through transparent, audited smart contracts on the Algorand blockchain.'}
              delay={0.5}
            />
          </SimpleGrid>
          
          <Button
            as={RouterLink}
            to="/buy"
            rounded={'full'}
            px={6}
            py={3}
            colorScheme={'goldRoyal'}
            bg={'goldRoyal.300'}
            _hover={{ bg: 'goldRoyal.400' }}
            variant="solid"
            size="lg"
            rightIcon={<FaArrowRight />}
            className="gold-bar-shine"
          >
            Start Investing Now
          </Button>
        </VStack>
      </Container>

      {/* Call to action */}
      <Box bg="gold.500" color="white" py={16} className="gold-wave">
        <Container maxW={'3xl'} textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to secure your financial future with gold?
          </Heading>
          <Text fontSize="lg" mb={8}>
            Join thousands of investors who trust GoldChain for their gold investments. Get started in minutes.
          </Text>
          <HStack spacing={4} justify="center" wrap="wrap">
            <Button
              as={RouterLink}
              to={isConnected ? "/dashboard" : "#"}
              onClick={isConnected ? undefined : () => connectWallet('pera')}
              bg="white"
              color="gold.500"
              _hover={{ bg: 'gray.100' }}
              size="lg"
              className="glow"
            >
              {isConnected ? 'Go to Dashboard' : 'Connect Wallet'}
            </Button>
            <Button
              as={RouterLink}
              to="/buy"
              variant="outline"
              borderColor="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              size="lg"
              leftIcon={<FaCoins />}
              className="shimmer"
            >
              Buy vGold
            </Button>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;

export const Blob = (props: IconProps) => {
  return (
    <Icon
      width={'100%'}
      viewBox="0 0 578 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M239.184 439.443c-55.13-5.419-110.241-21.365-151.074-58.767C42.307 338.722-7.478 282.729.938 221.217c8.433-61.644 78.896-91.048 126.871-130.712 34.337-28.388 70.198-51.348 112.004-66.78C282.34 8.024 325.382-3.369 370.518.904c54.019 5.115 112.774 10.886 150.881 49.482 39.916 40.427 49.421 100.753 53.385 157.402 4.13 59.015 11.255 128.44-30.444 170.44-41.383 41.683-111.6 19.106-169.213 30.663-46.68 9.364-88.56 35.21-135.943 30.551z"
        fill="currentColor"
      />
    </Icon>
  );
};