import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper } from '@/components/ui';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const [agreed, setAgreed] = useState(false);

  const sections = [
    { title: 'Personal Details', items: ['Name: Rahul Kumar', 'DOB: 15/05/1995', 'Gender: Male', 'Phone: +91 98765 43210'] },
    { title: 'Address', items: ['123 Gandhi Road', 'New Delhi, Delhi', 'Pincode: 110001'] },
    { title: 'Bank Details', items: ['Account: XXXXXX1234', 'Bank: State Bank of India', 'IFSC: SBIN0001234'] },
    { title: 'Documents', items: ['Aadhaar Card', 'Income Certificate', 'Marksheet'] },
  ];

  const handleSubmit = () => {
    if (!agreed) {
      Alert.alert('Error', 'Please agree to the declaration');
      return;
    }
    router.push(`/apply/${id}/success`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Review Application" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={6} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Review Your Information</Text>
        <Text style={styles.subtitle}>Please verify all details before submitting</Text>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            </View>
            {section.items.map((item, iIdx) => (
              <Text key={iIdx} style={styles.itemText}>{item}</Text>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.declaration} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Check size={14} color={Colors.white} />}
          </View>
          <Text style={styles.declarationText}>
            I hereby declare that all the information provided is true and correct to the best of my knowledge.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Submit Application" onPress={handleSubmit} disabled={!agreed} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray.text, marginBottom: 20 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  editBtn: { fontSize: 14, color: Colors.primary.blue, fontWeight: '500' },
  itemText: { fontSize: 14, color: Colors.gray.text, marginBottom: 4 },
  declaration: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: Colors.gray.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  declarationText: { flex: 1, fontSize: 14, color: Colors.gray.text, lineHeight: 20 },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
