import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';

export default function ThemeSettingsScreen() {
  const [theme, setTheme] = useState('system');

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Theme" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Choose how CitizenAware looks</Text>

        {[
          { id: 'light', title: 'Light', desc: 'Classic light theme' },
          { id: 'dark', title: 'Dark', desc: 'Easy on the eyes' },
          { id: 'system', title: 'System Default', desc: 'Follow your device settings' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.item, theme === t.id && styles.itemActive]}
            onPress={() => setTheme(t.id)}
          >
            <View style={styles.preview}>
              <LinearGradient
                colors={['#fff', '#f8fafc']}
                style={styles.previewGrad}
              />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, theme === t.id && styles.nameActive]}>{t.title}</Text>
              <Text style={styles.desc}>{t.desc}</Text>
            </View>
            {theme === t.id && <Check size={20} color={Colors.primary.blue} />}
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
