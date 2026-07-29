import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, ChevronRight, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  created_at: string;
  scheme_id?: string;
}

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [schemeName, setSchemeName] = useState<string | null>(null);

  useEffect(() => {
    loadNotification();
  }, [id, user?.id]);

  const loadNotification = async () => {
    if (!id || !user?.id) return;

    try {
      setLoading(true);
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setNotification(data);

        // Mark as read
        if (!data.read) {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        }

        // Load related scheme if exists
        if (data.scheme_id) {
          const { data: schemeData } = await supabase
            .from('schemes')
            .select('name')
            .eq('id', data.scheme_id)
            .maybeSingle();

          if (schemeData) {
            setSchemeName(schemeData.name);
          }
        }
      }
    } catch (error) {
      console.error('Error loading notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: deleteNotification,
          style: 'destructive',
        },
      ]
    );
  };

  const deleteNotification = async () => {
    if (!notification?.id || !user?.id) return;

    try {
      setDeleting(true);
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id)
        .eq('user_id', user.id);

      router.back();
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const getIcon = () => {
    if (!notification) return null;

    const iconProps = { size: 48, strokeWidth: 2 };
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 {...iconProps} color={Colors.success} />;
      case 'warning':
        return <AlertTriangle {...iconProps} color={Colors.warning} />;
      case 'error':
        return <AlertCircle {...iconProps} color={Colors.error} />;
      case 'info':
      default:
        return <Info {...iconProps} color={Colors.primary.blue} />;
    }
  };

  const getTypeColor = () => {
    if (!notification) return Colors.primary.blue;
    switch (notification.type) {
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      case 'info':
      default:
        return Colors.primary.blue;
    }
  };

  const handleViewScheme = () => {
    if (notification?.scheme_id) {
      router.push(`/scheme/${notification.scheme_id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Alert" showBack onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Alert" showBack onBackPress={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Notification not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header title="Alert" showBack onBackPress={() => router.back()} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getTypeColor() + '15' },
          ]}
        >
          {getIcon()}
        </View>

        <View style={styles.typeTag}>
          <Text
            style={[styles.typeTagText, { color: getTypeColor() }]}
          >
            {notification.type.charAt(0).toUpperCase() +
              notification.type.slice(1)}
          </Text>
        </View>

        <Text style={styles.title}>{notification.title}</Text>

        <Text style={styles.date}>
          {new Date(notification.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.message}>{notification.message}</Text>

        {schemeName && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.schemeCard}
              onPress={handleViewScheme}
              activeOpacity={0.7}
            >
              <View style={styles.schemeContent}>
                <View>
                  <Text style={styles.schemeLabel}>Related Scheme</Text>
                  <Text style={styles.schemeName} numberOfLines={2}>
                    {schemeName}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.primary.blue} />
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteNotification}
          disabled={deleting}
        >
          <Trash2 size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Deleting...' : 'Delete Alert'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray.text,
    fontWeight: '500',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  typeTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  date: {
    fontSize: 13,
    color: Colors.gray.text,
    fontWeight: '500',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.gray.border,
    marginVertical: 20,
  },
  message: {
    fontSize: 15,
    color: Colors.dark,
    textAlign: 'center',
    lineHeight: 24,
    width: '100%',
  },
  schemeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.blue + '10',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.blue,
  },
  schemeContent: {
    flex: 1,
  },
  schemeLabel: {
    fontSize: 12,
    color: Colors.gray.text,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schemeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary.blue,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.error + '30',
    backgroundColor: Colors.error + '08',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
});
