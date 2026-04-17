import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LivePriceData } from '../services/goldApi';

interface QuickStatsProps {
  data: Record<string, LivePriceData>;
}

const getTrend = (chp: number) => {
  if (chp > 1) return { label: 'Bullish', icon: 'trending-up' as const, positive: true };
  if (chp < -1) return { label: 'Bearish', icon: 'trending-down' as const, positive: false };
  return { label: 'Neutral', icon: 'remove-outline' as const, positive: null };
};

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const QuickStats: React.FC<QuickStatsProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  const gold = data['XAU'];
  const silver = data['XAG'];
  const platinum = data['XPT'];

  const isMarketOpen = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const day = now.getUTCDay();
    // Commodity markets generally open Mon-Fri 01:00–21:00 UTC
    if (day === 0 || day === 6) return false;
    return utcHour >= 1 && utcHour < 21;
  };

  const marketOpen = isMarketOpen();

  const stats = [
    gold && {
      label: "Gold Today's High",
      value: formatINR(gold.high_price ?? gold.price * 1.005),
      chip: 'XAU',
      chipColor: '#F59E0B',
      icon: 'arrow-up-circle-outline' as const,
      positive: true,
    },
    silver && {
      label: 'Silver Trend',
      value: getTrend(silver.chp).label,
      chip: 'XAG',
      chipColor: '#94A3B8',
      icon: getTrend(silver.chp).icon,
      positive: getTrend(silver.chp).positive,
    },
    platinum && {
      label: "Platinum Today's Low",
      value: formatINR(platinum.low_price ?? platinum.price * 0.995),
      chip: 'XPT',
      chipColor: '#A78BFA',
      icon: 'arrow-down-circle-outline' as const,
      positive: false,
    },
    gold && {
      label: 'Gold Change (24h)',
      value: `${gold.chp >= 0 ? '+' : ''}${gold.chp.toFixed(2)}%`,
      chip: 'XAU',
      chipColor: '#F59E0B',
      icon: gold.chp >= 0 ? 'trending-up' as const : 'trending-down' as const,
      positive: gold.chp >= 0,
    },
    {
      label: 'Market Status',
      value: marketOpen ? 'Open' : 'Closed',
      chip: 'MCX',
      chipColor: marketOpen ? '#10B981' : '#EF4444',
      icon: marketOpen ? ('radio-button-on' as const) : ('radio-button-off' as const),
      positive: marketOpen ? true : false,
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    chip: string;
    chipColor: string;
    icon: any;
    positive: boolean | null;
  }[];

  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Quick Stats</Text>
      {stats.map((stat, index) => {
        const valueColor =
          stat.positive === true
            ? colors.positive
            : stat.positive === false
            ? colors.negative
            : colors.textSecondary;

        return (
          <React.Fragment key={index}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: dividerColor }]} />}
            <View style={styles.row}>
              <View style={styles.left}>
                <View style={[styles.chip, { backgroundColor: stat.chipColor + '20' }]}>
                  <Text style={[styles.chipText, { color: stat.chipColor }]}>{stat.chip}</Text>
                </View>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
              <View style={styles.right}>
                <Text style={[styles.value, { color: valueColor }]}>{stat.value}</Text>
                <Ionicons name={stat.icon} size={14} color={valueColor} style={{ marginLeft: 4 }} />
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 8,
    opacity: 0.5,
  },
  divider: {
    height: 1,
    marginHorizontal: -16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
});
