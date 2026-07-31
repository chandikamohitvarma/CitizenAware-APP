import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { languages } from '@/constants/data';
import { t } from '@/constants/translations';

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

  const themeColors = getThemeColors(isDarkMode);
  const activeLanguageObj = languages.find(l => l.code === language);
  const activeLanguageName = activeLanguageObj ? `${activeLanguageObj.name} (${activeLanguageObj.native})` : 'English';

  const settings = [
    { icon: 'Globe', label: t('language', language), value: activeLanguageName, route: '/settings/language' },
    { icon: 'Moon', label: t('darkMode', language), value: null, toggle: true, valueGetter: () => isDarkMode, onToggle: toggleDarkMode },
    { icon: 'Bell', label: t('notifications', language), value: null, toggle: true, valueGetter: () => notificationsEnabled, onToggle: toggleNotifications },
    { icon: 'Clock', label: t('reminders', language), value: null, toggle: true, valueGetter: () => remindersEnabled, onToggle: toggleReminders },
    { icon: 'Fingerprint', label: t('biometricLogin', language), value: null, toggle: true, valueGetter: () => biometricEnabled, onToggle: toggleBiometric },
    { icon: 'Palette', label: t('theme', language), value: isDarkMode ? 'Dark' : 'Light', route: '/settings/theme' },
    { icon: 'Lock', label: t('changePassword', language), value: null, route: '/settings/reminders' },
    { icon: 'Shield', label: t('privacy', language), value: null, route: '/settings/reminders' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={t('settings', language)}
        showBack
        onBackPress={() => router.replace('/(tabs)/profile')}
      />
      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.item, { backgroundColor: themeColors.itemBg, borderColor: themeColors.border, borderWidth: isDarkMode ? 1 : 0 }]}
            onPress={() => item.route && router.push(item.route as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? Colors.primary.blue + '30' : Colors.primary.blue + '15' }]}>
              <Text style={[styles.iconLetter, { color: isDarkMode ? '#93C5FD' : Colors.primary.blue }]}>{item.icon.charAt(0)}</Text>
            </View>
            <Text style={[styles.label, { color: themeColors.text }]}>{item.label}</Text>
            {item.toggle ? (
              <Switch
                value={item.valueGetter?.()}
                onValueChange={item.onToggle}
                trackColor={{ false: '#475569', true: Colors.primary.blue }}
                thumbColor="#FFFFFF"
              />
            ) : (
              <View style={styles.rightRow}>
                {item.value && <Text style={[styles.value, { color: themeColors.subtext }]}>{item.value}</Text>}
                {item.route && <ChevronRight size={20} color={themeColors.icon} />}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.dangerItem, { backgroundColor: isDarkMode ? '#331D1D' : '#FEE2E2' }]} onPress={() => {}}>
          <Text style={styles.dangerText}>{t('deleteAccount', language)}</Text>
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
