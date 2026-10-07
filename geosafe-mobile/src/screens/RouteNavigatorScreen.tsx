import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { useSafety } from '../context/SafetyContext';
import { routingService, RouteCalculationResult, RouteOption } from '../services/RoutingService';
import { SafeZoneMap } from '../components/Map/SafeZoneMap';
import { TimeOfDay } from '../types';
import { HUD_COLORS, HUD_FONTS, HUD_SHADOWS } from '../theme/hudTheme';

export const RouteNavigatorScreen: React.FC = () => {
  const { cityFilter, selectCity, timeOfDayFilter, setTimeOfDayFilter, zones } = useSafety();

  const currentCity = cityFilter === 'All' ? 'Mumbai' : cityFilter;
  const cityLocations = zones
    .filter(z => z.City.toLowerCase() === currentCity.toLowerCase() && z.Time_of_Day === timeOfDayFilter)
    .map(z => z.Location);

  const uniqueLocations = Array.from(new Set(cityLocations));

  const [origin, setOrigin] = useState<string>('Andheri West');
  const [destination, setDestination] = useState<string>('Juhu Beach Area');

  const [selectedRouteId, setSelectedRouteId] = useState<'safe' | 'direct'>('safe');
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [navProgress, setNavProgress] = useState<number>(0);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  // Horizontal scroll refs for location selectors
  const originScrollRef = useRef<ScrollView | null>(null);
  const destScrollRef = useRef<ScrollView | null>(null);
  const originScrollX = useRef<number>(0);
  const destScrollX = useRef<number>(0);

  const scrollLocations = (
    ref: React.RefObject<ScrollView | null>,
    offsetRef: React.MutableRefObject<number>,
    direction: 'left' | 'right'
  ) => {
    const delta = direction === 'left' ? -240 : 240;
    const newX = Math.max(0, offsetRef.current + delta);
    offsetRef.current = newX;
    ref.current?.scrollTo({ x: newX, animated: true });
  };

  // Update origin/destination when city changes
  useEffect(() => {
    if (uniqueLocations.length >= 2) {
      const newOrigin = uniqueLocations.includes(origin) ? origin : uniqueLocations[0];
      let newDest = destination;
      if (!uniqueLocations.includes(destination) || newDest === newOrigin) {
        if (currentCity === 'Mumbai' && uniqueLocations.includes('Juhu Beach Area') && newOrigin !== 'Juhu Beach Area') {
          newDest = 'Juhu Beach Area';
        } else {
          newDest = uniqueLocations.find(l => l !== newOrigin) || uniqueLocations[1];
        }
      }
      if (newOrigin !== origin) setOrigin(newOrigin);
      if (newDest !== destination) setDestination(newDest);
    }
  }, [currentCity, timeOfDayFilter, zones]);

  // Calculate route whenever origin, destination, city, or time changes
  useEffect(() => {
    if (!origin || !destination || origin === destination) return;
    calculateRoute();
  }, [origin, destination, currentCity, timeOfDayFilter]);

  const calculateRoute = async () => {
    setIsCalculating(true);
    setIsNavigating(false);
    setNavProgress(0);
    try {
      const res = await routingService.calculateRoutes(
        origin,
        destination,
        currentCity,
        timeOfDayFilter as TimeOfDay
      );
      setRouteResult(res);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const startSimulation = () => {
    setIsNavigating(true);
    setNavProgress(0);
    const interval = setInterval(() => {
      setNavProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 600);
  };

  const activeRoute = routeResult
    ? selectedRouteId === 'safe'
      ? routeResult.safeRoute
      : routeResult.directRoute
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & City Switcher: Neo-Brutalist Tactical HUD */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, HUD_SHADOWS.hardSm]}>
            <Text style={styles.brandBadgeIcon}>🧭</Text>
          </View>
          <View>
            <Text style={styles.headerTag}>[ROUTING // HUD_ENGINE]</Text>
            <Text style={styles.headerTitle}>SAFE ROUTE NAVIGATOR</Text>
            <Text style={styles.headerSubtitle}>
              Risk-Meter Aware Directions & Empirical Crime Avoidance
            </Text>
          </View>
        </View>

        {/* City Toggle: Sharp Block Pills */}
        <View style={styles.cityPillGroup}>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Mumbai' && styles.cityPillActive]}
            onPress={() => selectCity('Mumbai')}
            activeOpacity={0.8}
          >
            <Text style={[styles.cityPillText, currentCity === 'Mumbai' && styles.cityPillTextActive]}>
              🏙️ MUMBAI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cityPill, currentCity === 'Delhi' && styles.cityPillActive]}
            onPress={() => selectCity('Delhi')}
            activeOpacity={0.8}
          >
            <Text style={[styles.cityPillText, currentCity === 'Delhi' && styles.cityPillTextActive]}>
              🏛️ DELHI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Selector Panel: Hard 2px Border, 4px Hard Shadow */}
        <View style={[styles.routeInputCard, HUD_SHADOWS.hard]}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.inputCardTag}>[WAYPOINT_SELECTION // {currentCity.toUpperCase()}]</Text>
          </View>

          {/* Time of Day interval: Horizontal Scroll with Indicator */}
          <View style={styles.timeFilterRow}>
            <View style={styles.transitHeaderRow}>
              <Text style={styles.timeLabel}>TRANSIT WINDOW:</Text>
              <Text style={styles.scrollHintText}>◄ SLIDE INTERVALS ►</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              persistentScrollbar={true}
              contentContainerStyle={{ paddingRight: 10 }}
            >
              {(['Night', 'Evening', 'Afternoon', 'Morning'] as const).map((tod) => (
                <TouchableOpacity
                  key={tod}
                  style={[styles.timeChip, timeOfDayFilter === tod && styles.timeChipActive]}
                  onPress={() => setTimeOfDayFilter(tod)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeChipText, timeOfDayFilter === tod && styles.timeChipTextActive]}>
                    {tod === 'Night' ? '🌙 NIGHT (1.6x RISK)' : tod === 'Evening' ? '🌇 EVENING' : tod.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location Inputs with Swap Button & Horizontal Scroll Controls */}
          <View style={styles.endpointsContainer}>
            <View style={styles.endpointsInputs}>
              {/* Point A: Origin */}
              <View style={styles.pointRow}>
                <View style={styles.pointDotOrigin} />
                <View style={styles.pointInputBox}>
                  <View style={styles.pointLabelRow}>
                    <Text style={styles.pointInputLabel}>[POINT A // ORIGIN]</Text>
                    <Text style={styles.scrollHintText}>◄ SCROLL ALL LOCATIONS ({uniqueLocations.length}) ►</Text>
                  </View>

                  <View style={styles.scrollArrowsWrapper}>
                    <TouchableOpacity
                      style={styles.scrollArrowBtn}
                      onPress={() => scrollLocations(originScrollRef, originScrollX, 'left')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scrollArrowText}>◀</Text>
                    </TouchableOpacity>

                    <ScrollView
                      ref={originScrollRef}
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      persistentScrollbar={true}
                      onScroll={(e) => { originScrollX.current = e.nativeEvent.contentOffset.x; }}
                      scrollEventThrottle={16}
                      style={styles.locationScroll}
                      contentContainerStyle={styles.locationScrollContent}
                    >
                      {uniqueLocations.map((loc) => (
                        <TouchableOpacity
                          key={`orig-${loc}`}
                          style={[styles.locPill, origin === loc && styles.locPillOriginActive]}
                          onPress={() => setOrigin(loc)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.locPillText, origin === loc && styles.locPillTextActive]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.scrollArrowBtn}
                      onPress={() => scrollLocations(originScrollRef, originScrollX, 'right')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scrollArrowText}>▶</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.connectorLine} />

              {/* Point B: Destination */}
              <View style={styles.pointRow}>
                <View style={styles.pointDotDest} />
                <View style={styles.pointInputBox}>
                  <View style={styles.pointLabelRow}>
                    <Text style={styles.pointInputLabel}>[POINT B // DESTINATION]</Text>
                    <Text style={styles.scrollHintText}>◄ SCROLL ALL LOCATIONS ({uniqueLocations.length}) ►</Text>
                  </View>

                  <View style={styles.scrollArrowsWrapper}>
                    <TouchableOpacity
                      style={styles.scrollArrowBtn}
                      onPress={() => scrollLocations(destScrollRef, destScrollX, 'left')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scrollArrowText}>◀</Text>
                    </TouchableOpacity>

                    <ScrollView
                      ref={destScrollRef}
                      horizontal
                      showsHorizontalScrollIndicator={true}
                      persistentScrollbar={true}
                      onScroll={(e) => { destScrollX.current = e.nativeEvent.contentOffset.x; }}
                      scrollEventThrottle={16}
                      style={styles.locationScroll}
                      contentContainerStyle={styles.locationScrollContent}
                    >
                      {uniqueLocations.map((loc) => (
                        <TouchableOpacity
                          key={`dest-${loc}`}
                          style={[styles.locPill, destination === loc && styles.locPillDestActive]}
                          onPress={() => setDestination(loc)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.locPillText, destination === loc && styles.locPillTextActive]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.scrollArrowBtn}
                      onPress={() => scrollLocations(destScrollRef, destScrollX, 'right')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.scrollArrowText}>▶</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Swap Button: Block Outline with Hard Shadow */}
            <TouchableOpacity
              style={[styles.swapButton, HUD_SHADOWS.hardSm]}
              onPress={handleSwap}
              activeOpacity={0.8}
            >
              <Text style={styles.swapIcon}>⇅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map with MapTiler: Framed in Sharp 3px Black Border & Hard Shadow */}
        <View style={[styles.mapContainer, HUD_SHADOWS.hardLg]}>
          <View style={styles.mapHeaderHud}>
            <Text style={styles.mapHudTag}>[TACTICAL HUD MAP // CORRIDOR DISPLAY]</Text>
            <View style={styles.mapHeaderRight}>
              <Text style={styles.mapHudScale}>GRID 1:12000</Text>
              {/* Fullscreen Expand Icon Button */}
              <TouchableOpacity
                style={[styles.expandMapButton, HUD_SHADOWS.hardSm]}
                onPress={() => setIsMapFullscreen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.expandMapIcon}>⛶</Text>
                <Text style={styles.expandMapText}>EXPAND HUD ↗</Text>
              </TouchableOpacity>
            </View>
          </View>
          {routeResult && (
            <SafeZoneMap
              userLocation={{
                latitude: routeResult.origin.lat,
                longitude: routeResult.origin.lng
              }}
              zones={zones.filter(z => z.City.toLowerCase() === currentCity.toLowerCase())}
              safeRouteWaypoints={routeResult.safeRoute.waypoints}
              directRouteWaypoints={routeResult.directRoute.waypoints}
              selectedRouteId={selectedRouteId}
              originPoint={routeResult.origin}
              destinationPoint={routeResult.destination}
              height={380}
              onToggleFullscreen={() => setIsMapFullscreen(prev => !prev)}
              isFullscreen={isMapFullscreen}
            />
          )}

          {isCalculating && (
            <View style={styles.calculatingOverlay}>
              <ActivityIndicator size="large" color={HUD_COLORS.clay} />
              <Text style={styles.calculatingText}>COMPUTING CRIME RISK CORRIDORS...</Text>
            </View>
          )}
        </View>

        {/* Route Comparison Switcher: Two Asymmetric Block Cards */}
        {routeResult && (
          <View style={styles.routeCardsContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTag}>[ANALYSIS // DUAL CORRIDOR COMPARISON]</Text>
              <Text style={styles.sectionHeading}>CALCULATED DIRECTIONS BY SAFETY RISK METER</Text>
            </View>

            {/* CARD 1: Safest Route — Solid Clay Fill with Inverted White/Clay Typography & 3px Black Border */}
            <TouchableOpacity
              style={[
                styles.safestRouteCard,
                selectedRouteId === 'safe' ? styles.safestCardActive : styles.safestCardInactive,
                selectedRouteId === 'safe' ? HUD_SHADOWS.hardLg : HUD_SHADOWS.hard
              ]}
              onPress={() => setSelectedRouteId('safe')}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeaderRibbon}>
                <View style={styles.safestBadge}>
                  <Text style={styles.safestBadgeText}>🟢 AI SHIELD ROUTE [SAFEST] ↗</Text>
                </View>
                {selectedRouteId === 'safe' && (
                  <View style={styles.selectedMarkerBadge}>
                    <Text style={styles.selectedMarkerText}>[SELECTED]</Text>
                  </View>
                )}
              </View>

              <View style={styles.routeCardTop}>
                <View style={styles.routeHeaderLeft}>
                  <Text style={styles.safestRouteTitle}>{routeResult.safeRoute.title.toUpperCase()}</Text>
                  <Text style={styles.safestRouteSub}>{routeResult.safeRoute.subtitle}</Text>
                </View>
                <View style={styles.scoreBoxSafe}>
                  <Text style={styles.scoreValueSafe}>{routeResult.safeRoute.avgRiskScore.toFixed(2)}</Text>
                  <Text style={styles.scoreScaleSafe}>/ 5.00 LOW RISK</Text>
                </View>
              </View>

              {/* Hard-Bordered Metric Tiles Grid */}
              <View style={styles.metricTilesGrid}>
                <View style={styles.metricTileClay}>
                  <Text style={styles.metricValClay}>{routeResult.safeRoute.totalDistanceKm} KM</Text>
                  <Text style={styles.metricLblClay}>DISTANCE</Text>
                </View>
                <View style={styles.metricTileClay}>
                  <Text style={styles.metricValClay}>{routeResult.safeRoute.totalDurationMins} MIN</Text>
                  <Text style={styles.metricLblClay}>EST. DURATION</Text>
                </View>
                <View style={styles.metricTileClay}>
                  <Text style={styles.metricValClay}>🎥 {routeResult.safeRoute.totalCctv}</Text>
                  <Text style={styles.metricLblClay}>CCTV CAMERAS</Text>
                </View>
                <View style={styles.metricTileClay}>
                  <Text style={styles.metricValClay}>🚓 {routeResult.safeRoute.totalPoliceStations}</Text>
                  <Text style={styles.metricLblClay}>POLICE HUBS</Text>
                </View>
              </View>

              {/* Safety exposure distribution bar */}
              <View style={styles.exposureBarContainer}>
                <View style={styles.exposureBarLabels}>
                  <Text style={styles.exposureLabelClay}>SAFE CORRIDOR EXPOSURE:</Text>
                  <Text style={styles.exposurePercentSafe}>{routeResult.safeRoute.lowRiskPercent}% LOW RISK</Text>
                </View>
                <View style={styles.exposureBarTrackClay}>
                  <View style={[styles.exposureBarFill, { width: `${routeResult.safeRoute.lowRiskPercent}%`, backgroundColor: HUD_COLORS.riskLow }]} />
                  <View style={[styles.exposureBarFill, { width: `${routeResult.safeRoute.modRiskPercent}%`, backgroundColor: HUD_COLORS.riskMod }]} />
                </View>
              </View>
            </TouchableOpacity>

            {/* CARD 2: Direct Route — Stark Off-White Card with Hard Black Outline & 4px Black Shadow */}
            <TouchableOpacity
              style={[
                styles.directRouteCard,
                selectedRouteId === 'direct' ? styles.directCardActive : styles.directCardInactive,
                selectedRouteId === 'direct' ? HUD_SHADOWS.hardLg : HUD_SHADOWS.hard
              ]}
              onPress={() => setSelectedRouteId('direct')}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeaderRibbon}>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningBadgeText}>🔴 DIRECT PATH [ELEVATED RISK] ↗</Text>
                </View>
                {selectedRouteId === 'direct' && (
                  <View style={styles.selectedMarkerBadgeDirect}>
                    <Text style={styles.selectedMarkerTextDirect}>[SELECTED]</Text>
                  </View>
                )}
              </View>

              <View style={styles.routeCardTop}>
                <View style={styles.routeHeaderLeft}>
                  <Text style={styles.directRouteTitle}>{routeResult.directRoute.title.toUpperCase()}</Text>
                  <Text style={styles.directRouteSub}>{routeResult.directRoute.subtitle}</Text>
                </View>
                <View style={styles.scoreBoxDirect}>
                  <Text style={styles.scoreValueDirect}>{routeResult.directRoute.avgRiskScore.toFixed(2)}</Text>
                  <Text style={styles.scoreScaleDirect}>/ 5.00 HIGH RISK</Text>
                </View>
              </View>

              {/* Hard-Bordered Metric Tiles Grid */}
              <View style={styles.metricTilesGridDirect}>
                <View style={styles.metricTileDirect}>
                  <Text style={styles.metricValDirect}>{routeResult.directRoute.totalDistanceKm} KM</Text>
                  <Text style={styles.metricLblDirect}>DISTANCE</Text>
                </View>
                <View style={styles.metricTileDirect}>
                  <Text style={styles.metricValDirect}>{routeResult.directRoute.totalDurationMins} MIN</Text>
                  <Text style={styles.metricLblDirect}>EST. DURATION</Text>
                </View>
                <View style={styles.metricTileDirect}>
                  <Text style={[styles.metricValDirect, { color: HUD_COLORS.riskHigh }]}>🎥 {routeResult.directRoute.totalCctv}</Text>
                  <Text style={styles.metricLblDirect}>CCTV CAMERAS</Text>
                </View>
                <View style={styles.metricTileDirect}>
                  <Text style={[styles.metricValDirect, { color: HUD_COLORS.riskMod }]}>🚓 {routeResult.directRoute.totalPoliceStations}</Text>
                  <Text style={styles.metricLblDirect}>POLICE HUBS</Text>
                </View>
              </View>

              {/* Warning list */}
              {routeResult.directRoute.warnings.map((warn, i) => (
                <View key={i} style={styles.warningRow}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>CRITICAL // {warn}</Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Navigation Simulator Action Trigger */}
            <View style={styles.navActionSection}>
              {isNavigating ? (
                <View style={[styles.activeNavBox, HUD_SHADOWS.hard]}>
                  <View style={styles.activeNavHeader}>
                    <Text style={styles.activeNavTitle}>
                      [SIMULATOR ENGAGED // {navProgress}% COMPLETED]
                    </Text>
                    <Text style={styles.activeNavSub}>
                      TRANSIT: {activeRoute?.title.toUpperCase()} • ACTIVE CCTV TELEMETRY
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${navProgress}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={[styles.stopNavButton, HUD_SHADOWS.hardSm]}
                    onPress={() => setIsNavigating(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.stopNavText}>ABORT NAVIGATION [TERMINATE] ✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.startNavButton,
                    selectedRouteId === 'safe' ? styles.startNavSafe : styles.startNavDirect,
                    HUD_SHADOWS.hardLg
                  ]}
                  onPress={startSimulation}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startNavText}>
                    {selectedRouteId === 'safe'
                      ? 'ENGAGE NAVIGATION [AI SHIELD CORRIDOR] ↗'
                      : 'ENGAGE DIRECT NAVIGATION [CAUTION ADVISED] ↗'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Turn-by-Turn Safety Breakdown Itinerary */}
            {activeRoute && (
              <View style={[styles.itineraryCard, HUD_SHADOWS.hard]}>
                <View style={styles.itineraryHeaderRow}>
                  <Text style={styles.itineraryTag}>[TELEMETRY // WAYPOINTS]</Text>
                  <Text style={styles.itineraryHeading}>
                    CORRIDOR SAFETY WAYPOINT ITINERARY
                  </Text>
                </View>

                {activeRoute.segments.map((seg, idx) => (
                  <View key={idx} style={styles.segItem}>
                    <View style={styles.segLeft}>
                      <View
                        style={[
                          styles.segBadge,
                          {
                            backgroundColor:
                              seg.riskCategory === 'Low Risk'
                                ? HUD_COLORS.riskLow
                                : seg.riskCategory === 'Moderate Risk'
                                ? HUD_COLORS.riskMod
                                : HUD_COLORS.riskHigh
                          }
                        ]}
                      >
                        <Text style={styles.segBadgeText}>{idx + 1}</Text>
                      </View>
                      {idx < activeRoute.segments.length - 1 && <View style={styles.segLine} />}
                    </View>

                    <View style={styles.segContent}>
                      <Text style={styles.segInstruction}>{seg.instruction}</Text>
                      <View style={styles.segMetaRow}>
                        <Text style={styles.segMetaText}>
                          {seg.distanceKm} km • {seg.durationMins} min • 🎥 {seg.cctvCount} CCTV
                        </Text>
                        <Text
                          style={[
                            styles.segRiskCategory,
                            {
                              color:
                                seg.riskCategory === 'Low Risk'
                                  ? HUD_COLORS.riskLow
                                  : seg.riskCategory === 'Moderate Risk'
                                  ? HUD_COLORS.riskMod
                                  : HUD_COLORS.riskHigh
                            }
                          ]}
                        >
                          {seg.riskCategory.toUpperCase()} ({seg.riskScore.toFixed(2)})
                        </Text>
                      </View>
                      <Text style={styles.segSafetyTip}>ADVISORY // {seg.safetyTip}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Map HUD Modal */}
      <Modal
        visible={isMapFullscreen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsMapFullscreen(false)}
      >
        <SafeAreaView style={styles.fullscreenModalArea}>
          <View style={styles.fullscreenHeaderBar}>
            <View style={styles.fullscreenHeaderTitleCol}>
              <Text style={styles.fullscreenHeaderTag}>[TACTICAL HUD // FULLSCREEN RADAR]</Text>
              <Text style={styles.fullscreenHeaderTitle}>
                {currentCity.toUpperCase()} • {origin.toUpperCase()} ➔ {destination.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.collapseMapBtn, HUD_SHADOWS.hardSm]}
              onPress={() => setIsMapFullscreen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.collapseMapIcon}>✕</Text>
              <Text style={styles.collapseMapText}>COLLAPSE HUD</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fullscreenMapBody}>
            {routeResult && (
              <SafeZoneMap
                userLocation={{
                  latitude: routeResult.origin.lat,
                  longitude: routeResult.origin.lng
                }}
                zones={zones.filter(z => z.City.toLowerCase() === currentCity.toLowerCase())}
                safeRouteWaypoints={routeResult.safeRoute.waypoints}
                directRouteWaypoints={routeResult.directRoute.waypoints}
                selectedRouteId={selectedRouteId}
                originPoint={routeResult.origin}
                destinationPoint={routeResult.destination}
                height={'100%'}
                onToggleFullscreen={() => setIsMapFullscreen(false)}
                isFullscreen={true}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  routeInputCard: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    marginBottom: 16
  },
  inputCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 6,
    marginBottom: 12
  },
  inputCardTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10
  },
  transitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  scrollHintText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 0.5
  },
  timeLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  timeChip: {
    backgroundColor: '#F5F3EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    marginRight: 6,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  timeChipActive: {
    backgroundColor: HUD_COLORS.clay,
    borderColor: HUD_COLORS.borderBlack
  },
  timeChipText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  timeChipTextActive: {
    color: '#FFFFFF'
  },
  endpointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  endpointsInputs: {
    flex: 1
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pointDotOrigin: {
    width: 12,
    height: 12,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.clay,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  pointDotDest: {
    width: 12,
    height: 12,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.borderBlack,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  connectorLine: {
    width: 2,
    height: 18,
    backgroundColor: HUD_COLORS.borderBlack,
    marginLeft: 5,
    marginVertical: 2
  },
  pointInputBox: {
    flex: 1
  },
  pointLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  pointInputLabel: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.textMuted,
    letterSpacing: 0.5
  },
  scrollArrowsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  scrollArrowBtn: {
    width: 26,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollArrowText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  locationScroll: {
    flex: 1
  },
  locationScrollContent: {
    paddingRight: 8,
    paddingVertical: 2,
    alignItems: 'center'
  },
  locPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    marginRight: 6,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  locPillOriginActive: {
    backgroundColor: HUD_COLORS.clay
  },
  locPillDestActive: {
    backgroundColor: HUD_COLORS.surfaceDark
  },
  locPillText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: HUD_COLORS.textBlack
  },
  locPillTextActive: {
    color: '#FFFFFF'
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: HUD_COLORS.canvas,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  swapIcon: {
    fontSize: 20,
    color: HUD_COLORS.textBlack,
    fontWeight: 'bold'
  },
  mapContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack,
    marginBottom: 20,
    position: 'relative'
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
  mapHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  mapHudScale: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: HUD_COLORS.clay
  },
  expandMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: HUD_COLORS.clay,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: HUD_COLORS.borderBlack
  },
  expandMapIcon: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '900'
  },
  expandMapText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  fullscreenModalArea: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  fullscreenHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: HUD_COLORS.surfaceDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: HUD_COLORS.borderBlack
  },
  fullscreenHeaderTitleCol: {
    flex: 1,
    marginRight: 12
  },
  fullscreenHeaderTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  fullscreenHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.3
  },
  collapseMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: HUD_COLORS.canvas,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  collapseMapIcon: {
    fontSize: 14,
    color: HUD_COLORS.textBlack,
    fontWeight: '900'
  },
  collapseMapText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: 0.5
  },
  fullscreenMapBody: {
    flex: 1,
    backgroundColor: HUD_COLORS.canvas
  },
  calculatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(249, 248, 246, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  },
  calculatingText: {
    fontFamily: HUD_FONTS.mono,
    color: HUD_COLORS.textBlack,
    marginTop: 10,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1
  },
  routeCardsContainer: {
    gap: 18
  },
  sectionHeaderRow: {
    marginBottom: 4
  },
  sectionTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  cardHeaderRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  selectedMarkerBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  selectedMarkerText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  selectedMarkerBadgeDirect: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#000000'
  },
  selectedMarkerTextDirect: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  // ASYMMETRIC CARD 1: Solid Clay Fill with Inverted White/Clay Typography
  safestRouteCard: {
    backgroundColor: HUD_COLORS.clay,
    borderRadius: 0,
    padding: 18,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  safestCardActive: {
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  safestCardInactive: {
    opacity: 0.92
  },
  safestBadge: {
    backgroundColor: HUD_COLORS.riskLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  safestBadgeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5
  },
  safestRouteTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  safestRouteSub: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: '#FFE2D7',
    marginTop: 2
  },
  scoreBoxSafe: {
    alignItems: 'flex-end',
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  scoreValueSafe: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 22,
    fontWeight: '900',
    color: HUD_COLORS.riskLow
  },
  scoreScaleSafe: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  metricTilesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12
  },
  metricTileClay: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  metricValClay: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  metricLblClay: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    color: '#FFE2D7',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5
  },
  exposureBarContainer: {
    marginTop: 2
  },
  exposureBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  exposureLabelClay: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  exposurePercentSafe: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  exposureBarTrackClay: {
    height: 8,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  exposureBarFill: {
    height: '100%'
  },
  // ASYMMETRIC CARD 2: Direct Route — Stark Off-White Card with Hard Black Outline
  directRouteCard: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 18,
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  directCardActive: {
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  directCardInactive: {
    opacity: 0.92
  },
  warningBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  warningBadgeText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900',
    color: HUD_COLORS.riskHigh,
    letterSpacing: 0.5
  },
  directRouteTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  directRouteSub: {
    fontSize: 12,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.textMuted,
    marginTop: 2
  },
  scoreBoxDirect: {
    alignItems: 'flex-end',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  scoreValueDirect: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 22,
    fontWeight: '900',
    color: HUD_COLORS.riskHigh
  },
  scoreScaleDirect: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '800',
    color: HUD_COLORS.riskHigh
  },
  metricTilesGridDirect: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12
  },
  metricTileDirect: {
    flex: 1,
    backgroundColor: '#F9F8F6',
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  metricValDirect: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.textBlack
  },
  metricLblDirect: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 8,
    color: HUD_COLORS.textMuted,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: HUD_COLORS.riskHigh,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 6
  },
  warningIcon: {
    fontSize: 12
  },
  warningText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: HUD_COLORS.riskHigh,
    flex: 1
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  routeHeaderLeft: {
    flex: 1,
    paddingRight: 10
  },
  navActionSection: {
    marginVertical: 6
  },
  startNavButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: HUD_COLORS.borderBlack
  },
  startNavSafe: {
    backgroundColor: HUD_COLORS.borderBlack
  },
  startNavDirect: {
    backgroundColor: HUD_COLORS.riskHigh
  },
  startNavText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1
  },
  activeNavBox: {
    backgroundColor: HUD_COLORS.surfaceDark,
    borderRadius: 0,
    padding: 16,
    borderWidth: 3,
    borderColor: HUD_COLORS.riskLow
  },
  activeNavHeader: {
    marginBottom: 10
  },
  activeNavTitle: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 13,
    fontWeight: '900',
    color: HUD_COLORS.riskLow,
    letterSpacing: 0.5
  },
  activeNavSub: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressFill: {
    height: '100%',
    backgroundColor: HUD_COLORS.riskLow
  },
  stopNavButton: {
    backgroundColor: HUD_COLORS.riskHigh,
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000'
  },
  stopNavText: {
    color: '#FFFFFF',
    fontFamily: HUD_FONTS.mono,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1
  },
  itineraryCard: {
    backgroundColor: HUD_COLORS.surfaceCard,
    borderRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: HUD_COLORS.borderBlack
  },
  itineraryHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: HUD_COLORS.borderBlack,
    paddingBottom: 8,
    marginBottom: 14
  },
  itineraryTag: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 9,
    fontWeight: '900',
    color: HUD_COLORS.clay,
    letterSpacing: 1
  },
  itineraryHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: HUD_COLORS.textBlack,
    letterSpacing: -0.5
  },
  segItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  segLeft: {
    alignItems: 'center',
    width: 24
  },
  segBadge: {
    width: 22,
    height: 22,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: HUD_COLORS.borderBlack,
    justifyContent: 'center',
    alignItems: 'center'
  },
  segBadgeText: {
    color: '#000000',
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900'
  },
  segLine: {
    width: 2,
    flex: 1,
    backgroundColor: HUD_COLORS.borderBlack,
    marginVertical: 4
  },
  segContent: {
    flex: 1,
    paddingBottom: 14
  },
  segInstruction: {
    fontSize: 13,
    fontWeight: '800',
    color: HUD_COLORS.textBlack,
    marginBottom: 4
  },
  segMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  segMetaText: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    color: HUD_COLORS.textMuted
  },
  segRiskCategory: {
    fontFamily: HUD_FONTS.mono,
    fontSize: 10,
    fontWeight: '900'
  },
  segSafetyTip: {
    fontSize: 11,
    fontFamily: HUD_FONTS.serif,
    fontStyle: 'italic',
    color: HUD_COLORS.clay
  }
});

export default RouteNavigatorScreen;
