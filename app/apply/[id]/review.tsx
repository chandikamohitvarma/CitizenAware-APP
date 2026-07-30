import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Check, Edit3, ShieldCheck } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];
  const [agreed, setAgreed] = useState(false);

  const sections = [
    {
      title: '1. Personal Details',
      route: `/apply/${id}/personal`,
      items: [
        'Full Name: Rahul Kumar',
        'Date of Birth: 15/05/1995',
        'Gender: Male',
        'Mobile Number: +91 98765 43210',
        'Email Address: rahul.kumar@email.com',
      ],
    },
    {
      title: '2. Address & State',
      route: `/apply/${id}/address`,
      items: [
        'Street Address: 123 Gandhi Road, Connaught Place',
        'City/District: New Delhi',
        'State / UT: Delhi',
        'Pincode: 110001',
      ],
    },
    {
      title: '3. Income & Category',
      route: `/apply/${id}/income`,
      items: [
        'Annual Family Income: ₹ 2,50,000',
        'Primary Source: Salaried / Employee',
        'Category: EWS (Economically Weaker Section)',
        'Income Certificate: INC/2026/876543 (Verified)',
      ],
    },
    {
      title: '4. Uploaded Documents',
      route: `/apply/${id}/documents`,
      items: [
        'Aadhaar Card: Uploaded (Verified)',
        'Income Certificate: Uploaded (Verified)',
        'Address Proof: Uploaded (Verified)',
      ],
    },
    {
      title: '5. Bank Account Details',
      route: `/apply/${id}/bank`,
      items: [
        'Account Number: XXXXXX1234',
        'Bank Name: State Bank of India',
        'IFSC Code: SBIN0001234',
        'Account Type: Savings',
      ],
    },
  ];

  const handleSubmit = () => {
    if (!agreed) {
      Alert.alert('Declaration Required', 'Please check the declaration box to submit your application.');
      return;
    }
    router.push(`/apply/${id}/success`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Preview & Submit" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={6} />

      <ScrollView style={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Review Your Application</Text>
          <Text style={styles.subtitle}>
            Please preview and verify all your details before final submission for {scheme.name}.
          </Text>
        </View>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push(section.route as any)}
              >
                <Edit3 size={14} color={Colors.primary.blue} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {section.items.map((item, iIdx) => (
              <View key={iIdx} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.declaration} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Check size={14} color={Colors.white} />}
          </View>
          <Text style={styles.declarationText}>
            I hereby declare that all information provided in this application is accurate and true. I authorize verification of these documents for scheme enrollment.
          </Text>
        </TouchableOpacity>

        <View style={styles.trustBadge}>
          <ShieldCheck size={20} color={Colors.primary.green} />
          <Text style={styles.trustText}>Official Government Application Portal Verification Active</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 6 of 6</Text>
          <Text style={styles.stepLabel}>Final Submission</Text>
        </View>
        <AppButton title="Submit Application" onPress={handleSubmit} disabled={!agreed} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  headerCard: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.gray.text, lineHeight: 18 },
  sectionCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.gray.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.primary.blue + '10', borderRadius: 6 },
  editText: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  itemBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary.blue, marginRight: 8 },
  itemText: { fontSize: 13, color: Colors.dark, lineHeight: 18 },
  declaration: { flexDirection: 'row', gap: 12, paddingVertical: 16, marginTop: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.gray.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  checkboxActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  declarationText: { flex: 1, fontSize: 13, color: Colors.gray.text, lineHeight: 18 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary.green + '12', borderRadius: 10, padding: 12, marginBottom: 24 },
  trustText: { fontSize: 12, color: Colors.primary.green, fontWeight: '600', flex: 1 },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
