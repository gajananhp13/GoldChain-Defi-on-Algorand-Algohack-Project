import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    gold: {
      50: '#FFF8E1',
      100: '#FFECB3',
      200: '#FFE082',
      300: '#FFD54F',
      400: '#FFCA28',
      500: '#FFC107',
      600: '#FFA000',
      700: '#FF8F00',
      800: '#FF6F00',
      900: '#E65100',
    },
    algoteal: {
      50: '#E0F7F5',
      100: '#B2ECE7',
      200: '#80E0D8',
      300: '#4ED3C9',
      400: '#26C8BD',
      500: '#00BDB1',
      600: '#00A79D',
      700: '#009089',
      800: '#007A75',
      900: '#00544F',
    },
    gray: {
      900: '#0F1115',
      800: '#171923',
    },
  },
  fonts: {
    heading: 'Montserrat, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
      a: {
        color: 'algoteal.300',
      },
      '.card-hover': {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        _hover: { transform: 'translateY(-2px)', boxShadow: 'lg' },
      },
      // Ensure all text is visible
      '*': {
        color: 'inherit',
      },
      // Fix text visibility in cards and modals
      '.chakra-ui-light': {
        '*': {
          color: 'gray.800 !important',
        },
      },
      '.chakra-ui-dark': {
        '*': {
          color: 'white !important',
        },
      },
    },
  },
  components: {
    Button: {
      variants: {
        gold: {
          bg: 'gold.500',
          color: 'black',
          _hover: { bg: 'gold.400' },
          _active: { bg: 'gold.600' },
        },
        algoteal: {
          bg: 'algoteal.500',
          color: 'white',
          _hover: { bg: 'algoteal.400' },
          _active: { bg: 'algoteal.600' },
        },
      },
    },
    Badge: {
      variants: {
        shimmer: {
          position: 'relative',
          overflow: 'hidden',
          _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)',
            animation: 'shimmer 2s infinite',
          },
        },
      },
    },
  },
});

export default theme; 