import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { OHLCData } from '../services/goldApi';

interface CandlestickChartProps {
  data: OHLCData[];
  width: number;
  height: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, width, height }) => {
  const { colors } = useTheme();

  if (!data || data.length === 0) return null;

  const padding = { top: 16, bottom: 32, left: 12, right: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find price range across all OHLC data
  const allPrices = data.flatMap((d) => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  // Map price to y-coordinate (inverted — higher price = lower y)
  const priceToY = (price: number) =>
    padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  const candleWidth = Math.min(24, (chartWidth / data.length) * 0.6);
  const gap = chartWidth / data.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: 16 }]}>
      <Svg width={width} height={height}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((frac, idx) => {
          const y = padding.top + chartHeight * frac;
          return (
            <Line
              key={`grid-${idx}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={colors.textSecondary}
              strokeWidth={0.5}
              strokeDasharray="4,4"
              opacity={0.2}
            />
          );
        })}

        {data.map((candle, index) => {
          const x = padding.left + gap * index + gap / 2;
          const isGreen = candle.close >= candle.open;
          const candleColor = isGreen ? colors.positive : colors.negative;

          const bodyTop = priceToY(Math.max(candle.open, candle.close));
          const bodyBottom = priceToY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1); // minimum 1px

          const wickTop = priceToY(candle.high);
          const wickBottom = priceToY(candle.low);

          return (
            <React.Fragment key={index}>
              {/* Wick (high to low line) */}
              <Line
                x1={x}
                y1={wickTop}
                x2={x}
                y2={wickBottom}
                stroke={candleColor}
                strokeWidth={1.5}
              />
              {/* Body (open to close rectangle) */}
              <Rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isGreen ? candleColor : candleColor}
                rx={3}
                ry={3}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* X-axis labels */}
      <View style={[styles.labels, { paddingHorizontal: padding.left }]}>
        {data.map((candle, index) => (
          <Text
            key={index}
            style={[
              styles.label,
              { color: colors.textSecondary, width: gap },
            ]}
          >
            {candle.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  labels: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
