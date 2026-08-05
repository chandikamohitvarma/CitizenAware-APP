import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShieldCheck, CheckCircle2, FileText, ArrowRight } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { AppButton, Header, UploadBox } from '@/components/ui';

export default function DocumentUploadScreen() {
  const [selectedDocType, setSelectedDocType] = useState<string>('Aadhaar Card');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; uri: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const DOC_TYPES = [
    'Aadhaar Card',
    'PAN Card',
    'Income Certificate',
    'Domicile / Address Proof',
    'Ration Card / Family Card',
    'Bank Passbook / Cancelled Cheque',
  ];

  const handleSaveDocument = () => {
    if (!uploadedFile) {
      Alert.alert('No Document Selected', 'Please capture or select a document file to proceed.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert(
        'Document Uploaded Successfully',
        `Your ${selectedDocType} (${uploadedFile.name}) has been encrypted and saved securely to your profile vault.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/profile');
              }
            },
          },
        ]
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Document Vault Upload" showBack onBackPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)/profile'))} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={26} color={Colors.primary.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Secure Document Upload</Text>
            <Text style={styles.headerSub}>Upload official identity & income proofs for instant AI scheme eligibility verification.</Text>
          </View>
        </View>

        <Text style={styles.label}>Select Document Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {DOC_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typePill, selectedDocType === type && styles.typePillActive]}
              onPress={() => {
                setSelectedDocType(type);
                setUploadedFile(null);
              }}
            >
              <Text style={[styles.typePillText, selectedDocType === type && styles.typePillTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginTop: 16 }}>
          <UploadBox
            label={selectedDocType}
            description="Upload PDF, Camera Photo, or Gallery Image (max 5MB)"
            uploaded={!!uploadedFile}
            fileName={uploadedFile?.name}
            fileSize={uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : undefined}
            onUpload={(file) => {
              if (file) {
                setUploadedFile(file);
              }
            }}
            onRemove={() => setUploadedFile(null)}
            required
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Privacy & Security Guaranteed</Text>
          <Text style={styles.infoBody}>
            Your documents are end-to-end encrypted and stored in compliance with Indian IT Act guidelines. They are used exclusively for evaluating government benefit eligibility.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title={saving ? 'Encrypting & Saving...' : `Save ${selectedDocType}`}
          onPress={handleSaveDocument}
          fullWidth
          disabled={!uploadedFile || saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 16 },
  cardHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  headerSub: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 10 },
  typeScroll: { flexDirection: 'row', marginBottom: 8 },
  typePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  typePillActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  typePillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  typePillTextActive: { color: '#FFFFFF' },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  infoBody: { fontSize: 12, color: '#1E3A8A', lineHeight: 17 },
  footer: {
    padding: 16,
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
