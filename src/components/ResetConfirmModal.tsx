import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ResetConfirmModalProps {
  visible: boolean;
  completedSessions: number;
  totalMinutes: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  visible,
  completedSessions,
  totalMinutes,
  onConfirm,
  onCancel,
}) => {
  const { colors, isDark } = useTheme();

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.92)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropAnim.setValue(0);
      cardScaleAnim.setValue(0.92);
      cardOpacityAnim.setValue(0);
    }
  }, [visible, backdropAnim, cardScaleAnim, cardOpacityAnim]);

  if (!visible) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Dimmed animated backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.75)'
                : 'rgba(10, 18, 14, 0.50)',
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        {/* Elegant Centered Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: cardOpacityAnim,
              transform: [{ scale: cardScaleAnim }],
              backgroundColor: isDark ? '#16161A' : '#FFFFFF',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : '#D6E4DC',
            },
          ]}
        >
          {/* Top Circular Aura Icon */}
          <View
            style={[
              styles.iconOrb,
              {
                backgroundColor: isDark
                  ? 'rgba(248, 113, 113, 0.16)'
                  : '#FEE8E2',
                borderColor: isDark
                  ? 'rgba(248, 113, 113, 0.35)'
                  : '#FCA5A5',
              },
            ]}
          >
            <Text
              style={[
                styles.iconGlyph,
                { color: isDark ? '#F87171' : '#C7513B' },
              ]}
            >
              ↺
            </Text>
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#0F1D15' },
            ]}
          >
            Reset Statistics?
          </Text>

          {/* Current Progress Pill Preview */}
          <View
            style={[
              styles.statsPill,
              {
                backgroundColor: isDark ? '#202026' : '#F5F2EB',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : '#E5E0D5',
              },
            ]}
          >
            <Text
              style={[
                styles.statsPillText,
                { color: isDark ? '#E2E2EA' : '#264032' },
              ]}
            >
              👤 {completedSessions} {completedSessions === 1 ? 'Session' : 'Sessions'}  •  ⏱️ {totalMinutes} {totalMinutes === 1 ? 'Min' : 'Mins'}
            </Text>
          </View>

          {/* Description */}
          <Text
            style={[
              styles.description,
              { color: isDark ? '#9A9AA6' : '#4E6B5A' },
            ]}
          >
            This will reset your mindful breathing, meditation, and ambient sound progress back to zero.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.cancelBtn,
                {
                  backgroundColor: isDark ? '#222228' : '#EFEBE3',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.10)'
                    : '#DCD5C9',
                },
              ]}
              onPress={onCancel}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: isDark ? '#E0E0E8' : '#2D4538' },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.resetBtn,
                {
                  backgroundColor: colors.accentTerracotta,
                  shadowColor: colors.accentTerracotta,
                },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Reset to 0</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardContainer: {
    width: Math.min(SCREEN_WIDTH - 44, 340),
    borderRadius: 26,
    borderWidth: 1.5,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  iconOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconGlyph: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  statsPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  statsPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  resetBtn: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
});
