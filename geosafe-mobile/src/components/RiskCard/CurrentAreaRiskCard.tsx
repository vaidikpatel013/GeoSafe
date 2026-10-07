import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafetyZone } from '../../types';
import { safetyZoneService } from '../../services/SafetyZoneService';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../../theme/hudTheme';

interface CurrentAreaRiskCardProps {
  zone: SafetyZone | null;
  distanceKm?: number;
  onRefresh?: () => void;
  onViewCrimeDossier?: () => void;
}

export const CurrentAreaRiskCard: React.FC<CurrentAreaRiskCardProps> = ({
  zone,
  distanceKm,
  onRefresh,
  onViewCrimeDossier
}) => {
  if (!zone) {
    return (
      <View style={[styles.card, HUD_SHADOWS.hard]}>
        <Text style={styles.telemetryTag}>[HUD // SECTOR_ANALYSIS]</Text>
        <Text style={styles.loadingText}>INITIALIZING REGIONAL SAFETY TELEMETRY...</Text>
      </View>
    );
  }

  const riskColor = safetyZoneService.getRiskColor(zone.risk_category);
  const scorePercent = ((zone.avg_risk_score - 1) / 4) * 100;

  const isLow = zone.risk_category === 'Low Risk';
  const isMod = zone.risk_category === 'Moderate Risk';

  const badgeBg = isLow ? HUD_COLORS.riskLow : isMod ? HUD_COLORS.riskMod : HUD_COLORS.riskHigh;
  const badgeTextColor = isMod ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.card, HUD_SHADOWS.hard]}>
      {/* Tactical HUD Header Tag */}
      <View style={styles.hudMetaRow}>
        <Text style={styles.telemetryTag}>[LIVE HUD TELEMETRY]</Text>
        {distanceKm !== undefined && (
          <Text style={styles.distanceBadge}>DIST: {distanceKm.toFixed(1)} KM</Text>
        )}
      </View>

      {/* Top Header: Location, City, and Live Distance */}
      <View style={styles.headerRow}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>{zone.Location.toUpperCase()}</Text>
          <Text style={styles.citySubtitle}>
            {zone.City} • {zone.Time_of_Day} Interval Exposure
          </Text>
        </View>

        {/* Solid Block Risk Category Badge with 2px Black Border */}
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {isLow ? '🟢 LOW' : isMod ? '🟡 MOD' : '🔴 HIGH'}
          </Text>
        </View>
      </View>

      {/* Large Monospace Score Section */}
      <View style={styles.scoreSection}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>COMPOSITE RISK INDEX</Text>
          <View style={styles.scoreValueContainer}>
            <Text style={[styles.scoreValue, { color: riskColor }]}>
              {zone.avg_risk_score.toFixed(2)}
            </Text>
            <Text style={styles.scoreMax}> / 5.00</Text>
          </View>
        </View>

        {/* Sharp Raw Progress Bar with 2px Black Border */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(8, scorePercent))}%`, backgroundColor: riskColor }
            ]}
          />
        </View>
      </View>

      {/* Grid: Hard-Bordered Metric Tiles */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🎥</Text>
          <View>
            <Text style={styles.statValue}>{zone.avg_cctv.toFixed(1)}</Text>
            <Text style={styles.statLabel}>AVG CCTV</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🚓</Text>
          <View>
            <Text style={styles.statValue}>{zone.avg_police_stations.toFixed(1)}</Text>
            <Text style={styles.statLabel}>STATIONS</Text>
          </View>
        </View>

        {zone.total_incidents !== undefined && (
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>📊</Text>
            <View>
              <Text style={styles.statValue}>{zone.total_incidents}</Text>
              <Text style={styles.statLabel}>INCIDENTS</Text>
            </View>
          </View>
        )}
      </View>

      {/* Safety Advisory Note: Neo-Brutalist Callout Box */}
      <View style={styles.advisoryBox}>
        <Text style={styles.advisoryTag}>ADVISORY PROTOCOL // </Text>
        <Text style={styles.advisoryText}>
          {zone.avg_risk_score > 3.2
            ? 'High caution advised after dark. Transit via lit corridors and keep emergency dispatch armed.'
            : zone.avg_risk_score > 2.2
            ? 'Moderate risk density. Maintain situational awareness and prefer monitored transit hubs.'
            : 'Optimal security zone. High surveillance density and rapid response coverage.'}
        </Text>
      </View>

      {/* Crime Incident Dossier Trigger Button */}
      {onViewCrimeDossier && (
        <TouchableOpacity
          style={[styles.dossierButton, HUD_SHADOWS.hardSm]}
          onPress={onViewCrimeDossier}
          activeOpacity={0.8}
        >
          <Text style={styles.dossierButtonIcon}>📋</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dossierButtonTag}>[CRIME DOSSIER ARCHIVE]</Text>
            <Text style={styles.dossierButtonText}>
              INSPECT RECORDED CRIMES, DATES & CCTV TELEMETRY ↗
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -28,
    zIndex: 10
  },
  hudMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 4
  },
  telemetryTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  distanceBadge: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: HUD_COLORS.textBlack,
    backgroundColor: '#F0EFEA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack
  },
  loadingText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: HUD_COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 14
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  locationContainer: {
    flex: 1,
    paddingRight: 10
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5,
    textTransform: 'uppercase'
  },
  citySubtitle: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  badgeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  scoreSection: {
    marginBottom: 14,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 10
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  },
  scoreLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    color: HUD_COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  scoreValue: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 22,
    fontWeight: '900'
  },
  scoreMax: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 12,
    color: HUD_COLORS.textMuted,
    fontWeight: '700'
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#EAE8E2',
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack,
    borderRadius: 0,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 0
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  statIcon: {
    fontSize: 16
  },
  statValue: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 14,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  statLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    color: HUD_COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  advisoryBox: {
    borderLeftWidth: 3,
    borderLeftColor: HUD_COLORS.clay,
    backgroundColor: '#F5F3EF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  advisoryTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: HUD_COLORS.clay,
    marginBottom: 2
  },
  advisoryText: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textBlack,
    lineHeight: 16
  },
  dossierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    padding: 10,
    marginTop: 10
  },
  dossierButtonIcon: {
    fontSize: 20
  },
  dossierButtonTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 0.8
  },
  dossierButtonText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    marginTop: 2
  }
});

export default CurrentAreaRiskCard;
