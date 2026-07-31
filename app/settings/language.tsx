import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { languages } from '@/constants/data';

export default function LanguageSettingsScreen() {
  const { language, setLanguage, isDarkMode } = useSettingsStore();
  const [selected, setSelected] = useState(language);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header title="Language" showBack onBackPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))} />
      <ScrollView style={[styles.content, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.subtitle, { color: themeColors.subtext }]}>Choose your preferred language</Text>
        {languages.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.item,
                {
                  backgroundColor: isSelected ? Colors.primary.blue : themeColors.itemBg,
                  borderColor: isSelected ? Colors.primary.blue : themeColors.border,
                },
              ]}
              onPress={() => {
                setSelected(lang.code);
                setLanguage(lang.code);
              }}
            >
              <View style={styles.info}>
                <Text style={[styles.name, { color: isSelected ? Colors.white : themeColors.text }]}>{lang.name}</Text>
                <Text style={[styles.native, { color: isSelected ? 'rgba(255,255,255,0.85)' : themeColors.subtext }]}>{lang.native}</Text>
              </View>
              {isSelected && (
                <View style={styles.check}>
                  <Check size={16} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  subtitle: { fontSize: 14, color: Colors.gray.text, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.gray.border },
  itemActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  info: {},
  name: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  nameActive: { color: Colors.white },
  native: { fontSize: 13, color: Colors.gray.text, marginTop: 2 },
  check: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.white + '30', alignItems: 'center', justifyContent: 'center' },
});
