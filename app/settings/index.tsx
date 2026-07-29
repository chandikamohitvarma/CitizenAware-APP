import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const {
    isDarkMode,
    language,
    notificationsEnabled,
    remindersEnabled,
    biometricEnabled,
    toggleDarkMode,
    toggleNotifications,
    toggleReminders,
    toggleBiometric,
  } = useSettingsStore();

  const settings = [
    { icon: 'Globe', label: 'Language', value: 'English', route: '/settings/language' },
    { icon: 'Moon', label: 'Dark Mode', value: null, toggle: true, valueGetter: () => isDarkMode, onToggle: toggleDarkMode },
    { icon: 'Bell', label: 'Notifications', value: null, toggle: true, valueGetter: () => notificationsEnabled, onToggle: toggleNotifications },
    { icon: 'Clock', label: 'Reminders', value: null, toggle: true, valueGetter: () => remindersEnabled, onToggle: toggleReminders },
    { icon: 'Fingerprint', label: 'Biometric Login', value: null, toggle: true, valueGetter: () => biometricEnabled, onToggle: toggleBiometric },
    { icon: 'Palette', label: 'Theme', value: 'System', route: '/settings/theme' },
    { icon: 'Lock', label: 'Change Password', value: null, route: '/settings/reminders' },
    { icon: 'Shield', label: 'Privacy', value: null, route: '/settings/reminders' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Settings" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => item.route && router.push(item.route as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: Colors.primary.blue + '15' }]}>
              <Text style={styles.iconLetter}>{item.icon.charAt(0)}</Text>
            </View>
            <Text style={styles.label}>{item.label}</Text>
            {item.toggle ? (
              <Switch
                value={item.valueGetter?.()}
                onValueChange={item.onToggle}
                trackColor={{ false: Colors.gray.border, true: Colors.primary.blue + '50' }}
                thumbColor={item.valueGetter?.() ? Colors.primary.blue : Colors.gray.icon}
              />
            ) : (
              <View style={styles.rightRow}>
                {item.value && <Text style={styles.value}>{item.value}</Text>}
                {item.route && <ChevronRight size={20} color={Colors.gray.icon} />}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.dangerItem} onPress={() => {}}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconLetter: { fontSize: 18, fontWeight: '700', color: Colors.primary.blue },
  label: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.dark },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 14, color: Colors.gray.text, marginRight: 8 },
  dangerItem: { marginTop: 24, padding: 16, alignItems: 'center' },
  dangerText: { fontSize: 15, color: Colors.error, fontWeight: '500' },
});
