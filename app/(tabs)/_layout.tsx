import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Hop as Home, FileText, MessageCircle, Bell, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getNotifications } from '@/lib/api';
import { useEffect, useState } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import { t } from '@/constants/translations';

export default function TabLayout() {
  const { user, token, isAuthenticated } = useAuthStore();
  const storeNotifs = useNotificationStore(state => state.notifications);
  const language = useSettingsStore(state => state.language);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/auth/login');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (token) {
        try {
          const notifications = await getNotifications(token);
          if (notifications && Array.isArray(notifications) && notifications.length > 0) {
            const count = notifications.filter((n: any) => !n.read).length;
            setUnreadCount(count);
            return;
          }
        } catch (error) {
          // Fallback to storeNotifs
        }
      }
      setUnreadCount(storeNotifs.filter((n: any) => !n.read).length);
    };

    fetchUnread();
  }, [token, storeNotifs]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary.blue,
        tabBarInactiveTintColor: Colors.gray.icon,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home', language),
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: t('schemes', language),
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t('ai', language),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.aiButton}>
              <LinearGradient
                colors={[Colors.primary.blue, Colors.primary.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiGradient}
              >
                <MessageCircle size={24} color={Colors.white} strokeWidth={2} />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('alerts', language),
          tabBarIcon: ({ size, color }) => (
            <View style={{ width: size + 10, height: size, alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={size} color={color} strokeWidth={2} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: Colors.error,
                    borderRadius: 9,
                    minWidth: 18,
                    height: 18,
                    paddingHorizontal: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: '700',
                      textAlign: 'center',
                      includeFontPadding: false,
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile', language),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  aiButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? -4 : -8,
  },
  aiGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
