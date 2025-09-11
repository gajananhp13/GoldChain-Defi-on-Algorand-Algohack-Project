import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Box,
  Flex,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Image,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Buy from './pages/Buy';
import Lend from './pages/Lend';
import Borrow from './pages/Borrow';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';
import { WalletProvider } from './context/WalletContext';
import { GoldProvider } from './context/GoldContext';
import PriceProvider from './context/PriceContext';
import { LanguageProvider } from './context/LanguageContext';
import { FaExclamationTriangle } from 'react-icons/fa';
import './assets/animations.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('goldchain_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleInstallPera = () => {
    window.open('https://perawallet.app', '_blank');
    onClose();
  };

  return (
    <LanguageProvider>
      <WalletProvider>
        <GoldProvider>
          <PriceProvider>
            <Router>
            <Flex direction="column" minH="100vh">
              <Header />
              <Box flex="1" className="fade-in">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/buy" element={<Buy />} />
                  <Route path="/lend" element={<Lend />} />
                  <Route path="/borrow" element={<Borrow />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/login" element={<Login setUser={setUser} />} />
                  <Route path="/register" element={<Register setUser={setUser} />} />
                </Routes>
              </Box>
              <Footer />
            </Flex>
          </Router>

          {/* Wallet Info / Install Prompt (Algorand) */}
          <AlertDialog
            isOpen={isOpen && walletDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent className="slide-in-up gold-wave">
                <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center">
                  <Icon as={FaExclamationTriangle} mr={2} color="orange.500" />
                  Algorand Wallet
                </AlertDialogHeader>

                <AlertDialogBody>
                  <Text mb={4}>
                    GoldChain works best with an Algorand wallet. You can install Pera Wallet here:
                  </Text>
                  
                  <Flex direction="column" gap={4}>
                    <Box 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      className="card-hover" 
                      cursor="pointer"
                      onClick={handleInstallPera}
                    >
                      <HStack>
                        <Image 
                          src="https://perawallet.app/icons/icon-192x192.png" 
                          boxSize="40px" 
                          alt="Pera Wallet" 
                        />
                        <Box>
                          <Text fontWeight="bold">Pera Wallet</Text>
                          <Text fontSize="sm">Connect to Algorand Network</Text>
                        </Box>
                      </HStack>
                    </Box>
                  </Flex>
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose} variant="outline">
                    Not Now
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          </PriceProvider>
        </GoldProvider>
      </WalletProvider>
    </LanguageProvider>
  );
}

export default App;
