// src/components/map/RahalMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapLibreGL from 'react-native-maplibre-gl';
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
  selectedMarkerId?: string;
  onMarkerPress?: (marker: MarkerData) => void;
  initialRegion?: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  showUserLocation?: boolean;
  onRegionChange?: (region: any) => void;
}

export const RahalMap = ({
  style,
  markers = [],
  selectedMarkerId,
  onMarkerPress,
  initialRegion,
  showUserLocation = true,
  onRegionChange,
  ...props
}: RahalMapProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const mapRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState<string>('');

  useEffect(() => {
    // Create a custom style for light/dark mode
    const styleJson = {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': isDark ? '#16140F' : '#FCF9F4',
          },
        },
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          paint: {
            'raster-opacity': isDark ? 0.4 : 1,
            'raster-saturation': isDark ? 0 : 1,
            'raster-contrast': isDark ? 0.8 : 1,
          },
        },
      ],
    };

    setMapStyle(JSON.stringify(styleJson));
  }, [isDark]);

  // Default to Egypt center if no initial region
  const defaultRegion = initialRegion || {
    latitude: 26.8206,
    longitude: 30.8025,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  if (!mapStyle) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapLibreGL
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        styleURL={mapStyle}
        initialViewport={{
          latitude: defaultRegion.latitude,
          longitude: defaultRegion.longitude,
          zoom: 6,
        }}
        onRegionChange={onRegionChange}
        showsUserLocation={showUserLocation}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        {...props}
      >
        {markers.map((marker) => (
          <MapLibreGL.PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={marker.coordinate}
            onSelect={() => onMarkerPress?.(marker)}
          >
            <TouchableOpacity
              style={[
                styles.marker,
                selectedMarkerId === marker.id && styles.markerSelected,
                marker.type === 'hotel' && styles.markerHotel,
                marker.type === 'destination' && styles.markerDestination,
              ]}
              activeOpacity={0.8}
            >
              <View className={`w-8 h-8 rounded-full flex-items-center justify-center shadow-lg ${
                marker.type === 'hotel' ? 'bg-primary' : 'bg-secondary'
              }`}>
                {marker.type === 'hotel' ? (
                  <Ionicons name="bed-outline" size={16} color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="location-on" size={16} color="#FFFFFF" />
                )}
              </View>
              {selectedMarkerId === marker.id && (
                <View className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg shadow-lg bg-surface text-on-surface text-label-sm whitespace-nowrap">
                  {marker.title}
                </View>
              )}
            </TouchableOpacity>
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: '#C8922A' }]} />
          <Text style={styles.legendText}>{t('hotelListing.hotels')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIcon, { backgroundColor: '#366286' }]} />
          <Text style={styles.legendText}>{t('destinationsListing.destinations')}</Text>
        </View>
      </View>

      {/* Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => {
          mapRef.current?.animateCamera({
            center: { latitude: 26.8206, longitude: 30.8025 },
            zoom: 6,
            duration: 1000,
          });
        }}
      >
        <MaterialIcons name="my-location" size={24} color="#366286" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#827564',
    marginTop: 12,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  markerSelected: {
    transform: [{ scale: 1.3 }],
    borderWidth: 4,
  },
  markerHotel: {
    backgroundColor: '#C8922A',
  },
  markerDestination: {
    backgroundColor: '#366286',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(252, 249, 244, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C19',
  },
  locationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
});

export default RahalMap;