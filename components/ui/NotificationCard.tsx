import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, Circle as XCircle, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Notification } from '@/types';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={24} color={Colors.success} />;
      case 'warning':
        return <AlertCircle size={24} color={Colors.warning} />;
      case 'error':
        return <XCircle size={24} color={Colors.error} />;
      default:
        return <Info size={24} color={Colors.primary.blue} />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return Colors.success + '15';
      case 'warning':
        return Colors.warning + '15';
      case 'error':
        return Colors.error + '15';
      default:
        return Colors.primary.blue + '15';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, !notification.read && styles.unread]}
    >
      <View style={[styles.iconContainer, { backgroundColor: getBackgroundColor() }]}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>{formatTime(notification.created_at || notification.createdAt || new Date().toISOString())}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>
      <ChevronRight size={20} color={Colors.gray.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  unread: {
    backgroundColor: Colors.primary.blue + '08',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.blue,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: Colors.gray.text,
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: Colors.gray.text,
    lineHeight: 18,
  },
});
