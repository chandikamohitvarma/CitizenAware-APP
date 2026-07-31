import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, getThemeColors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';

export default function ThemeSettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  const themeColors = getThemeColors(isDarkMode);

  const selectedThemeId = isDarkMode ? 'dark' : 'light';

  const handleSelectTheme = (id: string) => {
    if (id === 'dark' && !isDarkMode) {
      toggleDarkMode();
    } else if (id === 'light' && isDarkMode) {
      toggleDarkMode();
    } else if (id === 'system') {
      if (isDarkMode) toggleDarkMode();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title="Theme"
        showBack
        onBackPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
      />
      <View style={[styles.content, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.subtitle, { color: themeColors.subtext }]}>Choose how CitizenAware looks</Text>

        {[
          { id: 'light', title: 'Light', desc: 'Classic light theme' },
          { id: 'dark', title: 'Dark', desc: 'Easy on the eyes' },
          { id: 'system', title: 'System Default', desc: 'Follow your device settings' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.item,
              { backgroundColor: themeColors.itemBg, borderColor: selectedThemeId === t.id ? Colors.primary.blue : themeColors.border },
            ]}
            onPress={() => handleSelectTheme(t.id)}
          >
            <View style={styles.preview}>
              <LinearGradient
                colors={t.id === 'dark' ? ['#0f172a', '#1e293b'] : ['#fff', '#f8fafc']}
                style={styles.previewGrad}
              />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: themeColors.text }, selectedThemeId === t.id && styles.nameActive]}>
                {t.title}
              </Text>
              <Text style={[styles.desc, { color: themeColors.subtext }]}>{t.desc}</Text>
            </View>
            {selectedThemeId === t.id && <Check size={20} color={Colors.primary.blue} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  subtitle: { fontSize: 14, color: Colors.gray.text, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.gray.border },
  itemActive: { borderColor: Colors.primary.blue },
  preview: { width: 50, height: 50, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  previewGrad: { flex: 1 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  nameActive: { color: Colors.primary.blue },
  desc: { fontSize: 13, color: Colors.gray.text, marginTop: 2 },
});
