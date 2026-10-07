import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useEmergency } from '../../context/EmergencyContext';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../../theme/hudTheme';

export const FakeCallModal: React.FC = () => {
  const {
    isFakeCallIncoming,
    isFakeCallConnected,
    fakeCallSettings,
    acceptFakeCall,
    declineFakeCall
  } = useEmergency();

  const [callDuration, setCallDuration] = useState(0);

  // Timer counter for connected call
  useEffect(() => {
    let interval: any = null;
    if (isFakeCallConnected) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFakeCallConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVisible = isFakeCallIncoming || isFakeCallConnected;

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={HUD_COLORS.surfaceDark} />

        {/* Top Caller Info: Stark High-Contrast Typography */}
        <View style={styles.callerInfoContainer}>
          <Text style={styles.callTypeLabel}>
            {isFakeCallConnected
              ? '[CELLULAR PROTOCOL // CONNECTED]'
              : '[CELLULAR PROTOCOL // INCOMING RING]'}
          </Text>
          <Text style={styles.callerName}>{fakeCallSettings.callerName.toUpperCase()}</Text>
          <Text style={styles.callerNumber}>
            {isFakeCallConnected
              ? `DURATION: ${formatDuration(callDuration)}`
              : fakeCallSettings.callerNumber}
          </Text>
        </View>

        {/* Caller Avatar: Sharp Brutalist Tile */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarSquare, HUD_SHADOWS.hardClay]}>
            <Text style={styles.avatarLetter}>
              {fakeCallSettings.callerName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* In-Call Utility Grid (Active when Connected) */}
        {isFakeCallConnected ? (
          <View style={styles.inCallGrid}>
            <View style={styles.inCallGridRow}>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>🔇</Text>
                </View>
                <Text style={styles.utilityLabel}>MUTE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>🔢</Text>
                </View>
                <Text style={styles.utilityLabel}>KEYPAD</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>🔊</Text>
                </View>
                <Text style={styles.utilityLabel}>SPEAKER</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inCallGridRow}>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>➕</Text>
                </View>
                <Text style={styles.utilityLabel}>ADD CALL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>📹</Text>
                </View>
                <Text style={styles.utilityLabel}>FACETIME</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilityButton}>
                <View style={styles.utilityIconBox}>
                  <Text style={styles.utilityIcon}>👤</Text>
                </View>
                <Text style={styles.utilityLabel}>CONTACTS</Text>
              </TouchableOpacity>
            </View>

            {/* End Call Button: Ultra-tactile Block Crimson Button */}
            <View style={styles.endCallContainer}>
              <TouchableOpacity
                style={[styles.endCallBlockButton, HUD_SHADOWS.hard]}
                onPress={declineFakeCall}
                activeOpacity={0.8}
              >
                <Text style={styles.endCallText}>TERMINATE CALL [DISCONNECT] ✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Incoming Call Actions: Accept & Decline Block Buttons */
          <View style={styles.actionsContainer}>
            <View style={styles.quickUtilitiesRow}>
              <TouchableOpacity style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>⏰</Text>
                <Text style={styles.reminderLabel}>REMIND ME</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>💬</Text>
                <Text style={styles.reminderLabel}>MESSAGE</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.callResponseRow}>
              {/* Decline Button: Solid Crimson Block */}
              <TouchableOpacity
                style={[styles.declineBlockButton, HUD_SHADOWS.hard]}
                onPress={declineFakeCall}
                activeOpacity={0.8}
              >
                <Text style={styles.declineIcon}>📞</Text>
                <Text style={styles.responseButtonText}>DECLINE ✕</Text>
              </TouchableOpacity>

              {/* Accept Button: Solid Emerald Block */}
              <TouchableOpacity
                style={[styles.acceptBlockButton, HUD_SHADOWS.hard]}
                onPress={acceptFakeCall}
                activeOpacity={0.8}
              >
                <Text style={[styles.acceptIcon, { transform: [{ rotate: '135deg' }] }]}>
                  📞
                </Text>
                <Text style={styles.responseButtonTextAccept}>ACCEPT ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HUD_COLORS.surfaceDark,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  callerInfoContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  callTypeLabel: {
    fontFamily: HUD_FONTS.mono,
    color: HUD_COLORS.clay,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6
  },
  callerNumber: {
    fontFamily: HUD_FONTS.mono,
    color: '#D4D4D4',
    fontSize: 14,
    fontWeight: '700'
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  avatarSquare: {
    width: 120,
    height: 120,
    borderRadius: 0,
    backgroundColor: '#1E1E1E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 54,
    fontWeight: '900'
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 20
  },
  quickUtilitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30
  },
  reminderButton: {
    alignItems: 'center'
  },
  reminderIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  reminderLabel: {
    fontFamily: HUD_FONTS.mono,
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '700'
  },
  callResponseRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%'
  },
  declineBlockButton: {
    flex: 1,
    backgroundColor: HUD_COLORS.riskHigh,
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    flexDirection: 'row',
    gap: 8
  },
  acceptBlockButton: {
    flex: 1,
    backgroundColor: HUD_COLORS.riskLow,
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    flexDirection: 'row',
    gap: 8
  },
  declineIcon: {
    fontSize: 20,
    color: '#FFFFFF'
  },
  acceptIcon: {
    fontSize: 20,
    color: '#000000'
  },
  responseButtonText: {
    fontFamily: HUD_FONTS.mono,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  responseButtonTextAccept: {
    fontFamily: HUD_FONTS.mono,
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  inCallGrid: {
    width: '100%',
    paddingBottom: 20
  },
  inCallGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 18
  },
  utilityButton: {
    alignItems: 'center',
    width: 80
  },
  utilityIconBox: {
    width: 54,
    height: 54,
    backgroundColor: '#262626',
    borderWidth: 2,
    borderColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  utilityIcon: {
    fontSize: 22
  },
  utilityLabel: {
    fontFamily: HUD_FONTS.mono,
    color: '#A3A3A3',
    fontSize: 9,
    fontWeight: '800'
  },
  endCallContainer: {
    width: '100%',
    marginTop: 10
  },
  endCallBlockButton: {
    backgroundColor: HUD_COLORS.riskHigh,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    width: '100%'
  },
  endCallText: {
    fontFamily: HUD_FONTS.mono,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1
  }
});

export default FakeCallModal;
