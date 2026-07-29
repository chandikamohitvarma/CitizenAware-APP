import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';
import { languages } from '@/constants/data';

export default function LanguageSettingsScreen() {
  const { language, setLanguage } = useSettingsStore();
  const [selected, setSelected] = useState(language);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Language" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Choose your preferred language</Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.item, selected === lang.code && styles.itemActive]}
            onPress={() => {
              setSelected(lang.code);
              setLanguage(lang.code);
            }}
          >
            <View style={styles.info}>
              <Text style={[styles.name, selected === lang.code && styles.nameActive]}>{lang.name}</Text>
              <Text style={styles.native}>{lang.native}</Text>
            </View>
            {selected === lang.code && (
              <View style={styles.check}>
                <Check size={16} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
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
