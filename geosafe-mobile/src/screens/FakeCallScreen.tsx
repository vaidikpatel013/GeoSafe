import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useEmergency } from '../context/EmergencyContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

export const FakeCallScreen: React.FC = () => {
  const {
    scheduleFakeCall,
    cancelFakeCallTimer,
    fakeCallTimerRemaining,
    fakeCallSettings,
    updateFakeCallSettings
  } = useEmergency();

  const personas = [
    { name: 'Mom', number: '+91 98200 12345', icon: '👩' },
    { name: 'Dad', number: '+91 98111 22334', icon: '👨' },
    { name: 'Inspector Verma (Police)', number: '100 / Special Cell', icon: '👮' },
    { name: 'Cab Driver (Uber)', number: '+91 99000 55443', icon: '🚖' },
    { name: 'Dr. Mehta', number: '+91 98777 66554', icon: '🩺' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: High-Contrast Inverted Dark Tactical HUD */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, HUD_SHADOWS.hardSm]}>
            <Text style={styles.brandBadgeIcon}>📞</Text>
          </View>
          <View>
            <Text style={styles.headerTag}>[UTILITY // DE-ESCALATION DISPATCH]</Text>
            <Text style={styles.headerTitle}>FAKE CALL SIMULATOR</Text>
            <Text style={styles.headerSubtitle}>
              Discreet Cellular Ring Synthesis & Stealth Escape Pretext
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Timer Banner */}
        {fakeCallTimerRemaining !== null && (
          <View style={[styles.timerBanner, HUD_SHADOWS.hard]}>
            <View style={styles.timerPulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.timerBannerTitle}>
                DISPATCH SCHEDULED IN 0{fakeCallTimerRemaining} SECONDS
              </Text>
              <Text style={styles.timerBannerSub}>
                CALLER: {fakeCallSettings.callerName.toUpperCase()} ({fakeCallSettings.callerNumber})
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.cancelBannerBtn, HUD_SHADOWS.hardSm]}
              onPress={cancelFakeCallTimer}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBannerText}>ABORT [CANCEL] ✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Launch Card: Stark Dark Surface */}
        <View style={[styles.card, HUD_SHADOWS.hard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTag}>[TRIGGER PROTOCOLS]</Text>
            <Text style={styles.cardTitle}>QUICK DELAY DISPATCH TRIGGERS</Text>
            <Text style={styles.cardSubtitle}>
              Simulate realistic incoming carrier call audio to gracefully extract yourself from vulnerable scenarios
            </Text>
          </View>

          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.delayButton, styles.delayButtonPrimary, HUD_SHADOWS.hardSm]}
              onPress={() => scheduleFakeCall(0)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⚡</Text>
              <Text style={styles.delayTextPrimary}>TRIGGER NOW ↗</Text>
              <Text style={styles.delaySubPrimary}>IMMEDIATE DISPATCH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayButton, HUD_SHADOWS.hardSm]}
              onPress={() => scheduleFakeCall(5)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⏳</Text>
              <Text style={styles.delayText}>05 SECONDS ↗</Text>
              <Text style={styles.delaySub}>POCKET DELAY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayButton, HUD_SHADOWS.hardSm]}
              onPress={() => scheduleFakeCall(10)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>⏱️</Text>
              <Text style={styles.delayText}>10 SECONDS ↗</Text>
              <Text style={styles.delaySub}>WALK-AWAY DELAY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayButton, HUD_SHADOWS.hardSm]}
              onPress={() => scheduleFakeCall(30)}
              activeOpacity={0.8}
            >
              <Text style={styles.delayIcon}>🕒</Text>
              <Text style={styles.delayText}>30 SECONDS ↗</Text>
              <Text style={styles.delaySub}>STEALTH TIMER</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Caller Persona Selector: Stark Block Cards */}
        <View style={[styles.card, HUD_SHADOWS.hard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTag}>[CALLER IDENTITY SELECTION]</Text>
            <Text style={styles.cardTitle}>SELECT INCOMING PERSONA</Text>
            <Text style={styles.cardSubtitle}>
              Active Caller Profile: <Text style={styles.activePersonaHighlight}>{fakeCallSettings.callerName.toUpperCase()}</Text> ({fakeCallSettings.callerNumber})
            </Text>
          </View>

          <View style={styles.personaList}>
            {personas.map((p) => {
              const isSelected = fakeCallSettings.callerName === p.name;
              return (
                <TouchableOpacity
                  key={p.name}
                  style={[
                    styles.personaItem,
                    isSelected && styles.personaItemSelected,
                    isSelected ? HUD_SHADOWS.hardSm : {}
                  ]}
                  onPress={() =>
                    updateFakeCallSettings({ callerName: p.name, callerNumber: p.number })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.personaIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personaName, isSelected && styles.personaNameSelected]}>
                      {p.name.toUpperCase()}
                    </Text>
                    <Text style={[styles.personaNumber, isSelected && styles.personaNumberSelected]}>
                      {p.number}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Text style={styles.checkText}>[ACTIVE]</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tactical Guidance Box: Neo-Brutalist Editorial Note */}
        <View style={[styles.guidanceBox, HUD_SHADOWS.hard]}>
          <Text style={styles.guidanceTag}>OPERATIONAL DOCTRINE // </Text>
          <Text style={styles.guidanceTitle}>TACTICAL NON-CONFRONTATIONAL ESCAPE</Text>
          <Text style={styles.guidanceText}>
            • Non-escalatory deterrence: An incoming cellular call affords a natural, socially polite pretext to break conversation, relocate to a high-surveillance sector, or enter a staffed commercial establishment without provoking hostile escalation.{'\n'}
            • Full-screen takeover: Screen authentically reproduces cellular interface protocols with audio dial-tone synthesis (dual-frequency 440Hz / 480Hz) and sensory vibration feedback on mobile devices.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HUD_COLORS.surfaceDark
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: HUD_COLORS.surfaceDark,
    borderBottomWidth: 2,
    borderBottomColor: '#262626'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.clay,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandBadgeIcon: {
    fontSize: 22
  },
  headerTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#A3A3A3',
    marginTop: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
    gap: 16
  },
  timerBanner: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: HUD_COLORS.riskMod
  },
  timerPulse: {
    width: 12,
    height: 12,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.riskMod
  },
  timerBannerTitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  timerBannerSub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    color: '#A3A3A3',
    marginTop: 2
  },
  cancelBannerBtn: {
    backgroundColor: HUD_COLORS.riskHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  cancelBannerText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 0,
    padding: 18,
    borderWidth: 2,
    borderColor: '#383838'
  },
  cardHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#2E2E2E',
    paddingBottom: 8,
    marginBottom: 14
  },
  cardTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#A3A3A3',
    marginTop: 4
  },
  activePersonaHighlight: {
    color: HUD_COLORS.clay,
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900'
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  delayButton: {
    width: '48.5%',
    backgroundColor: '#262626',
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#404040'
  },
  delayButtonPrimary: {
    backgroundColor: HUD_COLORS.clay,
    borderColor: '#FFFFFF'
  },
  delayIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  delayText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  delayTextPrimary: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  delaySub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: '#A3A3A3',
    marginTop: 4,
    fontWeight: '700'
  },
  delaySubPrimary: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: '#FFE2D7',
    marginTop: 4,
    fontWeight: '800'
  },
  personaList: {
    gap: 8
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 0,
    padding: 14,
    borderWidth: 2,
    borderColor: '#2E2E2E',
    gap: 12
  },
  personaItemSelected: {
    borderColor: HUD_COLORS.clay,
    backgroundColor: '#2A1F1B',
    borderWidth: 2
  },
  personaIcon: {
    fontSize: 24
  },
  personaName: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '800',
    color: '#E5E5E5'
  },
  personaNameSelected: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  personaNumber: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    color: '#737373',
    marginTop: 2
  },
  personaNumberSelected: {
    color: '#FFE2D7'
  },
  activeCheck: {
    backgroundColor: HUD_COLORS.clay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  checkText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900'
  },
  guidanceBox: {
    backgroundColor: '#181818',
    borderRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2E2E2E',
    borderLeftWidth: 4,
    borderLeftColor: HUD_COLORS.clay
  },
  guidanceTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 6,
    letterSpacing: -0.5
  },
  guidanceText: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#D4D4D4',
    lineHeight: 18
  }
});

export default FakeCallScreen;
