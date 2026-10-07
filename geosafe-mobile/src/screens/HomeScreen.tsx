import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { useEmergency } from '../context/EmergencyContext';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { CurrentAreaRiskCard } from '../components/RiskCard/CurrentAreaRiskCard';
import { HoldForSOSButton } from '../components/SOS/HoldForSOSButton';
import { GuardianTrackingView } from '../components/Guardian/GuardianTrackingView';
import { SafetyZone } from '../types';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

interface HomeScreenProps {
  onNavigateToAnalytics?: () => void;
  onNavigateToSettings?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToAnalytics,
  onNavigateToSettings
}) => {
  const { user } = useAuth();
  const {
    filteredZones,
    userLocation,
    nearestZone,
    distanceToNearestKm,
    cityFilter,
    timeOfDayFilter,
    setCityFilter,
    setTimeOfDayFilter,
    simulateLocation
  } = useSafety();

  const {
    scheduleFakeCall,
    cancelFakeCallTimer,
    fakeCallTimerRemaining,
    activeEmergencyData,
    activeEmergencyId
  } = useEmergency();

  const [guardianModalVisible, setGuardianModalVisible] = useState(false);
  const [selectedMapZone, setSelectedMapZone] = useState<SafetyZone | null>(null);

  const displayZone = selectedMapZone || nearestZone;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={HUD_COLORS.canvas} />

      {/* Top Header Bar: Neo-Brutalist Tactical HUD */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoBadge, HUD_SHADOWS.hardSm]}>
            <Text style={styles.logoBadgeIcon}>🛡️</Text>
          </View>
          <View>
            <Text style={styles.headerTag}>[HUD CONSOLE // REAL-TIME]</Text>
            <Text style={styles.appName}>GEOSAFE</Text>
            <Text style={styles.userGreeting}>
              {user?.name ? `Operator: ${user.name.split(' ')[0].toUpperCase()}` : 'Real-Time Protection Active'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Quick Guardian Monitor Button */}
          <TouchableOpacity
            style={[styles.headerIconButton, HUD_SHADOWS.hardSm]}
            onPress={() => setGuardianModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.headerIconText}>👥</Text>
          </TouchableOpacity>

          {/* Settings / Profile Button */}
          {onNavigateToSettings && (
            <TouchableOpacity
              style={[styles.headerIconButton, HUD_SHADOWS.hardSm]}
              onPress={onNavigateToSettings}
              activeOpacity={0.8}
            >
              <Text style={styles.headerIconText}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* City & Time-of-Day Quick Filter Chips */}
        <View style={[styles.filterSection, HUD_SHADOWS.hard]}>
          <View style={styles.filterSectionHeader}>
            <Text style={styles.filterTag}>[REGIONAL & TEMPORAL SENSORS]</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {/* City Chips */}
            {(['All', 'Mumbai', 'Delhi'] as const).map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.filterChip, cityFilter === city && styles.filterChipActive]}
                onPress={() => setCityFilter(city)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    cityFilter === city && styles.filterChipTextActive
                  ]}
                >
                  {city === 'All' ? '🌐 ALL METROS' : city === 'Mumbai' ? '🏙️ MUMBAI' : '🏛️ DELHI'}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Time of Day Chips */}
            {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.filterChip,
                  timeOfDayFilter === time && styles.filterChipTimeActive
                ]}
                onPress={() => setTimeOfDayFilter(time)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    timeOfDayFilter === time && styles.filterChipTextActive
                  ]}
                >
                  {time === 'Night' ? '🌙 NIGHT' : time === 'Evening' ? '🌇 EVENING' : time.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Demo Location Jumper (Mumbai vs Delhi) */}
          <View style={styles.demoJumperRow}>
            <Text style={styles.demoJumperLabel}>DEMO GPS TELEPORT:</Text>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => simulateLocation('Mumbai')}
              activeOpacity={0.8}
            >
              <Text style={styles.demoPillText}>📍 MUMBAI (BANDRA)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => simulateLocation('Delhi')}
              activeOpacity={0.8}
            >
              <Text style={styles.demoPillText}>📍 DELHI (CP)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map Component: Framed in 3px Solid Black Border & Hard Shadow */}
        <View style={[styles.mapContainer, HUD_SHADOWS.hardLg]}>
          <View style={styles.mapHudHeader}>
            <Text style={styles.mapHudTag}>[LIVE RADAR // SURVEILLANCE OVERLAY]</Text>
            <Text style={styles.mapHudLive}>MONITORING</Text>
          </View>
          <SafeZoneMap
            userLocation={userLocation}
            zones={filteredZones}
            activeEmergency={activeEmergencyData}
            onZoneSelect={(zone) => setSelectedMapZone(zone)}
            height={340}
          />
        </View>

        {/* Floating Current Area Risk Card */}
        <CurrentAreaRiskCard
          zone={displayZone}
          distanceKm={selectedMapZone ? undefined : distanceToNearestKm}
        />

        {/* Core Safety Utilities Section */}
        <View style={styles.utilitiesSection}>
          <View style={styles.utilityHeadingRow}>
            <Text style={styles.utilityHeadingTag}>[TACTICAL INTERRUPT UTILITIES]</Text>
            <Text style={styles.sectionTitle}>RAPID RESPONSE DISPATCH</Text>
          </View>

          <View style={styles.utilityCardsRow}>
            {/* Fake Call Trigger Card */}
            <View style={[styles.utilityCard, HUD_SHADOWS.hard]}>
              <View style={styles.utilityCardTop}>
                <Text style={styles.utilityIcon}>📞</Text>
                <View style={styles.utilityTextContainer}>
                  <Text style={styles.utilityTitle}>FAKE INCOMING CALL PROTOCOL</Text>
                  <Text style={styles.utilitySub}>
                    {fakeCallTimerRemaining !== null
                      ? `RING DISPATCH IN ${fakeCallTimerRemaining}s...`
                      : 'Synthesize immediate discreet escape ring'}
                  </Text>
                </View>
              </View>

              {fakeCallTimerRemaining !== null ? (
                <TouchableOpacity
                  style={[styles.cancelCallButton, HUD_SHADOWS.hardSm]}
                  onPress={cancelFakeCallTimer}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelCallText}>CANCEL DISPATCH ({fakeCallTimerRemaining}s) ✕</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerButtonGroup}>
                  <TouchableOpacity
                    style={[styles.timerButton, styles.timerButtonNow]}
                    onPress={() => scheduleFakeCall(0)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.timerButtonTextNow}>NOW ↗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(5)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.timerButtonText}>05s ↗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(10)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.timerButtonText}>10s ↗</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={() => scheduleFakeCall(30)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.timerButtonText}>30s ↗</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* One-Tap Guardian SOS Button with 5s Cancel Countdown */}
        <HoldForSOSButton onOpenGuardianTracker={() => setGuardianModalVisible(true)} />

        {/* Quick link to Safety Analytics Screen: High-Contrast Clay Card */}
        {onNavigateToAnalytics && (
          <TouchableOpacity
            style={[styles.analyticsBanner, HUD_SHADOWS.hard]}
            onPress={onNavigateToAnalytics}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.analyticsTag}>[DATA INTELLIGENCE]</Text>
              <Text style={styles.analyticsTitle}>URBAN SAFETY ANALYTICS ↗</Text>
              <Text style={styles.analyticsSub}>
                Explore Delhi & Mumbai incident severity, time-of-day multipliers & CCTV regression models
              </Text>
            </View>
            <Text style={styles.analyticsArrow}>↗</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Guardian Real-Time Live Tracker Modal */}
      <Modal
        visible={guardianModalVisible}
        animationType="slide"
        onRequestClose={() => setGuardianModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: HUD_COLORS.canvas }}>
          <GuardianTrackingView
            emergencyId={activeEmergencyId}
            onClose={() => setGuardianModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: HUD_COLORS.canvas,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.clay,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoBadgeIcon: {
    fontSize: 22
  },
  headerTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  userGreeting: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerIconText: {
    fontSize: 18
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%'
  },
  filterSection: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    borderRadius: 0,
    padding: 14,
    marginBottom: 16
  },
  filterSectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 6,
    marginBottom: 10
  },
  filterTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  chipScroll: {
    marginBottom: 10
  },
  filterChip: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    marginRight: 6,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  filterChipActive: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  filterChipTimeActive: {
    backgroundColor: HUD_COLORS.clay
  },
  filterChipText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: HUD_COLORS.textBlack
  },
  filterChipTextActive: {
    color: '#FFFFFF'
  },
  demoJumperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  demoJumperLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: HUD_COLORS.textMuted,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  demoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: HUD_COLORS.borderBlack
  },
  demoPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: HUD_COLORS.textBlack
  },
  mapContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    marginBottom: 16
  },
  mapHudHeader: {
    backgroundColor: HUD_COLORS.surfaceDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  mapHudTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  mapHudLive: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.riskLow
  },
  utilitiesSection: {
    marginTop: 18,
    marginBottom: 8
  },
  utilityHeadingRow: {
    marginBottom: 8
  },
  utilityHeadingTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  utilityCardsRow: {
    gap: 12
  },
  utilityCard: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  utilityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  utilityIcon: {
    fontSize: 26
  },
  utilityTextContainer: {
    flex: 1
  },
  utilityTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  utilitySub: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  cancelCallButton: {
    backgroundColor: HUD_COLORS.riskHigh,
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000'
  },
  cancelCallText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11
  },
  timerButtonGroup: {
    flexDirection: 'row',
    gap: 8
  },
  timerButton: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  timerButtonNow: {
    backgroundColor: HUD_COLORS.clay
  },
  timerButtonText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  timerButtonTextNow: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  analyticsBanner: {
    backgroundColor: HUD_COLORS.clay,
    borderRadius: 0,
    padding: 16,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  analyticsTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFE2D7',
    letterSpacing: 1,
    marginBottom: 2
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  analyticsSub: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#FFE2D7',
    marginTop: 2
  },
  analyticsArrow: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF'
  }
});

export default HomeScreen;
