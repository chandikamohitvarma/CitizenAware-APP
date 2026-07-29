import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';

export default function NewTicketScreen() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { createTicket } = useNotificationStore();

  const categories = ['Application Issue', 'Document Upload', 'Eligibility Query', 'Payment Issue', 'Other'];

  const handleSubmit = () => {
    if (!subject || !category || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const ticket = createTicket(subject, description);
    Alert.alert('Success', `Ticket ${ticket.id} created successfully`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Raise Support Ticket" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <Text style={styles.info}>Describe your issue and we'll get back to you within 24 hours</Text>

        <AppInput
          label="Subject"
          placeholder="Brief description of your issue"
          value={subject}
          onChangeText={setSubject}
          required
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categories}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput
          label="Description"
          placeholder="Provide detailed description of your issue"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          required
        />

        <TouchableOpacity style={styles.attachSection}>
          <Text style={styles.attachText}>+ Attach Screenshot (optional)</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Submit Ticket" onPress={handleSubmit} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  info: { fontSize: 14, color: Colors.gray.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: { backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gray.border },
  catBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  catText: { fontSize: 13, color: Colors.dark },
  catTextActive: { color: Colors.white },
  attachSection: { marginTop: 12 },
  attachText: { fontSize: 14, color: Colors.primary.blue, fontWeight: '500' },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
