import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useSafety } from '../context/SafetyContext';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { CurrentAreaRiskCard } from '../components/RiskCard/CurrentAreaRiskCard';
import { LocationCrimeModal } from '../components/Analytics/LocationCrimeModal';
import { SafetyZone } from '../types';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

interface ZoneExplorerScreenProps {
  onNavigateToNavigator?: (selectedLocation?: string) => void;
}

export const ZoneExplorerScreen: React.FC<ZoneExplorerScreenProps> = ({
  onNavigateToNavigator
}) => {
  const {
    zones,
    filteredZones,
    userLocation,
    nearestZone,
    distanceToNearestKm,
    cityFilter,
    selectCity,
    timeOfDayFilter,
    setTimeOfDayFilter,
    riskFilter,
    setRiskFilter,
    selectLocation
  } = useSafety();

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedZone, setInspectedZone] = useState<SafetyZone | null>(null);
  const [dossierZone, setDossierZone] = useState<SafetyZone | null>(null);

  const currentCity = cityFilter === 'All' ? 'Mumbai' : cityFilter;
  const displayZone = inspectedZone || nearestZone;

  // Search filter
  const searchResults = filteredZones.filter(z =>
    z.Location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoneSelect = (zone: SafetyZone) => {
    setInspectedZone(zone);
    selectLocation(zone);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header: Oversized Display Type & Serif Italic Subtitle */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, HUD_SHADOWS.hardSm]}>
            <Text style={styles.brandBadgeIcon}>🗺️</Text>
          </View>
          <View>
            <Text style={styles.headerTag}>[UTILITY // SECTOR_SURVEILLANCE]</Text>
            <Text style={styles.headerTitle}>URBAN SAFETY EXPLORER</Text>
            <Text style={styles.headerSubtitle}>
              Interactive MapTiler Risk Zones, Diurnal Variance & Surveillance Telemetry
            </Text>
          </View>
        </View>

        {/* City Toggle: Sharp Block Buttons */}
        <View style={styles.cityPillGroup}>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Mumbai' && styles.cityPillActive]}
            onPress={() => {
              selectCity('Mumbai');
              setInspectedZone(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.cityPillText, currentCity === 'Mumbai' && styles.cityPillTextActive]}>
              🏙️ MUMBAI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Delhi' && styles.cityPillActive]}
            onPress={() => {
              selectCity('Delhi');
              setInspectedZone(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.cityPillText, currentCity === 'Delhi' && styles.cityPillTextActive]}>
              🏛️ DELHI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Floating Utility Panel: Raw, Hard-Bordered Controls */}
        <View style={[styles.controlPanel, HUD_SHADOWS.hard]}>
          <View style={styles.panelHeaderRow}>
            <Text style={styles.panelHeaderTag}>[SECTOR SEARCH & LAYER FILTERS]</Text>
            <Text style={styles.panelResultsCount}>{searchResults.length} SECTORS MATCHED</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${currentCity} (e.g. Bandra, BKC, Connaught Place)...`}
              placeholderTextColor="#737373"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Time & Risk Filter Pills: Block Buttons with 2px Borders */}
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Time Filters */}
              {(['Night', 'Evening', 'Afternoon', 'Morning'] as const).map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.filterChip, timeOfDayFilter === time && styles.filterChipTimeActive]}
                  onPress={() => setTimeOfDayFilter(time)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, timeOfDayFilter === time && styles.filterChipTextActive]}>
                    {time === 'Night' ? '🌙 NIGHT' : time === 'Evening' ? '🌇 EVENING' : time.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.chipDivider} />

              {/* Risk Filters */}
              {(['All', 'Low Risk', 'Moderate Risk', 'High Risk'] as const).map((risk) => (
                <TouchableOpacity
                  key={risk}
                  style={[
                    styles.filterChip,
                    riskFilter === risk &&
                      (risk === 'Low Risk'
                        ? styles.filterChipLowActive
                        : risk === 'High Risk'
                        ? styles.filterChipHighActive
                        : risk === 'Moderate Risk'
                        ? styles.filterChipModActive
                        : styles.filterChipAllActive)
                  ]}
                  onPress={() => setRiskFilter(risk)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, riskFilter === risk && styles.filterChipTextActive]}>
                    {risk === 'All' ? 'ALL RISKS' : risk.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Interactive Map: Framed in Sharp 3px Black Border with Hard Shadow */}
        <View style={[styles.mapContainer, HUD_SHADOWS.hardLg]}>
          <View style={styles.mapHeaderHud}>
            <Text style={styles.mapHudTag}>[LIVE MAPTILER RISK CLUSTERS // {currentCity.toUpperCase()}]</Text>
            <Text style={styles.mapHudStatus}>ACTIVE</Text>
          </View>
          <SafeZoneMap
            userLocation={userLocation}
            zones={searchResults}
            onZoneSelect={handleZoneSelect}
            height={440}
          />
        </View>

        {/* Floating Active Inspected Area Risk Card */}
        <CurrentAreaRiskCard
          zone={displayZone}
          distanceKm={inspectedZone ? 0 : distanceToNearestKm}
          onViewCrimeDossier={() => displayZone && setDossierZone(displayZone)}
        />

        {/* Quick Route Action CTA: High-Contrast Tactical Card */}
        {displayZone && onNavigateToNavigator && (
          <View style={[styles.routeCtaCard, HUD_SHADOWS.hard]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.routeCtaTag}>[EXPEDITION DIRECTIVE]</Text>
              <Text style={styles.routeCtaTitle}>NAVIGATE WITH AI SHIELD ↗</Text>
              <Text style={styles.routeCtaSub}>
                Compute safety-optimized route corridors to or from {displayZone.Location.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.routeCtaButton, HUD_SHADOWS.hardSm]}
              onPress={() => onNavigateToNavigator(displayZone.Location)}
              activeOpacity={0.8}
            >
              <Text style={styles.routeCtaButtonText}>PLAN ROUTE ↗</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Location Grid: Neo-Brutalist Metric Tiles */}
        <View style={styles.quickLocationsSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingTag}>[SECTOR DATABASE // TELEMETRY]</Text>
            <Text style={styles.sectionHeading}>
              {currentCity.toUpperCase()} SAFETY SECTORS ({searchResults.length} MONITORED)
            </Text>
          </View>

          <View style={styles.locationsGrid}>
            {searchResults.map((zone, idx) => {
              const isSelected = displayZone?.Location === zone.Location;
              const isLow = zone.risk_category === 'Low Risk';
              const isMod = zone.risk_category === 'Moderate Risk';
              const badgeBg = isLow ? HUD_COLORS.riskLow : isMod ? HUD_COLORS.riskMod : HUD_COLORS.riskHigh;
              const badgeTextColor = isMod ? '#000000' : '#FFFFFF';

              return (
                <TouchableOpacity
                  key={`${zone.City}-${zone.Location}-${idx}`}
                  style={[
                    styles.locationCard,
                    isSelected && styles.locationCardSelected,
                    HUD_SHADOWS.hardSm
                  ]}
                  onPress={() => handleZoneSelect(zone)}
                  activeOpacity={0.8}
                >
                  <View style={styles.locationCardHeader}>
                    <Text style={styles.locationCardName}>{zone.Location.toUpperCase()}</Text>
                    <View style={[styles.miniBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.miniBadgeText, { color: badgeTextColor }]}>
                        {zone.avg_risk_score.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.locationCardMeta}>
                    {zone.risk_category.toUpperCase()} • {zone.Time_of_Day.toUpperCase()}
                  </Text>

                  <View style={styles.locationStatsRow}>
                    <Text style={styles.locationStatText}>🎥 {zone.avg_cctv.toFixed(1)} CCTV</Text>
                    <Text style={styles.locationStatText}>🚓 {zone.avg_police_stations.toFixed(1)} POLICE</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Location Crime Detail Dossier Modal */}
      {dossierZone && (
        <LocationCrimeModal
          visible={!!dossierZone}
          zone={dossierZone}
          rank={1}
          timeOfDay={timeOfDayFilter}
          onClose={() => setDossierZone(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: HUD_COLORS.canvas,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    borderColor: HUD_COLORS.borderBlack,
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
    fontSize: 24,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 1
  },
  cityPillGroup: {
    flexDirection: 'row',
    backgroundColor: '#EAE8E2',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  cityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0
  },
  cityPillActive: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  cityPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  cityPillTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
    maxWidth: 1040,
    alignSelf: 'center',
    width: '100%'
  },
  controlPanel: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 14,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    marginBottom: 16
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 6,
    marginBottom: 10
  },
  panelHeaderTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  panelResultsCount: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '700',
    color: HUD_COLORS.textMuted
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    color: HUD_COLORS.textBlack
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    padding: 4
  },
  clearSearchText: {
    color: HUD_COLORS.textBlack,
    fontSize: 14,
    fontWeight: 'bold'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    marginRight: 6,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  filterChipTimeActive: {
    backgroundColor: HUD_COLORS.clay
  },
  filterChipAllActive: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  filterChipLowActive: {
    backgroundColor: HUD_COLORS.riskLow
  },
  filterChipModActive: {
    backgroundColor: HUD_COLORS.riskMod
  },
  filterChipHighActive: {
    backgroundColor: HUD_COLORS.riskHigh
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
  chipDivider: {
    width: 2,
    height: 18,
    backgroundColor: HUD_COLORS.borderBlack,
    marginHorizontal: 8
  },
  mapContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    marginBottom: 16
  },
  mapHeaderHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HUD_COLORS.surfaceDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  mapHudTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#F9F8F6',
    letterSpacing: 1
  },
  mapHudStatus: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.riskLow
  },
  routeCtaCard: {
    backgroundColor: HUD_COLORS.clay,
    borderRadius: 0,
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  routeCtaTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFE2D7',
    letterSpacing: 1,
    marginBottom: 2
  },
  routeCtaTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  routeCtaSub: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#FFE2D7',
    marginTop: 2
  },
  routeCtaButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  routeCtaButtonText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  quickLocationsSection: {
    marginTop: 12
  },
  sectionHeadingRow: {
    marginBottom: 12
  },
  sectionHeadingTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  locationCard: {
    width: '48.5%',
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 12,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  locationCardSelected: {
    borderColor: HUD_COLORS.clay,
    backgroundColor: '#FFF7ED',
    borderWidth: 3
  },
  locationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  locationCardName: {
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    flex: 1,
    paddingRight: 6
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack
  },
  miniBadgeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900'
  },
  locationCardMeta: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: HUD_COLORS.textMuted,
    fontWeight: '700',
    marginBottom: 8
  },
  locationStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  locationStatText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: HUD_COLORS.textBlack,
    fontWeight: '700'
  }
});

export default ZoneExplorerScreen;
