import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle, ChevronRight, Building } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Apply for Scheme" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={1} />

      <ScrollView style={styles.content}>
        <View style={styles.schemeCard}>
          {scheme.image && <Image source={{ uri: scheme.image }} style={styles.schemeImage} />}
          <View style={styles.schemeInfo}>
            <Text style={styles.schemeName}>{scheme.name}</Text>
            <View style={styles.schemeMeta}>
              <Building size={14} color={Colors.gray.text} />
              <Text style={styles.schemeMinistry}>{scheme.ministry} ({scheme.state || 'Central'})</Text>
            </View>
          </View>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Key Benefit / Grant</Text>
          <Text style={styles.benefitsValue}>{scheme.benefits}</Text>
        </View>

        <Text style={styles.sectionTitle}>Application Workflow (6 Steps)</Text>
        {[
          { step: 1, title: 'Personal Details', desc: 'Full Name, DOB, Gender, Phone & Email' },
          { step: 2, title: 'Address & State Selection', desc: 'Street, District & State Domicile' },
          { step: 3, title: 'Income & Category Details', desc: 'Annual Income, Source & Category' },
          { step: 4, title: 'Document Upload', desc: 'Scanned Copies of Aadhaar, Income Proof, etc.' },
          { step: 5, title: 'Bank Details (DBT)', desc: 'Account Number, IFSC & Direct Benefit Credit' },
          { step: 6, title: 'Preview & Final Submit', desc: 'Verify all details and submit application' },
        ].map((item) => (
          <TouchableOpacity
            key={item.step}
            style={styles.stepCard}
            onPress={() => {
              if (item.step === 1) router.push(`/apply/${id}/personal`);
              else if (item.step === 2) router.push(`/apply/${id}/address`);
              else if (item.step === 3) router.push(`/apply/${id}/income`);
              else if (item.step === 4) router.push(`/apply/${id}/documents`);
              else if (item.step === 5) router.push(`/apply/${id}/bank`);
              else if (item.step === 6) router.push(`/apply/${id}/review`);
            }}
          >
            <View style={styles.stepContent}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.gray.icon} />
          </TouchableOpacity>
        ))}

        <View style={styles.docsCard}>
          <Text style={styles.docsTitle}>Required Documents to Prepare</Text>
          {scheme.documents.map((doc, index) => (
            <View key={index} style={styles.docItem}>
              <CheckCircle size={18} color={Colors.success} />
              <Text style={styles.docText}>{doc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Start Application Process"
          onPress={() => router.push(`/apply/${id}/personal`)}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  schemeCard: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: Colors.gray.border },
  schemeImage: { width: '100%', height: 120 },
  schemeInfo: { padding: 16 },
  schemeName: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  schemeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  schemeMinistry: { fontSize: 13, color: Colors.gray.text },
  benefitsCard: {
    backgroundColor: Colors.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  benefitsTitle: { fontSize: 13, color: Colors.gray.text, marginBottom: 4 },
  benefitsValue: { fontSize: 16, fontWeight: '700', color: Colors.success },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  stepContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: Colors.primary.blue },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: Colors.gray.text },
  docsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  docsTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  docText: { fontSize: 14, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
});
