import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Platform, UIManager, Dimensions, StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS, 
  Easing 
} from 'react-native-reanimated';

// Enable LayoutAnimation for Android (kept as fallback or for other layout changes)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
// Calculate maximum diagonal to ensure circle covers screen
const MAX_RADIUS = Math.sqrt(width ** 2 + height ** 2);

export interface ThemeColors {
  background: string;
  card: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  positive: string;
  negative: string;
}

const darkColors: ThemeColors = {
  background: '#0B0B0F',
  card: '#15151C',
  accent: '#D4AF37',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  positive: '#22C55E',
  negative: '#EF4444',
};

const lightColors: ThemeColors = {
  background: '#F8F9FB',
  card: '#FFFFFF',
  accent: '#C9A227',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  positive: '#16A34A',
  negative: '#DC2626',
};

interface ThemeContextData {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: (x?: number, y?: number) => void;
}

const ThemeContext = createContext<ThemeContextData>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  
  // Animation coordinates
  const circleX = useSharedValue(0);
  const circleY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = (x?: number, y?: number) => {
    const nextIsDark = !isDark;
    const nextColors = nextIsDark ? darkColors : lightColors;

    // Default to top right if no coordinates provided
    circleX.value = x ?? width - 40;
    circleY.value = y ?? 80;
    
    // Set overlay color to the new transition color
    setOverlayColor(nextColors.background);
    
    // Animate the reveal
    scale.value = 0;
    opacity.value = 0;

    // Start reveal
    opacity.value = withTiming(0.7, { duration: 250 });
    scale.value = withTiming(1, { 
      duration: 750, 
      easing: Easing.bezier(0.4, 0, 0.2, 1) 
    }, (finished) => {
      if (finished) {
        // Dissolve the overlay
        opacity.value = withTiming(0, { duration: 350 }, () => {
          runOnJS(setOverlayColor)(null);
          scale.value = 0;
        });
      }
    });

    // Swap actual theme state halfway through (around 350ms)
    setTimeout(() => {
      runOnJS(setIsDark)(nextIsDark);
    }, 350);
  };

  const colors = isDark ? darkColors : lightColors;

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: circleX.value - MAX_RADIUS,
      top: circleY.value - MAX_RADIUS,
      width: MAX_RADIUS * 2,
      height: MAX_RADIUS * 2,
      borderRadius: MAX_RADIUS,
      backgroundColor: overlayColor ?? 'transparent',
      transform: [{ scale: scale.value * 1.2 }], // Slightly overscale for safety
      opacity: opacity.value,
      zIndex: 9999,
      pointerEvents: 'none',
      // Add a soft glow instead of a hard shadow
      shadowColor: overlayColor ?? '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 50,
    };
  });

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
        <Animated.View style={animatedCircleStyle} />
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
