import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SafetyProvider } from './src/context/SafetyContext';
import { EmergencyProvider } from './src/context/EmergencyContext';
import { RouteNavigatorScreen } from './src/screens/RouteNavigatorScreen';
import { ZoneExplorerScreen } from './src/screens/ZoneExplorerScreen';
import { SafetyAnalyticsScreen } from './src/screens/SafetyAnalyticsScreen';
import { FakeCallScreen } from './src/screens/FakeCallScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { FakeCallModal } from './src/components/FakeCall/FakeCallModal';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from './src/theme/hudTheme';

type NavTab = 'navigator' | 'explorer' | 'analytics' | 'fakecall' | 'settings';

const AppContent: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [currentTab, setCurrentTab] = useState<NavTab>('navigator');

  const navItems: { id: NavTab; label: string; icon: string; badge?: string }[] = [
    { id: 'navigator', label: 'SAFE NAVIGATION', icon: '🧭', badge: 'HUD' },
    { id: 'explorer', label: 'ZONE EXPLORER', icon: '🗺️' },
    { id: 'analytics', label: 'CRIME INTEL', icon: '📊' },
    { id: 'fakecall', label: 'FAKE CALL', icon: '📞' },
    { id: 'settings', label: 'PREFERENCES', icon: '⚙️' },
  ];

  return (
    <View style={styles.appShell}>
      <StatusBar barStyle="dark-content" backgroundColor={HUD_COLORS.canvas} />

      {/* Desktop Navigation Sidebar (>= 768px): Neo-Brutalist Tactical HUD */}
      {isDesktop && (
        <View style={styles.desktopSidebar}>
          {/* Brand Logo */}
          <View style={styles.sidebarBrand}>
            <View style={[styles.sidebarLogoIcon, HUD_SHADOWS.hardSm]}>
              <Text style={{ fontSize: 22 }}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.sidebarTag}>[VER 2.5 // TACTICAL]</Text>
              <Text style={styles.sidebarTitle}>GEOSAFE</Text>
              <Text style={styles.sidebarSub}>Risk-Aware Transit HUD</Text>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.sidebarNavList}>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sidebarNavItem,
                    isActive && styles.sidebarNavItemActive,
                    isActive ? HUD_SHADOWS.hardSm : {}
                  ]}
                  onPress={() => setCurrentTab(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
                  <Text style={[styles.sidebarNavText, isActive && styles.sidebarNavTextActive]}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.navArrow, isActive && styles.navArrowActive]}>↗</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sidebar Footer */}
          <View style={styles.sidebarFooter}>
            <View style={styles.engineStatusRow}>
              <View style={styles.engineDot} />
              <Text style={styles.engineText}>MAPTILER HUD ENGINE LIVE</Text>
            </View>
            <Text style={styles.creditsText}>Mumbai & Delhi Crime Corridors</Text>
          </View>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mainViewport}>
        {currentTab === 'navigator' && <RouteNavigatorScreen />}
        {currentTab === 'explorer' && (
          <ZoneExplorerScreen onNavigateToNavigator={() => setCurrentTab('navigator')} />
        )}
        {currentTab === 'analytics' && <SafetyAnalyticsScreen />}
        {currentTab === 'fakecall' && <FakeCallScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Mobile Bottom Navigation Bar (< 768px): Sharp 3px Black Border */}
      {!isDesktop && (
        <SafeAreaView style={styles.mobileBottomNavSafeArea}>
          <View style={styles.mobileBottomNav}>
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.mobileNavItem, isActive && styles.mobileNavItemActive]}
                  onPress={() => setCurrentTab(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mobileNavIcon}>{item.icon}</Text>
                  <Text style={[styles.mobileNavLabel, isActive && styles.mobileNavLabelActive]}>
                    {item.label.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      )}

      {/* Global Realistic Incoming Call Screen Modal */}
      <FakeCallModal />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </SafetyProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas,
    flexDirection: 'row'
  },
  desktopSidebar: {
    width: 270,
    backgroundColor: HUD_COLORS.canvas,
    borderRightWidth: 3,
    borderRightColor: HUD_COLORS.borderBlack,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between'
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  sidebarLogoIcon: {
    width: 46,
    height: 46,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.clay,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sidebarTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  sidebarSub: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted
  },
  sidebarNavList: {
    gap: 10,
    flex: 1
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10
  },
  sidebarNavItemActive: {
    backgroundColor: '#000000',
    borderColor: '#000000'
  },
  sidebarNavIcon: {
    fontSize: 18
  },
  sidebarNavText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5,
    flex: 1
  },
  sidebarNavTextActive: {
    color: '#FFFFFF'
  },
  mainBadge: {
    backgroundColor: HUD_COLORS.clay,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000'
  },
  mainBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono
  },
  navArrow: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#A3A3A3'
  },
  navArrowActive: {
    color: HUD_COLORS.clay
  },
  sidebarFooter: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: HUD_COLORS.borderBlack
  },
  engineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  engineDot: {
    width: 8,
    height: 8,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.riskLow,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack
  },
  engineText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  creditsText: {
    fontSize: 10,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted
  },
  mainViewport: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  mobileBottomNavSafeArea: {
    backgroundColor: HUD_COLORS.canvas,
    borderTopWidth: 3,
    borderTopColor: HUD_COLORS.borderBlack
  },
  mobileBottomNav: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: HUD_COLORS.canvas,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  mobileNavItem: {
    alignItems: 'center',
    paddingVertical: 6,
    flex: 1,
    borderTopWidth: 3,
    borderTopColor: 'transparent'
  },
  mobileNavItemActive: {
    borderTopColor: HUD_COLORS.clay,
    backgroundColor: '#F0EEE8'
  },
  mobileNavIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  mobileNavLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: HUD_COLORS.textMuted
  },
  mobileNavLabelActive: {
    color: HUD_COLORS.textBlack,
    fontWeight: '900'
  }
});
