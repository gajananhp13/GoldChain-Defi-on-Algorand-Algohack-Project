import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
  Image,
  HStack,
  Icon,
  Divider,
  VStack
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaGithub, FaDiscord, FaMedium, FaHeart } from 'react-icons/fa';
import logo from '../assets/logo.svg';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text 
      fontWeight={'600'} 
      fontSize={'lg'} 
      mb={4}
      className="footer-header"
      color={useColorModeValue('gray.800', 'white')}
    >
      {children}
    </Text>
  );
};

const FooterLink = ({ children, to, href, ...props }: any) => {
  return (
    <Link
      as={to ? RouterLink : undefined}
      to={to}
      href={href}
      className="footer-link"
      fontSize="sm"
      color={useColorModeValue('gray.600', 'gray.300')}
      _hover={{
        color: 'gold.400',
        transform: 'translateX(4px)',
        textDecoration: 'none'
      }}
      transition="all 0.3s ease"
      {...props}
    >
      {children}
    </Link>
  );
};

const SocialIcon = ({ icon, href, label }: { icon: any, href: string, label: string }) => {
  return (
    <Link 
      href={href} 
      isExternal
      className="social-icon-wrapper"
      aria-label={label}
    >
      <Icon 
        as={icon} 
        className="social-icon" 
        w={5} 
        h={5}
        color={useColorModeValue('gray.600', 'gray.400')}
        _hover={{
          color: 'gold.400',
          transform: 'translateY(-2px) scale(1.1)'
        }}
        transition="all 0.3s ease"
      />
    </Link>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      className="footer-container"
      position="relative"
      overflow="hidden"
    >
      {/* Animated background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(135deg, transparent 0%, rgba(255, 215, 0, 0.02) 50%, transparent 100%)"
        className="footer-bg-animation"
        pointerEvents="none"
      />
      
      <Container as={Stack} maxW={'6xl'} py={12} position="relative" zIndex={1}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 2fr' }}
          spacing={10}
        >
          <VStack spacing={6} align="flex-start" className="footer-brand">
            <Box className="footer-logo">
              <HStack spacing={3}>
                <Image 
                  src={logo} 
                  alt="GoldChain Logo" 
                  height="45px" 
                  className="logo-image"
                />
                <Text
                  fontFamily={'heading'}
                  fontWeight="bold"
                  fontSize="2xl"
                  className="gold-text footer-brand-text"
                >
                  GoldChain
                </Text>
              </HStack>
            </Box>
            <Text 
              fontSize={'md'} 
              lineHeight={1.6}
              color={useColorModeValue('gray.600', 'gray.300')}
              className="footer-description"
            >
              The future of gold investments on the blockchain.
              <br />
              Democratizing access to gold through digital assets.
            </Text>
            <HStack spacing={3} wrap="wrap">
              <Tag 
                size={'md'} 
                variant={'subtle'} 
                colorScheme={'yellow'} 
                className="footer-tag shimmer"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s ease"
              >
                vGold
              </Tag>
              <Tag 
                size={'md'} 
                variant={'subtle'} 
                colorScheme={'purple'}
                className="footer-tag"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s ease"
              >
                Algorand
              </Tag>
              <Tag 
                size={'md'} 
                variant={'subtle'} 
                colorScheme={'blue'}
                className="footer-tag"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.3s ease"
              >
                DeFi
              </Tag>
            </HStack>
            <HStack spacing={4} className="social-links">
              <SocialIcon icon={FaTwitter} href="#" label="Twitter" />
              <SocialIcon icon={FaYoutube} href="#" label="YouTube" />
              <SocialIcon icon={FaInstagram} href="#" label="Instagram" />
              <SocialIcon icon={FaGithub} href="#" label="GitHub" />
              <SocialIcon icon={FaDiscord} href="#" label="Discord" />
              <SocialIcon icon={FaMedium} href="#" label="Medium" />
            </HStack>
          </VStack>
          <VStack align={'flex-start'} spacing={4} className="footer-column">
            <ListHeader>Platform</ListHeader>
            <VStack align={'flex-start'} spacing={3}>
              <FooterLink to={'/dashboard'}>Dashboard</FooterLink>
              <FooterLink to={'/buy'}>Buy vGold</FooterLink>
              <FooterLink to={'/lend'}>Lend</FooterLink>
              <FooterLink to={'/borrow'}>Borrow</FooterLink>
              <FooterLink to={'/portfolio'}>Portfolio</FooterLink>
            </VStack>
          </VStack>
          <VStack align={'flex-start'} spacing={4} className="footer-column">
            <ListHeader>Company</ListHeader>
            <VStack align={'flex-start'} spacing={3}>
              <FooterLink href={'#'}>About</FooterLink>
              <FooterLink href={'#'}>Careers</FooterLink>
              <FooterLink href={'#'}>Contact</FooterLink>
              <FooterLink href={'#'}>Partners</FooterLink>
              <FooterLink href={'#'}>Media Kit</FooterLink>
            </VStack>
          </VStack>
          <VStack align={'flex-start'} spacing={4} className="footer-column">
            <ListHeader>Stay up to date</ListHeader>
            <Text 
              fontSize="sm" 
              lineHeight={1.6}
              color={useColorModeValue('gray.600', 'gray.300')}
              className="footer-newsletter"
            >
              Subscribe to our newsletter to get the latest updates on vGold and promotions.
            </Text>
            <Box className="footer-copyright">
              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                © {new Date().getFullYear()} GoldChain. All rights reserved.
              </Text>
            </Box>
            <Text 
              fontSize="xs" 
              color={useColorModeValue('gray.500', 'gray.500')}
              lineHeight={1.4}
              className="footer-disclaimer"
            >
              Disclaimer: Virtual Gold (vGold) is a digital asset and not a physical commodity. 
              Investment in digital assets involves risks. Please read our terms and conditions.
            </Text>
          </VStack>
        </SimpleGrid>
      </Container>
      
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        className="footer-bottom"
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={6}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Flex wrap="wrap" justify="center" gap={6} className="footer-legal-links">
            <FooterLink href={'#'}>Privacy Policy</FooterLink>
            <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.600')}>•</Text>
            <FooterLink href={'#'}>Terms of Service</FooterLink>
            <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.600')}>•</Text>
            <FooterLink href={'#'}>Cookie Policy</FooterLink>
            <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.600')}>•</Text>
            <FooterLink href={'#'}>FAQ</FooterLink>
          </Flex>
          <HStack spacing={2} className="footer-built-with">
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
              Built with
            </Text>
            <Icon 
              as={FaHeart} 
              color="red.400" 
              className="heart-beat"
              w={4} 
              h={4}
            />
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
              for blockchain innovation
            </Text>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
} 