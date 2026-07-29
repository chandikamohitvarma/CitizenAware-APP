import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper, UploadBox } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];
  const [documents, setDocuments] = useState<Record<string, boolean>>({});

  const handleUpload = (docName: string) => {
    setTimeout(() => {
      setDocuments(prev => ({ ...prev, [docName]: true }));
    }, 1000);
  };

  const handleNext = () => {
    const allUploaded = scheme.documents.every(d => documents[d]);
    if (!allUploaded) {
      Alert.alert('Error', 'Please upload all required documents');
      return;
    }
    router.push(`/apply/${id}/review`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Upload Documents" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={4} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        {scheme.documents.map((doc, index) => (
          <UploadBox
            key={index}
            label={doc}
            description="PDF, JPG or PNG (max 2MB)"
            uploaded={documents[doc]}
            onUpload={() => handleUpload(doc)}
            onRemove={() => setDocuments(prev => ({ ...prev, [doc]: false }))}
            required
          />
        ))}

        <View style={styles.instructions}>
          <Text style={styles.instTitle}>Document Guidelines</Text>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Accepted formats: PDF, JPG, PNG</Text>
          </View>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Maximum file size: 2MB per document</Text>
          </View>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Ensure documents are clear and readable</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Continue" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 16, marginTop: 12 },
  instructions: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  instTitle: { fontSize: 14, fontWeight: '600', color: Colors.warning, marginBottom: 12 },
  instItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  instDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning, marginRight: 10 },
  instText: { fontSize: 13, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
