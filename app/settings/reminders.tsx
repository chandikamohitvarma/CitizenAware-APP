import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Clock, BellOff, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header, AppButton } from '@/components/ui';
import { useSettingsStore } from '@/store/settingsStore';

export default function RemindersScreen() {
  const { remindersEnabled, toggleReminders } = useSettingsStore();
  const [selectedDays, setSelectedDays] = useState(['deadline', 'status']);

  const reminderTypes = [
    { id: 'deadline', label: 'Application Deadlines', desc: 'Get notified before scheme deadlines' },
    { id: 'status', label: 'Status Updates', desc: 'Updates on your applications' },
    { id: 'new', label: 'New Schemes', desc: 'When new schemes are launched' },
    { id: 'news', label: 'News & Updates', desc: 'General announcements' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Reminders" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={[styles.masterToggle, remindersEnabled && styles.masterActive]}
          onPress={toggleReminders}
        >
          <Bell size={24} color={remindersEnabled ? Colors.white : Colors.primary.blue} />
          <Text style={[styles.masterText, remindersEnabled && styles.masterTextActive]}>
            Reminders {remindersEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Reminder Types</Text>
        {reminderTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.item}
            onPress={() => {
              setSelectedDays(prev =>
                prev.includes(type.id) ? prev.filter(d => d !== type.id) : [...prev, type.id]
              );
            }}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>{type.label}</Text>
              <Text style={styles.itemDesc}>{type.desc}</Text>
            </View>
            <View style={[styles.checkbox, selectedDays.includes(type.id) && styles.checkboxActive]}>
              {selectedDays.includes(type.id) && <Check size={14} color={Colors.white} />}
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Reminder Time</Text>
        <TouchableOpacity style={styles.timeBtn}>
          <Clock size={18} color={Colors.primary.blue} />
          <Text style={styles.timeText}>9:00 AM</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
  },
  masterActive: { backgroundColor: Colors.primary.blue },
  masterText: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  masterTextActive: { color: Colors.white },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 16 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: 10, padding: 14, marginBottom: 8 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '500', color: Colors.dark },
  itemDesc: { fontSize: 12, color: Colors.gray.text, marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.gray.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.white, borderRadius: 10, padding: 14 },
  timeText: { fontSize: 16, fontWeight: '500', color: Colors.dark },
});
