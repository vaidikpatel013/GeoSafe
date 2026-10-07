import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking
} from 'react-native';
import { ActiveEmergency } from '../../types';
import { emergencyService } from '../../services/EmergencyService';
import { SafeZoneMap } from '../Map/SafeZoneMap';
import { useSafety } from '../../context/SafetyContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../../theme/hudTheme';

interface GuardianTrackingViewProps {
  emergencyId?: string | null;
  onClose?: () => void;
}

export const GuardianTrackingView: React.FC<GuardianTrackingViewProps> = ({
  emergencyId,
  onClose
}) => {
  const { zones } = useSafety();
  const [activeEmergencies, setActiveEmergencies] = useState<ActiveEmergency[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<ActiveEmergency | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Listen to all active emergencies
    const unsub = emergencyService.subscribeToActiveEmergencies((list) => {
      setActiveEmergencies(list);

      if (emergencyId) {
        const found = list.find(e => e.emergency_id === emergencyId);
        if (found) {
          setSelectedEmergency(found);
          return;
        }
      }

      if (list.length > 0 && !selectedEmergency) {
        setSelectedEmergency(list[0]);
      } else if (list.length === 0) {
        setSelectedEmergency(null);
      }
    });

    return unsub;
  }, [emergencyId]);

  // Keep selected emergency updated in real-time
  useEffect(() => {
    if (!selectedEmergency) return;
    const unsub = emergencyService.subscribeToEmergency(
      selectedEmergency.emergency_id,
      (updated) => {
        if (updated) {
          setSelectedEmergency(updated);
        }
      }
    );
    return unsub;
  }, [selectedEmergency?.emergency_id]);

  const handleShare = async () => {
    if (!selectedEmergency) return;
    const trackingUrl = `https://geosafe-response.app/track/${selectedEmergency.emergency_id}?lat=${selectedEmergency.current_lat}&lng=${selectedEmergency.current_lng}`;
    try {
      await Share.share({
        message: `🚨 GEOSAFE EMERGENCY ALERT: Immediate assistance requested. Live GPS Tracker: ${trackingUrl}`
      });
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {}
  };

  const handleCallEmergencyContact = () => {
    if (selectedEmergency?.emergency_contact) {
      Linking.openURL(`tel:${selectedEmergency.emergency_contact}`);
    } else if (selectedEmergency?.user_phone) {
      Linking.openURL(`tel:${selectedEmergency.user_phone}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header bar: Neo-Brutalist Tactical HUD */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>[GUARDIAN RESPONSE // STREAM]</Text>
          <Text style={styles.headerTitle}>GUARDIAN LIVE RESPONSE</Text>
          <Text style={styles.headerSubtitle}>Real-Time GPS Telemetry Stream & Dispatch Network</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            style={[styles.closeButton, HUD_SHADOWS.hardSm]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>CLOSE ✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emergency Selector Pill list if multiple emergencies exist */}
      {activeEmergencies.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {activeEmergencies.map((em) => (
            <TouchableOpacity
              key={em.emergency_id}
              style={[
                styles.selectorPill,
                selectedEmergency?.emergency_id === em.emergency_id && styles.selectorPillActive
              ]}
              onPress={() => setSelectedEmergency(em)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.selectorText,
                  selectedEmergency?.emergency_id === em.emergency_id && styles.selectorTextActive
                ]}
              >
                🚨 {em.user_name?.toUpperCase() || em.emergency_id.slice(0, 8)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedEmergency ? (
        <View style={styles.body}>
          {/* Status banner: Inverted High-Contrast Alert Box */}
          <View style={[styles.statusBanner, HUD_SHADOWS.hard]}>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.beaconDot} />
              <Text style={styles.liveBannerText}>
                {selectedEmergency.status === 'ACTIVE'
                  ? 'LIVE GPS TRACKING STREAM ENGAGED'
                  : 'EMERGENCY PROTOCOL RESOLVED'}
              </Text>
            </View>
            <Text style={styles.timeUpdated}>
              INTERVAL: 5000ms • UPDATED {new Date().toLocaleTimeString()}
            </Text>
          </View>

          {/* Victim Details Card */}
          <View style={[styles.victimCard, HUD_SHADOWS.hard]}>
            <View style={styles.victimRow}>
              <View>
                <Text style={styles.victimName}>
                  {selectedEmergency.user_name?.toUpperCase() || 'PROTECTED USER'}
                </Text>
                <Text style={styles.victimId}>
                  TELEMETRY ID: {selectedEmergency.emergency_id}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.shareButton, HUD_SHADOWS.hardSm]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.shareButtonText}>
                  {copiedLink ? 'SENT ✓' : 'SHARE TRACKER ↗'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Monospace GPS Coordinates Grid */}
            <View style={styles.coordsRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <Text style={styles.coordValue}>{selectedEmergency.current_lat.toFixed(5)}°N</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <Text style={styles.coordValue}>{selectedEmergency.current_lng.toFixed(5)}°E</Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>WAYPOINTS</Text>
                <Text style={styles.coordValue}>
                  {selectedEmergency.history?.length || 1} PTS
                </Text>
              </View>
            </View>

            {/* Quick Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.callButton, HUD_SHADOWS.hardSm]}
                onPress={handleCallEmergencyContact}
                activeOpacity={0.8}
              >
                <Text style={styles.callButtonText}>📞 CALL EMERGENCY CONTACT ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resolveButton, HUD_SHADOWS.hardSm]}
                onPress={() => emergencyService.resolveEmergency(selectedEmergency.emergency_id)}
                activeOpacity={0.8}
              >
                <Text style={styles.resolveButtonText}>RESOLVE [SAFE] ↗</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Real-time Map with moving Emergency Marker: Framed in 3px Black Border */}
          <View style={[styles.mapWrapper, HUD_SHADOWS.hardLg]}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.mapSectionTitle}>[TACTICAL HUD MAP // GUARDIAN RADAR]</Text>
              <Text style={styles.mapStatusLive}>STREAMING</Text>
            </View>
            <SafeZoneMap
              userLocation={{
                latitude: selectedEmergency.current_lat,
                longitude: selectedEmergency.current_lng
              }}
              zones={zones}
              activeEmergency={selectedEmergency}
              height={340}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.emptyState, HUD_SHADOWS.hard]}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTag}>[STANDBY PROTOCOL]</Text>
          <Text style={styles.emptyTitle}>NO ACTIVE SOS DISPATCHES</Text>
          <Text style={styles.emptyText}>
            When a user engages the HOLD FOR SOS trigger, their live coordinates and streaming risk telemetry will broadcast immediately to this console.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack,
    paddingBottom: 10
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
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  closeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  selectorScroll: {
    marginBottom: 14
  },
  selectorPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    marginRight: 8
  },
  selectorPillActive: {
    backgroundColor: HUD_COLORS.riskHigh
  },
  selectorText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  selectorTextActive: {
    color: '#FFFFFF'
  },
  body: {
    gap: 16
  },
  statusBanner: {
    backgroundColor: HUD_COLORS.surfaceDark,
    borderWidth: 2,
    borderColor: HUD_COLORS.riskHigh,
    borderRadius: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  beaconDot: {
    width: 10,
    height: 10,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.riskHigh
  },
  liveBannerText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5
  },
  timeUpdated: {
    fontFamily: HUD_FONTS.mono,
    color: '#A3A3A3',
    fontSize: 9,
    fontWeight: '700'
  },
  victimCard: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  victimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8
  },
  victimName: {
    fontSize: 18,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  victimId: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  shareButton: {
    backgroundColor: HUD_COLORS.clay,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900'
  },
  coordsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    borderRadius: 0,
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  coordBox: {
    alignItems: 'center',
    flex: 1
  },
  coordLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    color: HUD_COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  coordValue: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10
  },
  callButton: {
    flex: 1,
    backgroundColor: HUD_COLORS.borderBlack,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  callButtonText: {
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
    borderColor: HUD_COLORS.borderBlack
  },
  resolveButtonText: {
    color: '#000000',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5
  },
  mapWrapper: {
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  mapHeaderRow: {
    backgroundColor: HUD_COLORS.surfaceDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  mapSectionTitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  mapStatusLive: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.riskLow
  },
  emptyState: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8
  },
  emptyTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1,
    marginBottom: 4
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    marginBottom: 8,
    letterSpacing: -0.5
  },
  emptyText: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 360
  }
});

export default GuardianTrackingView;
