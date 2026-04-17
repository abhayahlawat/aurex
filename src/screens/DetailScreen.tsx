import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CandlestickChart } from '../components/CandlestickChart';
import { LoaderSkeleton } from '../components/LoaderSkeleton';
import { StatCard } from '../components/StatCard';
import { useTheme } from '../context/ThemeContext';
import { getExchangeRate, getHistoricalMockData, getHistoricalOHLCMockData, LivePriceData } from '../services/goldApi';

const { width } = Dimensions.get('window');

type Currency = 'INR' | 'USD';
type ChartType = 'line' | 'candle';

const formatCurrency = (value: number, currency: Currency, decimals = 0, rate = 84.0) => {
  const amt = currency === 'USD' ? value / rate : value;
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amt);
};

const perGram = (ozPrice: number) => ozPrice / 31.1035;

// Normalize timestamp: goldapi.io returns seconds, JS needs milliseconds
const normalizeTimestamp = (ts: number): number => {
  // If timestamp is less than year 2001 in ms, it's likely in seconds
  return ts < 1e12 ? ts * 1000 : ts;
};

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(normalizeTimestamp(timestamp)));
};

export const DetailScreen = ({ route, navigation }: any) => {
  const { metalData, metalInfo } = route.params as { metalData: LivePriceData; metalInfo: any };
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [currency, setCurrency] = useState<Currency>('INR');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [exchangeRate, setExchangeRate] = useState<number>(84.0); // fallback
  const [rateLoading, setRateLoading] = useState(false);

  const [lineData] = useState(() => getHistoricalMockData(metalData.price, 7));
  const [ohlcData] = useState(() => getHistoricalOHLCMockData(metalData.price, 7));

  // Fetch real exchange rate on mount
  useEffect(() => {
    setRateLoading(true);
    getExchangeRate().then((rate) => {
      setExchangeRate(rate);
      setRateLoading(false);
    }).catch(() => {
      setRateLoading(false);
    });
  }, []);

  const isPositive = metalData.chp >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const iconName = isPositive ? 'trending-up' : 'trending-down';

  // Convert chart data based on currency
  const chartLineData = currency === 'USD' ? lineData.map((v) => v / exchangeRate) : lineData;
  const chartOhlcData =
    currency === 'USD'
      ? ohlcData.map((d) => ({
        ...d,
        open: d.open / exchangeRate,
        high: d.high / exchangeRate,
        low: d.low / exchangeRate,
        close: d.close / exchangeRate,
      }))
      : ohlcData;

  const fmt = (value: number, dec = 0) => formatCurrency(value, currency, dec, exchangeRate);

  const getMetalColor = () => {
    switch (metalInfo.id) {
      case 'XAU': return 'gold';
      case 'XAG': return 'silver';
      case 'XPT': return 'platinum';
      default: return 'gold';
    }
  };
  const metalColor = getMetalColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{metalInfo.name}</Text>

        {/* INR / USD Toggle */}
        <View style={[styles.currencyToggle, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => setCurrency('INR')}
            style={[
              styles.currencyBtn,
              currency === 'INR' && { backgroundColor: colors.accent },
            ]}
          >
            <Text style={[styles.currencyBtnText, { color: currency === 'INR' ? '#fff' : colors.textSecondary }]}>₹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrency('USD')}
            style={[
              styles.currencyBtn,
              currency === 'USD' && { backgroundColor: colors.accent },
            ]}
          >
            <Text style={[styles.currencyBtnText, { color: currency === 'USD' ? '#fff' : colors.textSecondary }]}>$</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Price Hero */}
        <View style={styles.priceSection}>
          <Text style={[styles.metalName, { color: colors.textSecondary }]}>{metalInfo.name} / {currency}</Text>
          {currency === 'USD' && rateLoading ? (
            <View style={{ marginVertical: 8 }}>
              <LoaderSkeleton width={200} height={48} borderRadius={8} />
            </View>
          ) : (
            <Text style={[styles.mainPrice, { color: colors.textPrimary }]}>{fmt(metalData.price)}</Text>
          )}

          <View style={styles.changeRow}>
            {currency === 'USD' && rateLoading ? (
              <LoaderSkeleton width={120} height={20} borderRadius={4} />
            ) : (
              <Text style={[styles.prevPrice, { color: colors.textSecondary }]}>
                Prev: {fmt(metalData.prev_close_price)}
              </Text>
            )}
            <View style={[styles.trendBadge, { backgroundColor: changeColor + '20', marginLeft: 12 }]}>
              <Ionicons name={iconName} size={16} color={changeColor} />
              <Text style={[styles.changeText, { color: changeColor }]}>
                {isPositive ? '+' : ''}
                {metalData.chp.toFixed(2)}%
              </Text>
            </View>
          </View>

          <Text style={[styles.updatedText, { color: colors.textSecondary }]}>
            Last updated: {formatDate(metalData.timestamp)}
          </Text>
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>7 Days Trend</Text>

            {/* Line / Candle Toggle */}
            <View style={[styles.chartToggle, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                onPress={() => setChartType('line')}
                style={[
                  styles.chartToggleBtn,
                  chartType === 'line' && { backgroundColor: colors.accent },
                ]}
              >
                <Ionicons
                  name="analytics-outline"
                  size={16}
                  color={chartType === 'line' ? '#fff' : colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('candle')}
                style={[
                  styles.chartToggleBtn,
                  chartType === 'candle' && { backgroundColor: colors.accent },
                ]}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={16}
                  color={chartType === 'candle' ? '#fff' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {chartType === 'line' ? (
            <LineChart
              data={{
                labels: ['-6d', '-5d', '-4d', '-3d', '-2d', 'yest', 'now'],
                datasets: [
                  {
                    data: chartLineData,
                    color: () => colors.accent,
                    strokeWidth: 3,
                  },
                ],
              }}
              width={width - 48}
              height={220}
              withDots={true}
              withInnerLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: () => colors.accent,
                labelColor: () => colors.textSecondary,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: colors.card,
                },
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          ) : (
            <CandlestickChart data={chartOhlcData} width={width - 48} height={220} />
          )}
        </View>

        {/* Karat / Weight Classification */}
        {metalInfo.id === 'XAU' ? (
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Per Gram Breakdown</Text>
            <View style={styles.bentoGrid}>
              <View style={{ width: '100%', marginBottom: 4 }}>
                <StatCard 
                  label="24K / gram (Pure Gold)" 
                  value={fmt(perGram(metalData.price), 2)} 
                  size="large" 
                  isHero={true}
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCard 
                  label="22K / gram" 
                  value={fmt(perGram(metalData.price) * (22 / 24), 2)} 
                  size="large" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCard 
                  label="18K / gram" 
                  value={fmt(perGram(metalData.price) * (18 / 24), 2)} 
                  size="large" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '32%' }}>
                <StatCard 
                  label="14K" 
                  value={fmt(perGram(metalData.price) * (14 / 24), 2)} 
                  variant="tinted" 
                  size="small" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '32%' }}>
                <StatCard 
                  label="10 Gram" 
                  value={fmt(perGram(metalData.price) * 10)} 
                  variant="tinted" 
                  size="small" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '32%' }}>
                <StatCard 
                  label="24K / oz" 
                  value={fmt(metalData.price)} 
                  variant="tinted" 
                  size="small" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Weight Pricing</Text>
            <View style={styles.bentoGrid}>
              <View style={{ width: '100%', marginBottom: 4 }}>
                <StatCard 
                  label={`1 Gram (${metalInfo.name})`}
                  value={fmt(perGram(metalData.price), 2)} 
                  size="large" 
                  isHero={true}
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCard 
                  label="10 Gram" 
                  value={fmt(perGram(metalData.price) * 10)} 
                  size="large" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '48%' }}>
                <StatCard 
                  label="100 Gram" 
                  value={fmt(perGram(metalData.price) * 100)} 
                  size="large" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
              <View style={{ width: '100%', marginTop: 4 }}>
                <StatCard 
                  label="1 Kilogram Price"
                  value={fmt(perGram(metalData.price) * 1000)} 
                  variant="tinted"
                  size="large" 
                  metal={metalColor}
                  isLoading={currency === 'USD' && rateLoading} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Market Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Market Stats</Text>
          <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Open</Text>
              {rateLoading && currency === 'USD' ? (
                <LoaderSkeleton width={80} height={20} borderRadius={4} />
              ) : (
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{fmt(metalData.open_price)}</Text>
              )}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.textSecondary + '20' }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Prev. Close</Text>
              {rateLoading && currency === 'USD' ? (
                <LoaderSkeleton width={80} height={20} borderRadius={4} />
              ) : (
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{fmt(metalData.prev_close_price)}</Text>
              )}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.textSecondary + '20' }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Day High</Text>
              {rateLoading && currency === 'USD' ? (
                <LoaderSkeleton width={80} height={20} borderRadius={4} />
              ) : (
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{fmt(metalData.high_price)}</Text>
              )}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.textSecondary + '20' }]} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Day Low</Text>
              {rateLoading && currency === 'USD' ? (
                <LoaderSkeleton width={80} height={20} borderRadius={4} />
              ) : (
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{fmt(metalData.low_price)}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  currencyToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  currencyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  priceSection: {
    marginVertical: 24,
    alignItems: 'center',
  },
  metalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mainPrice: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  prevPrice: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  updatedText: {
    fontSize: 12,
  },
  chartContainer: {
    marginVertical: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  chartToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  statsContainer: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
});
