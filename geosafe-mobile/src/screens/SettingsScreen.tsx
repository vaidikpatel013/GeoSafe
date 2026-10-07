import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { useEmergency } from '../context/EmergencyContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

export const SettingsScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { cityFilter, selectCity } = useSafety();
  const { fakeCallSettings, updateFakeCallSettings } = useEmergency();

  const [name, setName] = useState(user?.name || 'Ananya Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '+91 91234 56789');

  const [callerName, setCallerName] = useState(fakeCallSettings.callerName);
  const [callerNumber, setCallerNumber] = useState(fakeCallSettings.callerNumber);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    await updateProfile(name, phone, emergencyContact);
    updateFakeCallSettings({ callerName, callerNumber });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (Platform.OS !== 'web') {
      Alert.alert('Settings Updated', 'Preferences have been saved.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Neo-Brutalist Tactical HUD */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, HUD_SHADOWS.hardSm]}>
            <Text style={styles.brandBadgeIcon}>⚙️</Text>
          </View>
          <View>
            <Text style={styles.headerTag}>[CONFIGURATION // SYSTEM_PREFS]</Text>
            <Text style={styles.headerTitle}>SYSTEM PREFERENCES</Text>
            <Text style={styles.headerSubtitle}>
              Default Metros & Emergency Contact Parameters
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedSuccess && (
          <View style={[styles.successBanner, HUD_SHADOWS.hard]}>
            <Text style={styles.successText}>[OK] PREFERENCES SUCCESSFULLY COMMITTED</Text>
          </View>
        )}

        {/* Default City Preference */}
        <View style={[styles.card, HUD_SHADOWS.hard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTag}>[METRO SELECTION]</Text>
            <Text style={styles.cardTitle}>DEFAULT METROPOLITAN HUB</Text>
            <Text style={styles.cardSubtitle}>
              Active Metro Hub: <Text style={styles.activeHubText}>{cityFilter.toUpperCase()}</Text>
            </Text>
          </View>

          <View style={styles.cityButtonGroup}>
            <TouchableOpacity
              style={[
                styles.cityBtn,
                cityFilter === 'Mumbai' && styles.cityBtnActive,
                HUD_SHADOWS.hardSm
              ]}
              onPress={() => selectCity('Mumbai')}
              activeOpacity={0.8}
            >
              <Text style={styles.cityBtnIcon}>🏙️</Text>
              <Text style={[styles.cityBtnText, cityFilter === 'Mumbai' && styles.cityBtnTextActive]}>
                MUMBAI HUB
              </Text>
              <Text style={[styles.cityBtnSub, cityFilter === 'Mumbai' && styles.cityBtnSubActive]}>
                Andheri, Bandra, BKC, Colaba, Marine Drive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cityBtn,
                cityFilter === 'Delhi' && styles.cityBtnActive,
                HUD_SHADOWS.hardSm
              ]}
              onPress={() => selectCity('Delhi')}
              activeOpacity={0.8}
            >
              <Text style={styles.cityBtnIcon}>🏛️</Text>
              <Text style={[styles.cityBtnText, cityFilter === 'Delhi' && styles.cityBtnTextActive]}>
                DELHI NCR HUB
              </Text>
              <Text style={[styles.cityBtnSub, cityFilter === 'Delhi' && styles.cityBtnSubActive]}>
                CP, Lajpat, Saket, Rohini, Dwarka
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile */}
        <View style={[styles.card, HUD_SHADOWS.hard]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTag}>[OPERATOR TELEMETRY]</Text>
            <Text style={styles.cardTitle}>USER PROFILE & DISPATCH TARGET</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>OPERATOR FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ananya Sharma"
              placeholderTextColor="#737373"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>OPERATOR CELLULAR PHONE</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor="#737373"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PRIMARY EMERGENCY CONTACT (1-TAP SOS DISPATCH)</Text>
            <TextInput
              style={[styles.input, styles.highlightInput]}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="+91 91234 56789"
              placeholderTextColor="#737373"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>CUSTOM FAKE CALLER NAME</Text>
            <TextInput
              style={styles.input}
              value={callerName}
              onChangeText={setCallerName}
              placeholder="e.g. Mom"
              placeholderTextColor="#737373"
            />
          </View>
        </View>

        {/* Save Button: Heavy Hard Shadow Block Trigger */}
        <TouchableOpacity
          style={[styles.saveButton, HUD_SHADOWS.hardLg]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>COMMIT PREFERENCES ↗</Text>
        </TouchableOpacity>

        {/* Academic Project Credits: Dark Tactical Surface */}
        <View style={[styles.academicFooter, HUD_SHADOWS.hard]}>
          <Text style={styles.academicTitle}>GEOSAFE: RISK-AWARE TRANSIT INTELLIGENCE</Text>
          <Text style={styles.academicDetails}>
            Urban Safety Analytics & Multi-Criteria Directions by Composite Risk Index{'\n'}
          </Text>
        </View>
      </ScrollView>
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
    borderBottomColor: HUD_COLORS.borderBlack
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
  successBanner: {
    backgroundColor: HUD_COLORS.riskLow,
    padding: 14,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    alignItems: 'center'
  },
  successText: {
    color: '#000000',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5
  },
  card: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 18,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  cardHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8,
    marginBottom: 12
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
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5,
    marginTop: 2
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 4
  },
  activeHubText: {
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    color: HUD_COLORS.clay
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.riskLow,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack
  },
  statusDotInactive: {
    backgroundColor: HUD_COLORS.riskMod
  },
  statusLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  statusExplanation: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    lineHeight: 16,
    marginTop: 4
  },
  cityButtonGroup: {
    flexDirection: 'row',
    gap: 12
  },
  cityBtn: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderRadius: 0,
    padding: 14,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    alignItems: 'center'
  },
  cityBtnActive: {
    backgroundColor: '#000000'
  },
  cityBtnIcon: {
    fontSize: 28,
    marginBottom: 6
  },
  cityBtnText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  cityBtnTextActive: {
    color: '#FFFFFF'
  },
  cityBtnSub: {
    fontSize: 10,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center'
  },
  cityBtnSubActive: {
    color: '#D4D4D4'
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#FAF9F6',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: HUD_FONTS.mono,
    color: HUD_COLORS.textBlack,
    fontSize: 13
  },
  highlightInput: {
    borderLeftWidth: 4,
    borderLeftColor: HUD_COLORS.clay
  },
  saveButton: {
    backgroundColor: HUD_COLORS.clay,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  },
  academicFooter: {
    backgroundColor: HUD_COLORS.surfaceDark,
    borderRadius: 0,
    padding: 18,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    alignItems: 'center'
  },
  academicTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1,
    marginBottom: 4
  },
  academicTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5
  },
  academicDetails: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 18
  }
});

export default SettingsScreen;
