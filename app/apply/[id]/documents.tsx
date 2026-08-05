import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper, UploadBox, OfficialWebsiteBanner } from '@/components/ui';
import { schemes as localSchemes } from '@/constants/data';
import { getScheme } from '@/lib/api';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = id as string;
  const { getDraft, updateDraft } = useApplicationDraftStore();
  const draft = getDraft(schemeId);

  const [schemeName, setSchemeName] = useState<string>('');
  const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
  // documents state stays local for UI, but we sync to draft on change
  const [documents, setDocuments] = useState<Record<string, boolean>>(
    (draft.documents as Record<string, boolean>) || {}
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSchemeDetails();
  }, [schemeId]);

  const loadSchemeDetails = async () => {
    try {
      setLoading(true);
      let foundDocs: string[] = [];
      let name = '';

      // 1. Try finding in local schemes constant
      const localFound = localSchemes.find(s => s.id === schemeId);
      if (localFound) {
        name = localFound.name;
        foundDocs = localFound.documents || [];
      } else {
        // 2. Try fetching from backend API
        try {
          const apiFound = await getScheme(schemeId);
          if (apiFound) {
            name = apiFound.name;
            foundDocs = apiFound.documents_required || apiFound.documents || [];
          }
        } catch (err) {
          console.log('API fetch fallback to local:', err);
        }
      }

      // Fallback if match by ID failed
      if (!name) {
        const fallback = localSchemes[0];
        name = fallback.name;
        foundDocs = fallback.documents;
      }

      // Clean up & filter out non-document strings (e.g. "Mobile number")
      const cleanedDocs = foundDocs
        .map(doc => (doc.toLowerCase() === 'mobile number' ? 'Artisan / Identity Proof' : doc))
        .filter(doc => doc.trim().length > 0);

      const finalDocs = cleanedDocs.length > 0
        ? cleanedDocs
        : ['Aadhaar Card', 'Income Certificate', 'Domicile / Address Proof'];

      setSchemeName(name);
      setRequiredDocs(finalDocs);
    } catch (error) {
      console.error('Error loading scheme documents:', error);
      setRequiredDocs(['Aadhaar Card', 'Income Certificate', 'Domicile / Address Proof']);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (docName: string) => {
    const next = { ...documents, [docName]: true };
    setDocuments(next);
    updateDraft(schemeId, { documents: next });
  };

  const handleRemove = (docName: string) => {
    const next = { ...documents, [docName]: false };
    setDocuments(next);
    updateDraft(schemeId, { documents: next });
  };

  const handleNext = () => {
    const allUploaded = requiredDocs.every(d => documents[d]);
    if (!allUploaded) {
      Alert.alert('Incomplete Uploads', 'Please upload all required documents to proceed.');
      return;
    }
    router.push(`/apply/${schemeId}/bank`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Upload Documents" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={4} />

      <ScrollView style={styles.content}>
        <OfficialWebsiteBanner schemeId={schemeId} />
        <Text style={styles.sectionTitle}>Required Documents for {schemeName || 'Scheme'}</Text>
        <Text style={styles.sectionSubtitle}>
          Upload clear scanned copies or photos of official documents required for this scheme.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.blue} />
            <Text style={styles.loadingText}>Loading scheme documents...</Text>
          </View>
        ) : (
          requiredDocs.map((doc, index) => (
            <UploadBox
              key={index}
              label={doc}
              description="PDF, JPG or PNG (max 2MB)"
              uploaded={documents[doc]}
              onUpload={() => handleUpload(doc)}
              onRemove={() => handleRemove(doc)}
              required
            />
          ))
        )}

        <View style={styles.instructions}>
          <Text style={styles.instTitle}>Document Upload Guidelines</Text>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Accepted file formats: PDF, JPG, PNG</Text>
          </View>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Maximum size limit per file: 2MB</Text>
          </View>
          <View style={styles.instItem}>
            <View style={styles.instDot} />
            <Text style={styles.instText}>Ensure all text, seals and signatures are legible</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 4 of 6</Text>
          <Text style={styles.stepLabel}>Document Upload</Text>
        </View>
        <AppButton title="Continue to Bank Details" onPress={handleNext} fullWidth disabled={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 4, marginTop: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.gray.text, marginBottom: 16 },
  loadingContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: Colors.gray.text, marginTop: 12 },
  instructions: {
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  instTitle: { fontSize: 14, fontWeight: '600', color: Colors.warning, marginBottom: 12 },
  instItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  instDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning, marginRight: 10 },
  instText: { fontSize: 13, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
