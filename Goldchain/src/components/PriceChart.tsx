import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  symbol: string;
  data?: PriceData[];
  isLoading?: boolean;
  error?: string;
  onTimeframeChange?: (timeframe: string) => void;
  showAnalytics?: boolean;
  analytics?: {
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    priceChange7d: number;
    priceChangePercent7d: number;
    volatility7d: number;
    supportLevel: number;
    resistanceLevel: number;
  };
}

const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data = [],
  isLoading = false,
  error,
  onTimeframeChange,
  showAnalytics = true,
  analytics,
}) => {
  const [timeframe, setTimeframe] = useState('7d');
  const [hoveredPoint, setHoveredPoint] = useState<PriceData | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const chartBg = useColorModeValue('gray.50', 'gray.900');

  const timeframes = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
  ];

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getPriceColor = (change: number) => {
    if (change > 0) return 'green.500';
    if (change < 0) return 'red.500';
    return 'gray.500';
  };

  const getPriceIcon = (change: number) => {
    if (change > 0) return FaArrowUp;
    if (change < 0) return FaArrowDown;
    return FaChartLine;
  };

  // Simple chart rendering (in a real app, you'd use a proper charting library like Chart.js or Recharts)
  const renderSimpleChart = () => {
    if (data.length === 0) return null;

    const maxPrice = Math.max(...data.map(d => d.price));
    const minPrice = Math.min(...data.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1; // 10% padding

    const chartWidth = 400;
    const chartHeight = 200;

    return (
      <Box
        width="100%"
        height={chartHeight}
        bg={chartBg}
        borderRadius="md"
        p={4}
        position="relative"
        overflow="hidden"
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {data.map((point, index) => {
            if (index === 0) return null;
            
            const prevPoint = data[index - 1];
            const x1 = (index - 1) * (chartWidth / (data.length - 1));
            const y1 = chartHeight - ((prevPoint.price - minPrice + padding) / (priceRange + padding * 2)) * chartHeight;
            const x2 = index * (chartWidth / (data.length - 1));
            const y2 = chartHeight - ((point.price - minPrice + padding) / (priceRange + padding * 2)) * chartHeight;
            
            const isPositive = point.price >= prevPoint.price;
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isPositive ? '#38A169' : '#E53E3E'}
                strokeWidth="2"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
          
          {/* Hover point */}
          {hoveredPoint && (
            <circle
              cx={data.indexOf(hoveredPoint) * (chartWidth / (data.length - 1))}
              cy={chartHeight - ((hoveredPoint.price - minPrice + padding) / (priceRange + padding * 2)) * chartHeight}
              r="4"
              fill="gold.500"
              stroke="white"
              strokeWidth="2"
            />
          )}
        </svg>
        
        {/* Price labels */}
        <Box position="absolute" top={2} left={4}>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            {formatPrice(maxPrice)}
          </Text>
        </Box>
        <Box position="absolute" bottom={2} left={4}>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            {formatPrice(minPrice)}
          </Text>
        </Box>
        
        {/* Hover tooltip */}
        {hoveredPoint && (
          <Box
            position="absolute"
            top={4}
            right={4}
            bg={bgColor}
            p={2}
            borderRadius="md"
            boxShadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <Text fontSize="sm" fontWeight="bold">
              {formatPrice(hoveredPoint.price)}
            </Text>
            <Text fontSize="xs" color={textColor}>
              {formatDate(hoveredPoint.timestamp)}
            </Text>
            <Text fontSize="xs" color={textColor}>
              {formatTime(hoveredPoint.timestamp)}
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={6}
      boxShadow="md"
      border="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">
              {symbol} Price Chart
            </Text>
            {analytics && (
              <Badge colorScheme="gold" borderRadius="full">
                Live
              </Badge>
            )}
          </HStack>
          
          {/* Timeframe selector */}
          <ButtonGroup size="sm" isAttached>
            {timeframes.map((tf) => (
              <Button
                key={tf.key}
                variant={timeframe === tf.key ? 'solid' : 'outline'}
                colorScheme={timeframe === tf.key ? 'gold' : 'gray'}
                onClick={() => handleTimeframeChange(tf.key)}
              >
                {tf.label}
              </Button>
            ))}
          </ButtonGroup>
        </HStack>

        {/* Chart */}
        {isLoading ? (
          <Center h="200px">
            <VStack>
              <Spinner size="lg" color="gold.500" />
              <Text color={textColor}>Loading chart data...</Text>
            </VStack>
          </Center>
        ) : (
          renderSimpleChart()
        )}

        {/* Analytics */}
        {showAnalytics && analytics && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={3}>
              Price Analytics
            </Text>
            <HStack spacing={4} wrap="wrap">
              <Stat size="sm">
                <StatLabel>Current Price</StatLabel>
                <StatNumber fontSize="lg">
                  ${formatPrice(analytics.currentPrice)}
                </StatNumber>
              </Stat>
              
              <Stat size="sm">
                <StatLabel>24H Change</StatLabel>
                <StatNumber fontSize="lg" color={getPriceColor(analytics.priceChangePercent24h)}>
                  <StatArrow type={analytics.priceChangePercent24h >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(analytics.priceChangePercent24h).toFixed(2)}%
                </StatNumber>
                <StatHelpText>
                  ${formatPrice(Math.abs(analytics.priceChange24h))}
                </StatHelpText>
              </Stat>
              
              <Stat size="sm">
                <StatLabel>7D Change</StatLabel>
                <StatNumber fontSize="lg" color={getPriceColor(analytics.priceChangePercent7d)}>
                  <StatArrow type={analytics.priceChangePercent7d >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(analytics.priceChangePercent7d).toFixed(2)}%
                </StatNumber>
                <StatHelpText>
                  ${formatPrice(Math.abs(analytics.priceChange7d))}
                </StatHelpText>
              </Stat>
              
              <Stat size="sm">
                <StatLabel>Volatility (7D)</StatLabel>
                <StatNumber fontSize="lg">
                  {analytics.volatility7d.toFixed(2)}%
                </StatNumber>
              </Stat>
            </HStack>
            
            {/* Support/Resistance */}
            <HStack spacing={4} mt={4}>
              <Tooltip label="Lowest price in the selected period">
                <Badge colorScheme="green" p={2} borderRadius="md">
                  <HStack>
                    <Text>Support:</Text>
                    <Text fontWeight="bold">${formatPrice(analytics.supportLevel)}</Text>
                  </HStack>
                </Badge>
              </Tooltip>
              
              <Tooltip label="Highest price in the selected period">
                <Badge colorScheme="red" p={2} borderRadius="md">
                  <HStack>
                    <Text>Resistance:</Text>
                    <Text fontWeight="bold">${formatPrice(analytics.resistanceLevel)}</Text>
                  </HStack>
                </Badge>
              </Tooltip>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PriceChart;
