import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProp } from '../../navigation/types';

export type NavTabId = 'home' | 'practice' | 'sounds' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTabId;
  style?: StyleProp<ViewStyle>;
}

interface NavTabItem {
  id: NavTabId;
  label: string;
  icon: string;
  routeName: 'Home' | 'Breathing' | 'Sounds' | 'Settings';
}

const TABS: NavTabItem[] = [
  { id: 'home', label: 'Home', icon: '🌿', routeName: 'Home' },
  { id: 'practice', label: 'Breathe', icon: '🫧', routeName: 'Breathing' },
  { id: 'sounds', label: 'Sounds', icon: '🎵', routeName: 'Sounds' },
  { id: 'settings', label: 'Settings', icon: '⚙️', routeName: 'Settings' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, style }) => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleTabPress = (tab: NavTabItem) => {
    if (tab.id === activeTab) {
      return;
    }
    navigation.navigate(tab.routeName);
  };

  return (
    <View
      style={[
        styles.capsuleContainer,
        {
          bottom: Math.max(insets.bottom + 8, 14),
          backgroundColor: isDark ? '#101014' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : '#D6E4DC',
        },
        style,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabTouchTarget}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              {/* Circular Active Indicator around the icon */}
              <View
                style={[
                  styles.iconCircle,
                  isActive && {
                    backgroundColor: isDark ? '#24242C' : '#E4F0E9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#265C43',
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabIcon,
                    {
                      transform: [{ scale: isActive ? 1.08 : 0.98 }],
                    },
                  ]}
                >
                  {tab.icon}
                </Text>
              </View>

              {/* Tab Label */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? colors.textPrimary
                      : isDark
                      ? '#8E8E98'
                      : '#4E6B5A',
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  capsuleContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 36,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 100,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabTouchTarget: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 52,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 2,
  },
  tabIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'sans-serif',
    letterSpacing: 0.3,
  },
});

