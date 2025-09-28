import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Image,
  useToast,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { FaCoins, FaWallet } from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';

interface NavbarProps {
  user: {
    id: string;
    role: 'user' | 'storekeeper';
    email: string;
    isConnected: boolean;
  } | null;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const Navbar = ({ user, setUser }: NavbarProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const { account, balance, isConnected, connectWallet, disconnectWallet, walletType } = useWallet();
  const { vGoldBalance } = useGold();
  const location = useLocation();
  const { isOpen: isWalletModalOpen, onOpen: openWalletModal, onClose: closeWalletModal } = useDisclosure();
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const toast = useToast();

  const handleLogout = () => {
    // Remove user from localStorage
    localStorage.removeItem('goldchain_user');
    // Disconnect wallet
    disconnectWallet();
    // Update state
    setUser(null);
  };

  const handleWalletSelect = async (walletType: 'pera' | 'myalgo') => {
    setSelectedWallet(walletType);
    setConnecting(true);
    
    try {
      const result = await connectWallet(walletType);
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${result}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
      closeWalletModal();
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Could not connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const formatBalance = (balance: number | string) => {
    if (typeof balance === 'string') {
      balance = parseFloat(balance);
    }
    return balance.toFixed(4);
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Link as={RouterLink} to="/">
            <HStack spacing={2}>
              <FaCoins className="spinning-coin" color="#FFC300" size={24} />
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                fontWeight="bold"
                color={useColorModeValue('gray.800', 'white')}
                fontSize="xl"
              >
                GoldChain
              </Text>
            </HStack>
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav user={user} currentPath={location.pathname} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {isConnected && account ? (
            <HStack spacing={4}>
              <Box 
                py={1} 
                px={3} 
                rounded="md" 
                bg="gold.50"
                display={{ base: 'none', md: 'flex' }}
              >
                <Flex align="center" gap={2}>
                  <FaCoins color="#FFC300" />
                  <Text fontWeight="medium" className="balance-animation">
                    {formatBalance(vGoldBalance)} vGold
                  </Text>
                </Flex>
              </Box>
              
              <Box 
                py={1} 
                px={3} 
                rounded="md" 
                bg="purple.50"
                display={{ base: 'none', md: 'flex' }}
              >
                <Flex align="center" gap={2}>
                  <FaWallet color="#805AD5" />
                  <Text fontWeight="medium">
                    {formatBalance(balance)} ALGO
                  </Text>
                </Flex>
              </Box>
              
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    src={`https://avatars.dicebear.com/api/identicon/${account}.svg`}
                  />
                </MenuButton>
                <MenuList>
                  {user && (
                    <>
                      <MenuItem as={RouterLink} to="/dashboard">Dashboard</MenuItem>
                      <MenuItem as={RouterLink} to="/portfolio">My Portfolio</MenuItem>
                      <MenuItem as={RouterLink} to="/transactions">Transactions</MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <>
              {!user ? (
                <>
                  <Button
                    as={RouterLink}
                    fontSize={'sm'}
                    fontWeight={400}
                    variant={'link'}
                    to={'/login'}
                  >
                    Sign In
                  </Button>
                  <Button
                    as={RouterLink}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'gold.500'}
                    to={'/register'}
                    _hover={{
                      bg: 'gold.400',
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button
                  onClick={openWalletModal}
                  display={'inline-flex'}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'purple.500'}
                  _hover={{
                    bg: 'purple.400',
                  }}
                  leftIcon={<FaWallet />}
                >
                  Connect Wallet
                </Button>
              )}
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav user={user} />
      </Collapse>

      <Modal isOpen={isWalletModalOpen} onClose={closeWalletModal} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" className="gold-wave">
          <ModalHeader>Connect Your Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                onClick={() => handleWalletSelect('pera')}
                className="card-hover"
                bg="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
              >
                <HStack>
                  <Image 
                    src="/peralogo.png" 
                    fallbackSrc="/peralogo.png"
                    boxSize="50px" 
                    alt="Pera Wallet" 
                  />
                  <Box>
                    <Text fontWeight="bold">Pera Wallet</Text>
                    <Text fontSize="sm">The official Algorand wallet</Text>
                  </Box>
                </HStack>
                {connecting && selectedWallet === 'pera' && (
                  <Flex
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(255, 255, 255, 0.8)"
                    justify="center"
                    align="center"
                  >
                    <Text>Connecting...</Text>
                  </Flex>
                )}
              </Box>
              
              <Box 
                p={4} 
                borderWidth="1px"
                borderRadius="md" 
                onClick={() => handleWalletSelect('myalgo')}
                className="card-hover"
                bg="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
              >
                <HStack>
                  <Image 
                    src="https://myalgo.com/assets/images/my-algo-logo-black.svg" 
                    fallbackSrc="/peralogo.png"
                    boxSize="50px" 
                    alt="MyAlgo Wallet" 
                  />
                  <Box>
                    <Text fontWeight="bold">MyAlgo Wallet</Text>
                    <Text fontSize="sm">A secure wallet for the Algorand ecosystem</Text>
                  </Box>
                </HStack>
                {connecting && selectedWallet === 'myalgo' && (
                  <Flex
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(255, 255, 255, 0.8)"
                    justify="center"
                    align="center"
                  >
                    <Text>Connecting...</Text>
                  </Flex>
                )}
              </Box>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                By connecting your wallet, you agree to the Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const DesktopNav = ({ user, currentPath }: { user: any; currentPath: string }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  
  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.filter(navItem => !navItem.requiresAuth || (navItem.requiresAuth && user)).map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                p={2}
                as={RouterLink}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={isActive(navItem.href || '') ? 'gold.500' : linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {isActive(navItem.href || '') && (
                  <Box 
                    position="absolute" 
                    bottom="0" 
                    left="50%" 
                    transform="translateX(-50%)" 
                    height="2px" 
                    width="50%" 
                    bg="gold.500" 
                    borderRadius="full"
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={RouterLink}
      to={href ?? '#'}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('gold.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'gold.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'gold.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ user }: { user: any }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.filter(navItem => !navItem.requiresAuth || (navItem.requiresAuth && user)).map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} as={RouterLink} to={child.href ?? '#'}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
  requiresAuth?: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    requiresAuth: true,
  },
  {
    label: 'Buy & Sell',
    href: '/buy',
    requiresAuth: true,
  },
  {
    label: 'Lend',
    href: '/lend',
    requiresAuth: true,
  },
  {
    label: 'Borrow',
    href: '/borrow',
    requiresAuth: true,
  },
];

export default Navbar;