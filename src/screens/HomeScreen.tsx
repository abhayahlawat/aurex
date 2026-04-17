import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const SNAP_INTERVAL = (width - 64) + 16; // Card width + margin
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderSkeleton } from '../components/LoaderSkeleton';
import { MetalCard } from '../components/MetalCard';
import { QuickStats } from '../components/QuickStats';
import { useTheme } from '../context/ThemeContext';
import { getLivePrice, LivePriceData } from '../services/goldApi';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';

import { PortfolioCard } from '../components/PortfolioCard';

const METALS = [
  { id: 'XAU', name: 'Gold', icon: 'cube' },
  { id: 'XAG', name: 'Silver', icon: 'cube-outline' },
  { id: 'XPT', name: 'Platinum', icon: 'diamond' },
];

const MOCK_PORTFOLIO = [
  { metalId: 'XAU', metalName: 'Gold', investedAmount: 500000, currentValue: 565000, investorName: 'Abhay Ahlawat' },
  { metalId: 'XAG', metalName: 'Silver', investedAmount: 120000, currentValue: 115000, investorName: 'Abhay Ahlawat' },
  { metalId: 'XPT', metalName: 'Platinum', investedAmount: 200000, currentValue: 210000, investorName: 'Abhay Ahlawat' }
];

export const HomeScreen = ({ navigation }: any) => {
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<Record<string, LivePriceData>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const toggleRef = useRef<View>(null);
  const rotation = useSharedValue(isDark ? 1 : 0);

  // Remove the useEffect that was syncing with isDark to avoid double animation
  // (We now trigger it directly in handleToggle)

  const animatedIconStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const handleToggle = () => {
    const nextValue = isDark ? 0 : 1;
    // Morph icon FIRST
    rotation.value = withTiming(nextValue, { 
      duration: 750, 
      easing: Easing.bezier(0.4, 0, 0.2, 1) 
    });

    // Trigger theme ripple after morph is halfway (300ms delay)
    setTimeout(() => {
      if (toggleRef.current) {
        toggleRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          const centerX = pageX + width / 2;
          const centerY = pageY + height / 2;
          toggleTheme(centerX, centerY);
        });
      } else {
        toggleTheme();
      }
    }, 300);
  };

  const sunStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotation.value, [0, 1], [1, 0]);
    const scale = interpolate(rotation.value, [0, 1], [1, 0.4]);
    return {
      opacity,
      transform: [{ scale }, { rotate: `${rotation.value * 90}deg` }],
      position: 'absolute',
    };
  });

  const moonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotation.value, [0, 1], [0, 1]);
    const scale = interpolate(rotation.value, [0, 1], [0.4, 1]);
    return {
      opacity,
      transform: [{ scale }, { rotate: `${(rotation.value - 1) * 90}deg` }],
    };
  });

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    if (index !== activeCardIndex) {
      setActiveCardIndex(index);
    }
  };

  const fetchData = async () => {
    setError(null);
    try {
      const results = await Promise.all(
        METALS.map((m) => getLivePrice(m.id, 'INR'))
      );

      const newData: Record<string, LivePriceData> = {};
      results.forEach((res, index) => {
        newData[METALS[index].id] = res;
      });
      setData(newData);
    } catch (err: any) {
      console.error('Fetch failed:', err.message);
      setError(err.message ?? 'Failed to load prices.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Aurex</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Premium precious assets tracking</Text>
          </View>
          <TouchableOpacity 
            ref={toggleRef}
            onPress={handleToggle} 
            activeOpacity={0.6} 
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View style={sunStyle}>
              <Ionicons name="sunny-outline" size={26} color={colors.textPrimary} />
            </Animated.View>
            <Animated.View style={moonStyle}>
              <Ionicons name="moon-outline" size={26} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.negative + '18', borderColor: colors.negative + '40' }]}>
          <Ionicons name="warning-outline" size={16} color={colors.negative} />
          <Text style={[styles.errorText, { color: colors.negative }]} numberOfLines={2}>{error}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        <View style={styles.portfolioContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.portfolioScroll}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {MOCK_PORTFOLIO.map((p, i) => (
              <PortfolioCard
                key={i}
                metalId={p.metalId}
                metalName={p.metalName}
                investedAmount={p.investedAmount}
                currentValue={p.currentValue}
                investorName={p.investorName}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.paginationContainer}>
          {MOCK_PORTFOLIO.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { backgroundColor: i === activeCardIndex ? colors.accent : colors.textSecondary },
                i === activeCardIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>

        <View style={styles.listContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, paddingHorizontal: 24, marginBottom: 12 }]}>Live Assets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
            {loading ? (
              // Shimmer state
              METALS.map(m => (
                <View key={m.id} style={styles.skeletonWrapper}>
                  <LoaderSkeleton width={200} height={110} borderRadius={20} />
                </View>
              ))
            ) : (
              // Real Data State
              METALS.map(m => {
                const item = data[m.id];
                if (!item) return null;
                return (
                  <MetalCard
                    key={m.id}
                    id={m.id}
                    name={m.name}
                    icon={m.icon as any}
                    price={item.price}
                    changePercent={item.chp}
                    onPress={() => navigation.navigate('Detail', { metalData: item, metalInfo: m })}
                  />
                );
              })
            )}
          </ScrollView>
        </View>

        {!loading && Object.keys(data).length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <QuickStats data={data} />
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  portfolioContainer: {
    marginBottom: 16,
  },
  portfolioScroll: {
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    opacity: 0.3,
  },
  activeDot: {
    width: 18,
    opacity: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listContainer: {
    marginBottom: 20,
  },
  listScroll: {
    paddingHorizontal: 24,
  },
  skeletonWrapper: {
    marginRight: 16,
  },
});
