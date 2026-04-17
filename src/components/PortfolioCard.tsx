import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface PortfolioCardProps {
  metalId: string;
  metalName: string;
  investedAmount: number;
  currentValue: number;
  investorName: string;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  metalId,
  metalName,
  investedAmount,
  currentValue,
  investorName,
}) => {
  const { colors, isDark } = useTheme();

  const profitLoss = currentValue - investedAmount;
  const profitLossPercent = (profitLoss / investedAmount) * 100;
  const isPositive = profitLoss >= 0;

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Gradients for dark vs light mode per metal
  const getGradientColors = (): readonly [string, string] => {
    if (metalId === 'XAU') {
      return isDark ? ['#1E1805', '#151102'] : ['#FFF4CD', '#FCE9A0'];
    }
    if (metalId === 'XAG') {
      return isDark ? ['#222328', '#1A1B1E'] : ['#F3F4F6', '#E5E7EB'];
    }
    // Platinum XPT
    return isDark ? ['#181E29', '#10141C'] : ['#E9EDF5', '#D1D5DB'];
  };

  const textColor = isDark ? '#FFFFFF' : '#111827';
  const secondaryTextColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
    >
      <View style={styles.header}>
        <Text style={[styles.metalName, { color: secondaryTextColor }]}>{metalName} Portfolio</Text>
        <Text style={[styles.metalName, { color: secondaryTextColor, textTransform: 'capitalize' }]}>{investorName}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.balanceLabel, { color: secondaryTextColor }]}>Current Value</Text>
        <Text style={[styles.balance, { color: textColor }]}>{formatINR(currentValue)}</Text>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={[styles.footerLabel, { color: secondaryTextColor }]}>Invested</Text>
          <Text style={[styles.footerValue, { color: textColor }]}>{formatINR(investedAmount)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.footerLabel, { color: secondaryTextColor }]}>Return</Text>
          <View style={styles.plRow}>
            <Ionicons 
              name={isPositive ? "arrow-up" : "arrow-down"} 
              size={12} 
              color={textColor} 
            />
            <Text style={[styles.plText, { color: textColor }]}>
              {formatINR(Math.abs(profitLoss))} ({isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 64, // allows edge to peek out when scrolling
    height: 190,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metalName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: {
    marginTop: 10,
    flex: 1, // Let it naturally fill center space
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  balance: {
    fontSize: 34,
    fontWeight: '800',
  },
  plRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  plText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
