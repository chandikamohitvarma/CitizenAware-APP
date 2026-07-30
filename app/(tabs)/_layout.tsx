import { Tabs, router } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Hop as Home, FileText, MessageCircle, Bell, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { getNotifications } from '@/lib/api';
import { useEffect, useState } from 'react';

import { useNotificationStore } from '@/store/notificationStore';

export default function TabLayout() {
  const { user, token, isAuthenticated } = useAuthStore();
  const storeNotifs = useNotificationStore(state => state.notifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUnread = async () => {
      if (token) {
        try {
          const notifications = await getNotifications(token);
          const count = notifications.filter((n: any) => !n.read).length;
          setUnreadCount(count);
          return;
        } catch (error) {
          console.error('Failed to load unread notifications from API', error);
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
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="schemes"
        options={{
          title: 'Schemes',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
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
          title: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.error,
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
          tabBarIcon: ({ size, color }) => (
            <Bell size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
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
