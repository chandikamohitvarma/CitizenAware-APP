import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle, ChevronRight, Building, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper, OfficialWebsiteBanner } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';
import { schemes as fallbackSchemes } from '@/constants/data';
import { isSchemeExpired } from '@/lib/schemeUtils';

import { Linking } from 'react-native';
import { ExternalLink, Globe } from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const storeSchemes = useSchemeStore((state) => state.schemes);
  const createApplication = useSchemeStore((state) => state.createApplication);
  const { user } = useAuthStore();
  const schemesList = storeSchemes && storeSchemes.length > 0 ? storeSchemes : fallbackSchemes;
  const scheme = schemesList.find(s => s.id === id) || schemesList[0];

  const expired = isSchemeExpired(scheme);
  const portalUrl = scheme.source_url || 'https://services.india.gov.in';

  const handleOpenOfficialPortal = async () => {
    // 1. Create active tracked application record in app
    createApplication(
      scheme.id,
      user?.id,
      { name: scheme.name, documents: scheme.documents || [] },
      'submitted'
    );

    // 2. Open Official Government Portal in external browser
    try {
      await Linking.openURL(portalUrl);
    } catch {
      await Linking.openURL('https://services.india.gov.in');
    }

    // 3. Immediately redirect in app to My Applications Tracking
    router.replace('/application/tracking');
  };


  return (
    <SafeAreaView style={styles.container}>
      <Header title="Official Scheme Application Portal" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />

      <ScrollView style={styles.content}>
        {expired && (
          <View style={styles.expiredLockCard}>
            <AlertTriangle size={22} color="#991B1B" />
            <View style={styles.expiredLockContent}>
              <Text style={styles.expiredLockTitle}>Application Window Closed</Text>
              <Text style={styles.expiredLockText}>
                Registration for {scheme.name} closed on {scheme.deadline}. Applications can no longer be submitted for this scheme.
              </Text>
            </View>
          </View>
        )}

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

        {/* Portal Notice Card */}
        <View style={styles.portalNoticeCard}>
          <View style={styles.portalNoticeHeader}>
            <Globe size={24} color={Colors.primary.blue} />
            <Text style={styles.portalNoticeTitle}>Official Government Submission</Text>
          </View>
          <Text style={styles.portalNoticeText}>
            As per Government of India guidelines, final applications must be submitted directly on the official portal:
          </Text>
          <Text style={styles.portalUrlText} numberOfLines={1}>{portalUrl}</Text>
          <TouchableOpacity
            style={styles.portalDirectBtn}
            onPress={handleOpenOfficialPortal}
            activeOpacity={0.85}
          >
            <Text style={styles.portalDirectBtnText}>Visit Official Government Portal</Text>
            <ExternalLink size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.docsCard}>
          <Text style={styles.docsTitle}>Required Documents for Portal Registration</Text>
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
          title={expired ? "Application Expired & Closed" : "Visit Official Government Portal"}
          onPress={handleOpenOfficialPortal}
          disabled={expired}
          fullWidth
          style={expired ? { opacity: 0.5 } : undefined}
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
  benefitsTitle: { fontSize: 12, fontWeight: '700', color: Colors.primary.green, textTransform: 'uppercase', marginBottom: 2 },
  benefitsValue: { fontSize: 15, fontWeight: '700', color: Colors.dark },

  portalNoticeCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  portalNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  portalNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  portalNoticeText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
    marginBottom: 8,
  },
  portalUrlText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.blue,
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 6,
    marginBottom: 14,
  },
  portalDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.blue,
    paddingVertical: 14,
    borderRadius: 12,
  },
  portalDirectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

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
  expiredLockCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  expiredLockContent: { flex: 1 },
  expiredLockTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 2 },
  expiredLockText: { fontSize: 13, color: '#7F1D1D', lineHeight: 18 },
});
