// app/settings/notifications.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent } from '@/components/ui';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const notificationCategories = [
    {
      title: 'Booking Updates',
      subtitle: 'Confirmations, reminders, and changes',
      icon: 'calendar-outline',
      color: '#366286',
      enabled: true,
    },
    {
      title: 'AI Trip Updates',
      subtitle: 'New itineraries, recommendations, and insights',
      icon: 'sparkles',
      color: '#C8922A',
      enabled: true,
    },
    {
      title: 'Price Alerts',
      subtitle: 'Price drops and special offers',
      icon: 'cash-outline',
      color: '#2D7D32',
      enabled: true,
    },
    {
      title: 'Messages',
      subtitle: 'Chat with Rahal AI and support',
      icon: 'chatbubbles-outline',
      color: '#B12D17',
      enabled: true,
    },
    {
      title: 'Promotions',
      subtitle: 'Special offers and loyalty rewards',
      icon: 'pricetag-outline',
      color: '#8F1301',
      enabled: false,
    },
    {
      title: 'System Updates',
      subtitle: 'App updates and maintenance notices',
      icon: 'settings-outline',
      color: '#504536',
      enabled: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#1C1C19" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('common.nav.notifications')}</Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.settingsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>{t('account.preferredLanguage')}</Text>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Push Notifications</Text>
                  <Text style={styles.toggleSubtitle}>Receive notifications on your device</Text>
                </View>
                <View style={styles.switchContainer}>
                  <MaterialIcons name="toggle-on" size={36} color="#C8922A" />
                </View>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.settingsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>Notification Preferences</Text>
              <View style={styles.divider} />
              {notificationCategories.map((category, index) => (
                <View key={index} style={[
                  styles.toggleRow,
                  index > 0 && styles.dividerTop,
                ]}>
                  <View style={styles.toggleInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 16, 
                        backgroundColor: `${category.color}20`,
                        justifyContent: 'center', 
                        alignItems: 'center',
                      }}>
                        <Ionicons name={category.icon} size={18} color={category.color} />
                      </View>
                      <View>
                        <Text style={styles.toggleTitle}>{category.title}</Text>
                        <Text style={styles.toggleSubtitle}>{category.subtitle}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.switchContainer}>
                    {category.enabled ? (
                      <MaterialIcons name="toggle-on" size={36} color="#C8922A" />
                    ) : (
                      <MaterialIcons name="toggle-off" size={36} color="#827564" />
                    )}
                  </View>
                </View>
              ))}
            </CardContent>
          </Card>

          <Card style={styles.settingsCard}>
            <CardContent>
              <Text style={styles.sectionTitle}>Quiet Hours</Text>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Enable Quiet Hours</Text>
                  <Text style={styles.toggleSubtitle}>Silence notifications during sleep time</Text>
                </View>
                <View style={styles.switchContainer}>
                  <MaterialIcons name="toggle-off" size={36} color="#827564" />
                </View>
              </View>
              <View style={styles.quietHoursPicker}>
                <View style={styles.timePicker}>
                  <Text style={styles.timeLabel}>From</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeButtonText}>10:00 PM</Text>
                    <Ionicons name="chevron-down" size={20} color="#827564" />
                  </TouchableOpacity>
                </View>
                <View style={styles.timePicker}>
                  <Text style={styles.timeLabel}>To</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeButtonText}>8:00 AM</Text>
                    <Ionicons name="chevron-down" size={20} color="#827564" />
                  </TouchableOpacity>
                </View>
              </View>
            </CardContent>
          </Card>

          <View style={styles.h20} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF9F4',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#1C1C19',
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#504536',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D4C4B0',
    marginBottom: 12,
  },
  dividerTop: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D4C4B0',
    marginTop: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C19',
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#504536',
  },
  switchContainer: {
    padding: 4,
  },
  dividerTop: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D4C4B0',
    marginTop: 16,
  },
  quietHoursPicker: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D4C4B0',
    flexDirection: 'row',
    gap: 16,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#827564',
    marginBottom: 4,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    backgroundColor: '#F6F3EE',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C19',
  },
  h20: {
    height: 20,
  },
});