import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable
} from 'react-native';
import { useEmergency } from '../../context/EmergencyContext';
import { useAuth } from '../../context/AuthContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../../theme/hudTheme';

interface HoldForSOSButtonProps {
  onOpenGuardianTracker?: () => void;
}

export const HoldForSOSButton: React.FC<HoldForSOSButtonProps> = ({
  onOpenGuardianTracker
}) => {
  const {
    isSosArmed,
    countdownSeconds,
    isSosActive,
    startSosCountdown,
    cancelSosCountdown,
    resolveEmergency,
    activeEmergencyId
  } = useEmergency();

  const { user } = useAuth();
  const [holding, setHolding] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isSosActive || isSosArmed) return;
    setHolding(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    setHolding(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const handleTrigger = () => {
    if (isSosActive) return;
    startSosCountdown();
  };

  return (
    <View style={styles.container}>
      {/* If Emergency is Active: Tactical High-Contrast Dark Surface */}
      {isSosActive ? (
        <View style={[styles.activeEmergencyCard, HUD_SHADOWS.hardLg]}>
          <View style={styles.activeHeaderRow}>
            <View style={styles.pulsingSquare} />
            <Text style={styles.activeAlertTitle}>
              CRITICAL ALERT // SOS LIVE STREAM ACTIVE
            </Text>
          </View>
          <Text style={styles.activeSubtitle}>
            TELEMETRY DISPATCHED TO GUARDIAN CLOUD • INTERVAL: 5000ms
            {activeEmergencyId && ` [REF: ${activeEmergencyId.slice(0, 8)}]`}
          </Text>

          <View style={styles.activeActionButtons}>
            {onOpenGuardianTracker && (
              <TouchableOpacity
                style={[styles.guardianLinkButton, HUD_SHADOWS.hardSm]}
                onPress={onOpenGuardianTracker}
                activeOpacity={0.8}
              >
                <Text style={styles.guardianLinkText}>GUARDIAN HUD ↗</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.resolveButton, HUD_SHADOWS.hardSm]}
              onPress={resolveEmergency}
              activeOpacity={0.8}
            >
              <Text style={styles.resolveButtonText}>RESOLVE EMERGENCY [SAFE] ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Standby State: Ultra-tactile Solid Crimson SOS Trigger */
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', alignItems: 'center' }}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleTrigger}
            style={[styles.sosButton, HUD_SHADOWS.hardLg]}
          >
            <View style={styles.sosInnerLayout}>
              <View style={styles.sosTopBadge}>
                <Text style={styles.sosTopBadgeText}>
                  {holding ? '● SENSORS ENGAGED — HOLDING...' : '▲ EMERGENCY PROTOCOL'}
                </Text>
              </View>
              <View style={styles.sosCenterRow}>
                <Text style={styles.sosIcon}>🚨</Text>
                <Text style={styles.sosMainText}>HOLD FOR SOS</Text>
              </View>
              <Text style={styles.sosSubText}>
                {holding ? '[TRIGGERING 5s DISPATCH SEQUENCE]' : 'HARD PRESS & HOLD // 5s DISPATCH'}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* 5-Second Cancel Countdown Modal: Neo-Brutalist Tactical Window */}
      <Modal
        visible={isSosArmed}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.countdownOverlay}>
          <View style={[styles.countdownCard, HUD_SHADOWS.hardLg]}>
            <View style={styles.modalHeaderBar}>
              <Text style={styles.modalHeaderTag}>[TACTICAL INTERRUPT]</Text>
              <Text style={styles.modalCancelAlert}>LIVE DISPATCH INITIATED</Text>
            </View>

            <Text style={styles.countdownTitle}>DISPATCHING EMERGENCY SOS</Text>
            <Text style={styles.countdownNotice}>
              Sensory haptic active. Alerting {user?.emergency_contact || 'emergency contacts'} & streaming live GPS telemetry in:
            </Text>

            {/* Monospace Countdown Display Tile */}
            <View style={styles.countdownSquare}>
              <Text style={styles.countdownNumber}>0{countdownSeconds}</Text>
              <Text style={styles.countdownUnit}>SEC</Text>
            </View>

            <TouchableOpacity
              style={[styles.cancelCountdownButton, HUD_SHADOWS.hard]}
              onPress={cancelSosCountdown}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelCountdownText}>ABORT DISPATCH [CANCEL] ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 12,
    alignItems: 'center'
  },
  sosButton: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: HUD_COLORS.riskHigh,
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sosInnerLayout: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  sosTopBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6
  },
  sosTopBadgeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  sosCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  sosIcon: {
    fontSize: 22
  },
  sosMainText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  sosSubText: {
    color: '#FFE4E6',
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  activeEmergencyCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: HUD_COLORS.surfaceDark,
    borderColor: HUD_COLORS.riskHigh,
    borderWidth: 3,
    borderRadius: 0,
    padding: 16,
    alignItems: 'center'
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  pulsingSquare: {
    width: 10,
    height: 10,
    backgroundColor: HUD_COLORS.riskHigh
  },
  activeAlertTitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  activeSubtitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    color: '#A3A3A3',
    marginBottom: 14,
    textAlign: 'center'
  },
  activeActionButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  guardianLinkButton: {
    flex: 1,
    backgroundColor: HUD_COLORS.clay,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000'
  },
  guardianLinkText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5
  },
  resolveButton: {
    flex: 1,
    backgroundColor: HUD_COLORS.riskLow,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000'
  },
  resolveButtonText: {
    color: '#000000',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5
  },
  countdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  countdownCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: HUD_COLORS.canvas,
    borderRadius: 0,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  modalHeaderBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack,
    paddingBottom: 6,
    marginBottom: 12
  },
  modalHeaderTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.clay
  },
  modalCancelAlert: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.riskHigh
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  countdownNotice: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  countdownSquare: {
    width: 110,
    height: 110,
    backgroundColor: HUD_COLORS.surfaceDark,
    borderWidth: 3,
    borderColor: HUD_COLORS.riskHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  countdownNumber: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 52,
    fontWeight: '900',
    color: HUD_COLORS.riskHigh,
    lineHeight: 56
  },
  countdownUnit: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#A3A3A3',
    letterSpacing: 2
  },
  cancelCountdownButton: {
    backgroundColor: HUD_COLORS.surfaceDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 0,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  cancelCountdownText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1
  }
});

export default HoldForSOSButton;
