// src/components/map/RahalMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface MarkerData {
  id: string;
  coordinate: [number, number]; // [lng, lat]
  title: string;
  subtitle: string;
  type: 'hotel' | 'destination';
  image?: string;
}

interface RahalMapProps extends Omit<any, 'style' | 'onPress'> {
  style?: any;
  markers?: MarkerData[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (marker: MarkerData) => void;
  onRegionChange?: (region: any) => void;
  showUserLocation?: boolean;
  className?: string;
}

export const RahalMap = ({
  style,
  markers = [],
  initialRegion = {
    latitude: 30.0444,
    longitude: 31.2357,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  onMarkerPress,
  onRegionChange,
  showUserLocation = true,
  className = '',
}: RahalMapProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Try to dynamically import MapLibre
  const [MapLibre, setMapLibre] = useState<any>(null);

  useEffect(() => {
    const loadMapLibre = async () => {
      try {
        // @ts-ignore
        const module = await import('react-native-maplibre-gl');
        setMapLibre(module.default || module);
      } catch (error) {
        console.warn('MapLibre not available:', error);
        setMapError('Map library not available');
      }
    };
    loadMapLibre();
  }, []);

  if (mapError || !MapLibre) {
    // Fallback UI when map library is not available
    return (
      <View
        style={[
          styles.fallbackContainer,
          { backgroundColor: isDark ? colors['surface-container-high'] : colors['surface-container-low'] },
          style,
        ]}
        className={className}
      >
        <View style={styles.fallbackContent}>
          <Ionicons name="map-outline" size={48} color={colors['on-surface-variant']} />
          <Text style={[styles.fallbackText, { color: colors['on-surface-variant'] }]}>
            {t('map.unavailable', 'Map unavailable')}
          </Text>
          <Text style={[styles.fallbackSubtext, { color: colors['on-surface-variant'] }]}>
            {t('map.installRequired', 'Map library not installed')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} className={className}>
      <MapLibre
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        onRegionChangeComplete={onRegionChange}
        onMapLoaded={() => setMapLoaded(true)}
      >
        {markers.map((marker) => (
          <MapLibre.Marker
            key={marker.id}
            coordinate={{ latitude: marker.coordinate[1], longitude: marker.coordinate[0] }}
            onPress={() => onMarkerPress?.(marker)}
          >
            <TouchableOpacity
              style={[
                styles.markerWrapper,
                { backgroundColor: marker.type === 'hotel' ? colors['pharaoh-gold'] : colors['nile-blue'] },
              ]}
            >
              <View style={styles.markerIcon}>
                <Ionicons
                  name={marker.type === 'hotel' ? 'bed-outline' : 'location-outline'}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerTitle} numberOfLines={1}>{marker.title}</Text>
                <Text style={styles.markerSubtitle} numberOfLines={1}>{marker.subtitle}</Text>
              </View>
            </TouchableOpacity>
          </MapLibre.Marker>
        ))}
      </MapLibre>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackContent: {
    alignItems: 'center',
    gap: 12,
  },
  fallbackText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  fallbackSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
  markerWrapper: {
    padding: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerLabel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  markerTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#1C1C19',
  },
  markerSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#504537',
  },
});

export default RahalMap;