import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { SafetyZone, CrimeIncident } from '../../types';
import { crimeDataService } from '../../services/CrimeDataService';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../../theme/hudTheme';

interface LocationCrimeModalProps {
  visible: boolean;
  zone: SafetyZone | null;
  rank: number;
  timeOfDay?: string;
  onClose: () => void;
}

export const LocationCrimeModal: React.FC<LocationCrimeModalProps> = ({
  visible,
  zone,
  rank,
  timeOfDay,
  onClose
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch authentic crime incidents for this location and city
  const crimeData = useMemo(() => {
    if (!zone) return null;
    return crimeDataService.getLocationCrimes(zone.City, zone.Location);
  }, [zone]);

  // Compute single-line justification
  const justification = useMemo(() => {
    if (!zone) return '';
    return crimeDataService.getRankingJustification(rank, zone, timeOfDay);
  }, [zone, rank, timeOfDay]);

  // Filter crimes by selected type and search query
  const filteredCrimes = useMemo(() => {
    if (!crimeData) return [];
    let list = crimeData.crimes;

    if (selectedTypeFilter !== 'ALL') {
      list = list.filter(
        c => c.crime_type.toLowerCase() === selectedTypeFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.date.includes(q) ||
          c.time.includes(q) ||
          c.crime_type.toLowerCase().includes(q)
      );
    }

    return list;
  }, [crimeData, selectedTypeFilter, searchQuery]);

  if (!zone) return null;

  const isLow = zone.risk_category === 'Low Risk';
  const isMod = zone.risk_category === 'Moderate Risk';
  const riskColor = isLow ? HUD_COLORS.riskLow : isMod ? HUD_COLORS.riskMod : HUD_COLORS.riskHigh;
  const formattedRank = rank < 10 ? `#0${rank}` : `#${rank}`;
  const cctvCount = (zone.avg_cctv || crimeData?.avg_cctv || 6.0).toFixed(1);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Top Tactical HUD Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTag}>
              [DOSSIER // CRIME INCIDENT ARCHIVE]
            </Text>
            <Text style={styles.headerTitle}>
              {zone.Location.toUpperCase()}
            </Text>
            <Text style={styles.headerSubtitle}>
              {zone.City.toUpperCase()} SECTOR • {timeOfDay ? timeOfDay.toUpperCase() : zone.Time_of_Day.toUpperCase()} WINDOW
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, HUD_SHADOWS.hardSm]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonIcon}>✕</Text>
            <Text style={styles.closeButtonText}>CLOSE DOSSIER</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Rank & Risk Summary Banner */}
          <View style={[styles.summaryBanner, HUD_SHADOWS.hard]}>
            <View style={styles.bannerRankBadge}>
              <Text style={styles.bannerRankText}>{formattedRank}</Text>
              <Text style={styles.bannerRankLabel}>RANK</Text>
            </View>

            <View style={styles.bannerInfo}>
              <View style={styles.bannerPillRow}>
                <View style={[styles.riskPill, { backgroundColor: riskColor }]}>
                  <Text style={[styles.riskPillText, { color: isMod ? '#000000' : '#FFFFFF' }]}>
                    {zone.risk_category.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillText}>
                    SCORE {zone.avg_risk_score.toFixed(2)} / 5.00
                  </Text>
                </View>
              </View>
              <Text style={styles.bannerLocSub}>
                {zone.Location} • {zone.City} Municipal Area
              </Text>
            </View>
          </View>

          {/* Single-Line Ranking Justification Box */}
          <View style={[styles.justificationCard, HUD_SHADOWS.hard]}>
            <View style={styles.justificationHeaderRow}>
              <Text style={styles.justificationTag}>
                [RANKING JUSTIFICATION // SINGLE-LINE ADVISORY]
              </Text>
            </View>
            <Text style={styles.justificationText}>
              {justification}
            </Text>
          </View>

          {/* CCTV Surveillance & Empirical Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Primary CCTV Focus Box */}
            <View style={[styles.metricTile, styles.metricTileCctv, HUD_SHADOWS.hardSm]}>
              <Text style={styles.metricTileTag}>[SURVEILLANCE]</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricTileIcon}>🎥</Text>
                <Text style={styles.metricTileVal}>{cctvCount}</Text>
              </View>
              <Text style={styles.metricTileLabel}>CCTV CAMERAS MONITORED</Text>
              <Text style={styles.metricTileSub}>Active Sector Coverage</Text>
            </View>

            {/* Police Station Coverage */}
            <View style={[styles.metricTile, HUD_SHADOWS.hardSm]}>
              <Text style={styles.metricTileTag}>[ENFORCEMENT]</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricTileIcon}>🚓</Text>
                <Text style={styles.metricTileVal}>{zone.avg_police_stations.toFixed(1)}</Text>
              </View>
              <Text style={styles.metricTileLabel}>POLICE STATIONS</Text>
              <Text style={styles.metricTileSub}>Jurisdiction Proximity</Text>
            </View>

            {/* Incident Volume */}
            <View style={[styles.metricTile, HUD_SHADOWS.hardSm]}>
              <Text style={styles.metricTileTag}>[EMPIRICAL LOG]</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricTileIcon}>📋</Text>
                <Text style={styles.metricTileVal}>{crimeData?.total_crimes || zone.total_incidents || 0}</Text>
              </View>
              <Text style={styles.metricTileLabel}>TOTAL CRIMES IN DATASET</Text>
              <Text style={styles.metricTileSub}>Historical Records</Text>
            </View>

            {/* Crime Severity Index */}
            <View style={[styles.metricTile, HUD_SHADOWS.hardSm]}>
              <Text style={styles.metricTileTag}>[SEVERITY]</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricTileIcon}>⚠️</Text>
                <Text style={styles.metricTileVal}>{(zone.avg_severity || 3.5).toFixed(1)}</Text>
              </View>
              <Text style={styles.metricTileLabel}>SEVERITY INDEX / 10</Text>
              <Text style={styles.metricTileSub}>Harm Multiplier Weight</Text>
            </View>
          </View>

          {/* Section: Crime Logs with Exact Date and Time */}
          <View style={styles.crimeSectionHeader}>
            <View>
              <Text style={styles.crimeSectionTag}>
                [DATASET TELEMETRY // INCIDENT REGISTER]
              </Text>
              <Text style={styles.crimeSectionTitle}>
                RECORDED CRIMES WITH EXACT DATE & TIME ({filteredCrimes.length})
              </Text>
            </View>
          </View>

          {/* Search Filter Box */}
          <View style={[styles.searchBox, HUD_SHADOWS.hardSm]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by date (YYYY-MM-DD), time, or type..."
              placeholderTextColor={HUD_COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Crime Type Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillScroll}
          >
            {['ALL', 'THEFT', 'HARASSMENT', 'ASSAULT', 'BURGLARY', 'FRAUD'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterPill,
                  selectedTypeFilter === type && styles.filterPillActive
                ]}
                onPress={() => setSelectedTypeFilter(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedTypeFilter === type && styles.filterPillTextActive
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* List of Crimes */}
          <View style={styles.crimeListContainer}>
            {filteredCrimes.length === 0 ? (
              <View style={[styles.emptyBox, HUD_SHADOWS.hardSm]}>
                <Text style={styles.emptyTitle}>NO MATCHING INCIDENTS</Text>
                <Text style={styles.emptySub}>
                  No recorded incidents matched the specified filters for this sector.
                </Text>
              </View>
            ) : (
              filteredCrimes.map((incident: CrimeIncident, idx: number) => {
                const typeColor = crimeDataService.getCrimeTypeColor(incident.crime_type);
                return (
                  <View
                    key={`${incident.crime_id}-${idx}`}
                    style={[styles.crimeCard, HUD_SHADOWS.hardSm]}
                  >
                    <View style={styles.crimeCardTop}>
                      {/* Crime Type Pill */}
                      <View style={[styles.crimeTypePill, { backgroundColor: typeColor }]}>
                        <Text style={styles.crimeTypePillText}>
                          {incident.crime_type.toUpperCase()}
                        </Text>
                      </View>

                      {/* Time of Day interval badge */}
                      <View style={styles.todPill}>
                        <Text style={styles.todPillText}>
                          {incident.time_of_day.toUpperCase()}
                        </Text>
                      </View>

                      {/* Crime Severity Badge */}
                      <View style={styles.severityBadge}>
                        <Text style={styles.severityText}>
                          SEV: {incident.severity.toFixed(1)}/10
                        </Text>
                      </View>
                    </View>

                    {/* Prominent Exact Date & Time Row */}
                    <View style={styles.dateTimeRow}>
                      <View style={styles.dateTimeItem}>
                        <Text style={styles.dateTimeLabel}>EXACT DATE:</Text>
                        <Text style={styles.dateTimeValue}>📅 {incident.date}</Text>
                      </View>
                      <View style={styles.dateTimeDivider} />
                      <View style={styles.dateTimeItem}>
                        <Text style={styles.dateTimeLabel}>EXACT TIME:</Text>
                        <Text style={styles.dateTimeValue}>⏰ {incident.time} HRS</Text>
                      </View>
                    </View>

                    {/* Secondary Details: CCTV, Police Response, Arrest Status */}
                    <View style={styles.crimeMetaRow}>
                      <Text style={styles.crimeMetaItem}>
                        🎥 {incident.cctv_nearby} Nearby CCTV
                      </Text>
                      <Text style={styles.crimeMetaItem}>
                        🚓 {incident.police_response_mins} min Police Response
                      </Text>
                      <Text
                        style={[
                          styles.crimeMetaStatus,
                          incident.resolved ? styles.statusResolved : styles.statusPending
                        ]}
                      >
                        {incident.resolved ? '✓ RESOLVED' : '⏱ PENDING'}
                      </Text>
                      {incident.suspect_arrested && (
                        <Text style={styles.arrestedTag}>🚔 SUSPECT ARRESTED</Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HUD_COLORS.surfaceDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 12
  },
  headerTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: '#D4D4D4',
    marginTop: 2
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: HUD_COLORS.canvas,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  closeButtonIcon: {
    fontSize: 14,
    color: HUD_COLORS.textBlack,
    fontWeight: '900'
  },
  closeButtonText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%'
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HUD_COLORS.surfaceDark,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 14,
    marginBottom: 14
  },
  bannerRankBadge: {
    backgroundColor: HUD_COLORS.clay,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    alignItems: 'center',
    marginRight: 14
  },
  bannerRankText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  bannerRankLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  bannerInfo: {
    flex: 1
  },
  bannerPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: HUD_COLORS.borderBlack
  },
  riskPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  scorePill: {
    backgroundColor: '#262626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#404040'
  },
  scorePillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: '#F9F8F6'
  },
  bannerLocSub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    color: '#A3A3A3',
    marginTop: 2
  },
  justificationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 14,
    marginBottom: 16
  },
  justificationHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 6,
    marginBottom: 8
  },
  justificationTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  justificationText: {
    fontSize: 13,
    fontWeight: '800',
    color: HUD_COLORS.textBlack,
    lineHeight: 20
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  metricTile: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 12
  },
  metricTileCctv: {
    backgroundColor: '#FFF8F4',
    borderColor: HUD_COLORS.clay
  },
  metricTileTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 0.8
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
    marginBottom: 2
  },
  metricTileIcon: {
    fontSize: 18
  },
  metricTileVal: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 24,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  metricTileLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  metricTileSub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  crimeSectionHeader: {
    marginBottom: 10
  },
  crimeSectionTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  crimeSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.3,
    marginTop: 2
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8
  },
  searchIcon: {
    fontSize: 14
  },
  searchInput: {
    flex: 1,
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    color: HUD_COLORS.textBlack
  },
  searchClear: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 14,
    color: HUD_COLORS.textMuted,
    paddingHorizontal: 4
  },
  filterPillScroll: {
    gap: 6,
    paddingBottom: 12
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  filterPillActive: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  filterPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  filterPillTextActive: {
    color: '#FFFFFF'
  },
  crimeListContainer: {
    gap: 10
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 24,
    alignItems: 'center'
  },
  emptyTitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  emptySub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    color: HUD_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center'
  },
  crimeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 12
  },
  crimeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  crimeTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack
  },
  crimeTypePillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  todPill: {
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  todPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: HUD_COLORS.textBlack
  },
  severityBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  severityText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#B91C1C'
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 12
  },
  dateTimeItem: {
    flex: 1
  },
  dateTimeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D4D4D4'
  },
  dateTimeLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    fontWeight: '900',
    color: HUD_COLORS.textMuted,
    letterSpacing: 0.5
  },
  dateTimeValue: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    marginTop: 2
  },
  crimeMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 6
  },
  crimeMetaItem: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: HUD_COLORS.textMuted
  },
  crimeMetaStatus: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1
  },
  statusResolved: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    color: '#047857'
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    color: '#B45309'
  },
  arrestedTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#93C5FD'
  }
});

export default LocationCrimeModal;
