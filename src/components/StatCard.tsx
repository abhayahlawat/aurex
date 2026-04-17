import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

import { LoaderSkeleton } from './LoaderSkeleton';

interface StatCardProps {
  label: string;
  value: string;
  isLoading?: boolean;
  variant?: 'default' | 'tinted';
  size?: 'small' | 'large';
  isHero?: boolean;
  metal?: 'gold' | 'silver' | 'platinum';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  isLoading, 
  variant = 'default',
  size = 'large',
  isHero = false,
  metal = 'gold'
}) => {
  const { colors, isDark } = useTheme();

  const getBackgroundColor = () => {
    if (variant === 'tinted') {
      return isDark ? '#1C1C26' : '#F3F4F6';
    }
    return colors.card;
  };

  const getHeroGradients = (): readonly [string, string] => {
    if (metal === 'gold') {
      return isDark ? ['#1E1805', '#151102'] : ['#FFF4CD', '#FCE9A0'];
    }
    if (metal === 'silver') {
      return isDark ? ['#222328', '#1A1B1E'] : ['#F3F4F6', '#E5E7EB'];
    }
    if (metal === 'platinum') {
      return isDark ? ['#181E29', '#10141C'] : ['#E9EDF5', '#D1D5DB'];
    }
    return [colors.accent, colors.accent];
  };

  const isSmall = size === 'small';
  const heroTextColor = isDark ? '#FFFFFF' : '#111827';

  const renderContent = () => (
    <>
      <Text 
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.label, 
          { color: isHero ? heroTextColor : colors.textSecondary },
          isSmall && styles.labelSmall,
          isHero && styles.heroLabel
        ]}
      >
        {label}
      </Text>
      {isLoading ? (
        <LoaderSkeleton width={isSmall ? 70 : 100} height={isSmall ? 16 : 20} borderRadius={4} />
      ) : (
        <Text 
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.value, 
            { color: isHero ? heroTextColor : colors.textPrimary },
            isSmall && styles.valueSmall,
            isHero && styles.heroValue
          ]}
        >
          {value}
        </Text>
      )}
    </>
  );

  if (isHero) {
    return (
      <LinearGradient
        colors={getHeroGradients()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          isSmall && styles.containerSmall,
          styles.heroContainer
        ]}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: getBackgroundColor() },
      isSmall && styles.containerSmall
    ]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerSmall: {
    padding: 10,
    borderRadius: 10,
    margin: 3,
  },
  heroContainer: {
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  labelSmall: {
    fontSize: 9,
    marginBottom: 2,
  },
  heroLabel: {
    opacity: 0.7,
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  valueSmall: {
    fontSize: 14,
  },
  heroValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
