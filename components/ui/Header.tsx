import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft, Bell, Menu, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotification?: boolean;
  showMore?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onMorePress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  center?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  showNotification = false,
  showMore = false,
  onBackPress,
  onMenuPress,
  onNotificationPress,
  onMorePress,
  rightComponent,
  transparent = false,
  center = true,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12 },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <ChevronLeft size={24} color={transparent ? Colors.white : Colors.dark} />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <Menu size={24} color={transparent ? Colors.white : Colors.dark} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.titleSection, center && styles.titleCenter]}>
        {title && (
          <Text
            style={[styles.title, transparent && styles.titleWhite]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={[styles.subtitle, transparent && styles.subtitleWhite]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
        {showNotification && (
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <Bell size={24} color={transparent ? Colors.white : Colors.dark} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        )}
        {showMore && (
          <TouchableOpacity onPress={onMorePress} style={styles.iconButton}>
            <MoreVertical size={24} color={transparent ? Colors.white : Colors.dark} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  titleSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  titleCenter: {
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  titleWhite: {
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray.text,
    marginTop: 2,
  },
  subtitleWhite: {
    color: Colors.white + 'CC',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.background,
  },
});
