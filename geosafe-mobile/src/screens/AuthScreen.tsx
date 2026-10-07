import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

export const AuthScreen: React.FC = () => {
  const { user, signInAnonymous, signInWithEmail, updateProfile, logOut } = useAuth();

  const [authMode, setAuthMode] = useState<'anonymous' | 'email'>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInAnonymous();
    } catch (err: any) {
      setErrorMsg(err.message || 'Anonymous sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInWithEmail(email, password, name, emergencyContact);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!emergencyContact.trim()) {
      setErrorMsg('Please specify an emergency contact number');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await updateProfile(name, phone, emergencyContact);
      if (Platform.OS !== 'web') {
        Alert.alert('Profile Saved', 'Emergency contact successfully configured.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed saving profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.iconSquare, HUD_SHADOWS.hard]}>
            <Text style={styles.brandIcon}>🛡️</Text>
          </View>
          <Text style={styles.hudVersionTag}>[SECURITY CONSOLE // AUTH GATEWAY]</Text>
          <Text style={styles.appName}>GEOSAFE</Text>
          <Text style={styles.tagline}>
            Urban Safety Analytics & Real-Time Emergency Response System
          </Text>
          <Text style={styles.academicSubtitle}>
            Final Year Academic Project • Mumbai & Delhi Crime Risk Models
          </Text>
        </View>

        {/* If user is already authenticated, show Profile Form */}
        {user ? (
          <View style={[styles.card, HUD_SHADOWS.hardLg]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>[OPERATOR CREDENTIALS]</Text>
              <Text style={styles.cardTitle}>EMERGENCY PROFILE</Text>
              <Text style={styles.cardSubtitle}>
                Configure guardian contact telemetry for rapid 1-tap SOS dispatch
              </Text>
            </View>

            {errorMsg && <Text style={styles.errorText}>⚠️ [ERROR]: {errorMsg}</Text>}

            <View style={styles.formGroup}>
              <Text style={styles.label}>OPERATOR FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ananya Sharma"
                placeholderTextColor="#737373"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>CELLULAR PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#737373"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>PRIMARY EMERGENCY GUARDIAN PHONE *</Text>
              <TextInput
                style={[styles.input, styles.highlightInput]}
                placeholder="+91 91234 56789 (Parent / Guardian)"
                placeholderTextColor="#737373"
                keyboardType="phone-pad"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
              <Text style={styles.helperText}>
                Automated SMS & live GPS streaming telemetry links broadcast to this number upon SOS trigger.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, HUD_SHADOWS.hard]}
              onPress={handleSaveProfile}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>COMMIT EMERGENCY PROFILE ↗</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, HUD_SHADOWS.hardSm]}
              onPress={logOut}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                SIGN OUT [{user.uid.substring(0, 8).toUpperCase()}] ✕
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Sign In Form */
          <View style={[styles.card, HUD_SHADOWS.hardLg]}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, authMode === 'anonymous' && styles.tabActive]}
                onPress={() => setAuthMode('anonymous')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    authMode === 'anonymous' && styles.tabTextActive
                  ]}
                >
                  DEMO GUEST ↗
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, authMode === 'email' && styles.tabActive]}
                onPress={() => setAuthMode('email')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    authMode === 'email' && styles.tabTextActive
                  ]}
                >
                  EMAIL / AUTH ↗
                </Text>
              </TouchableOpacity>
            </View>

            {errorMsg && <Text style={styles.errorText}>⚠️ [AUTH ERROR]: {errorMsg}</Text>}

            {authMode === 'anonymous' ? (
              <View style={styles.anonymousContainer}>
                <Text style={styles.anonymousDesc}>
                  Enter instantly without credentials. Perfect for testing, evaluation, and instant emergency dispatch telemetry.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryButton, HUD_SHADOWS.hard]}
                  onPress={handleAnonymousSignIn}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>ENTER GEOSAFE AS GUEST ↗</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emailFormContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="user@geosafe.org"
                    placeholderTextColor="#737373"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#737373"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>OPERATOR FULL NAME (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ananya Sharma"
                    placeholderTextColor="#737373"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>GUARDIAN EMERGENCY PHONE (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 91234 56789"
                    placeholderTextColor="#737373"
                    keyboardType="phone-pad"
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, HUD_SHADOWS.hard]}
                  onPress={handleEmailSignIn}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>AUTHENTICATE OPERATOR ↗</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  iconSquare: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.clay,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  brandIcon: {
    fontSize: 32
  },
  hudVersionTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1,
    marginBottom: 2
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  tagline: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320
  },
  academicSubtitle: {
    fontSize: 10,
    fontFamily: HUD_FONTS.mono,
    color: HUD_COLORS.clay,
    marginTop: 6,
    fontWeight: '700'
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 24,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  cardHeader: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 8
  },
  cardTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  cardTitle: {
    fontSize: 20,
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
    marginTop: 2
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE8E2',
    borderRadius: 0,
    padding: 3,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  tabText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  anonymousContainer: {
    alignItems: 'center',
    paddingVertical: 8
  },
  anonymousDesc: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  emailFormContainer: {
    gap: 12
  },
  formGroup: {
    marginBottom: 12
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
    fontSize: 13,
    color: HUD_COLORS.textBlack
  },
  highlightInput: {
    borderLeftWidth: 4,
    borderLeftColor: HUD_COLORS.clay
  },
  helperText: {
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    fontSize: 10,
    color: HUD_COLORS.textMuted,
    marginTop: 4
  },
  primaryButton: {
    backgroundColor: HUD_COLORS.borderBlack,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  secondaryButtonText: {
    color: HUD_COLORS.textBlack,
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  errorText: {
    fontFamily: HUD_FONTS.mono,
    color: HUD_COLORS.riskHigh,
    fontSize: 11,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '800'
  }
});

export default AuthScreen;
