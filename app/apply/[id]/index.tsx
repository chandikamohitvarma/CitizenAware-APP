import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle, ChevronRight, Users, Building, Calendar, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Apply for Scheme" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={1} />

      <ScrollView style={styles.content}>
        <View style={styles.schemeCard}>
          {scheme.image && <Image source={{ uri: scheme.image }} style={styles.schemeImage} />}
          <View style={styles.schemeInfo}>
            <Text style={styles.schemeName}>{scheme.name}</Text>
            <View style={styles.schemeMeta}>
              <Building size={14} color={Colors.gray.text} />
              <Text style={styles.schemeMinistry}>{scheme.ministry}</Text>
            </View>
          </View>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          <Text style={styles.benefitsValue}>{scheme.benefits}</Text>
        </View>

        <Text style={styles.sectionTitle}>Application Steps</Text>
        {[
          { step: 1, title: 'Personal Details', desc: 'Name, DOB, Gender, Contact' },
          { step: 2, title: 'Address Details', desc: 'Residential & Communication Address' },
          { step: 3, title: 'Income Details', desc: 'Annual Income & Source' },
          { step: 4, title: 'Document Upload', desc: 'Upload required documents' },
          { step: 5, title: 'Bank Details', desc: 'Account & IFSC Code' },
          { step: 6, title: 'Review & Submit', desc: 'Verify all information' },
        ].map((item) => (
          <View key={item.step} style={styles.stepCard}>
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
          </View>
        ))}

        <View style={styles.docsCard}>
          <Text style={styles.docsTitle}>Required Documents</Text>
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
          title="Start Application"
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
  schemeCard: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  schemeImage: { width: '100%', height: 120 },
  schemeInfo: { padding: 16 },
  schemeName: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  schemeMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  schemeMinistry: { fontSize: 13, color: Colors.gray.text },
  benefitsCard: {
    backgroundColor: Colors.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: { fontSize: 14, color: Colors.gray.text, marginBottom: 4 },
  benefitsValue: { fontSize: 16, fontWeight: '600', color: Colors.success },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  stepContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: { fontSize: 14, fontWeight: '600', color: Colors.primary.blue },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  stepDesc: { fontSize: 13, color: Colors.gray.text },
  docsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  docsTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  docText: { fontSize: 14, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
