import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface MetalCardProps {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  price: number;
  changePercent: number;
  isLoading?: boolean;
  onPress: () => void;
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const MetalCard: React.FC<MetalCardProps> = ({
  name,
  icon,
  price,
  changePercent,
  isLoading,
  onPress,
}) => {
  const { colors, isDark } = useTheme();

  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const iconName = isPositive ? 'trending-up' : 'trending-down';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, minHeight: 120 }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={[styles.symbolBadge, { backgroundColor: colors.accent + '20' }]}>
          <Ionicons name={icon as any} size={16} color={colors.accent} />
        </View>
        <View style={[styles.trendBadge, { backgroundColor: changeColor + '15' }]}>
          <Ionicons name={iconName} size={12} color={changeColor} />
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={[styles.name, { color: colors.textSecondary }]}>{name}</Text>
        <Text style={[styles.price, { color: colors.textPrimary }]} numberOfLines={1}>
          {formatINR(price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 110,
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    marginBottom: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  change: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  bottomSection: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
  },
});
