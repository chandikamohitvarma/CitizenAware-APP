import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, CircleX as XCircle, MapPin, Award, FileText, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';
import { schemes } from '@/constants/data';
import { syncAndOpenOfficialPortal } from '@/lib/portalSyncEngine';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';

export default function EligibilityResultScreen() {
  const params = useLocalSearchParams();
  const schemeId = (params.schemeId as string) || '3';
  const schemeName = (params.schemeName as string) || 'Ayushman Bharat PMJAY 2026 Expansion';
  const isEligible = params.isEligible === 'true' || params.isEligible === undefined;
  const selectedState = (params.selectedState as string) || 'Tamil Nadu';
  const getDraft = useApplicationDraftStore((state) => state.getDraft);
  const draft = getDraft(schemeId);

  // Find target scheme details for required documents
  const targetScheme = schemes.find((s) => s.id === schemeId || s.name.toLowerCase().includes(schemeName.toLowerCase())) || schemes[0];
  const requiredDocs = targetScheme?.documents || ['Aadhaar Card', 'Income Certificate', 'Ration Card / Domicile Proof', 'Bank Passbook'];

  const handleOpenOfficial = async () => {
    await syncAndOpenOfficialPortal(schemeId, draft);
  };

  let profileReasons: string[] = [];
  try {
    profileReasons = params.reasons ? JSON.parse(params.reasons as string) : [
      `State Domicile: Resident of ${selectedState}`,
      'Income verified: ₹2,50,000/year meets EWS/BPL threshold',
      'Age & Category verified: 25 years',
    ];
  } catch (e) {
    profileReasons = [
      `State Domicile: Resident of ${selectedState}`,
      'Income criteria verified',
      'Age and category guidelines satisfied',
    ];
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Eligibility Evaluation Result" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        
        {/* Status Icon */}
        <View style={styles.iconContainer}>
          {isEligible ? (
            <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.iconGradient}>
              <ShieldCheck size={54} color={Colors.white} />
            </LinearGradient>
          ) : (
            <View style={[styles.iconGradient, { backgroundColor: Colors.error }]}>
              <XCircle size={54} color={Colors.white} />
            </View>
          )}
        </View>

        {/* Status Titles */}
        <Text style={styles.statusTitle}>
          {isEligible ? 'Criteria Matched!' : 'Not Eligible for Scheme'}
        </Text>
        <Text style={styles.schemeTitle}>{schemeName}</Text>
        <Text style={styles.subtitle}>
          {isEligible
            ? `Your profile criteria (Age, Income, Domicile State) match initial guidelines. To confirm final eligibility, you must verify the required scheme documents below.`
            : `Your profile or state selection (${selectedState}) does not match the eligibility guidelines for this scheme.`
          }
        </Text>

        {/* Document Verification Requirement Warning Badge */}
        {isEligible && (
          <View style={styles.docNoticeBox}>
            <AlertTriangle size={18} color="#B45309" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docNoticeTitle}>Document Verification Mandatory</Text>
              <Text style={styles.docNoticeText}>
                Final eligibility status is subject to uploading and verifying the required government documents.
              </Text>
            </View>
          </View>
        )}

        {/* Section 1: Initial Profile Criteria */}
        <View style={styles.criteriaCard}>
          <View style={styles.criteriaHeader}>
            <Award size={18} color={isEligible ? Colors.primary.blue : Colors.error} />
            <Text style={styles.criteriaTitle}>
              1. Profile Criteria Verification
            </Text>
          </View>

          {profileReasons.map((item, i) => (
            <View key={i} style={styles.criteriaItem}>
              {item.includes('requires domicile') || item.includes('exceeds') ? (
                <XCircle size={18} color={Colors.error} />
              ) : (
                <CheckCircle size={18} color={Colors.success} />
              )}
              <Text style={styles.criteriaText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Section 2: Required Documents Checklist */}
        {isEligible && (
          <View style={styles.docsCard}>
            <View style={styles.criteriaHeader}>
              <FileText size={18} color={Colors.primary.blue} />
              <Text style={styles.criteriaTitle}>
                2. Scheme Required Documents Checklist
              </Text>
            </View>

            {requiredDocs.map((doc, i) => (
              <View key={`doc-${i}`} style={styles.docRow}>
                <View style={styles.docDot} />
                <Text style={styles.docNameText}>{doc}</Text>
                <View style={styles.docPendingTag}>
                  <Text style={styles.docPendingTagText}>Verification Required</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.stateBadgeRow}>
          <MapPin size={16} color={Colors.primary.blue} />
          <Text style={styles.stateBadgeText}>Evaluated for resident state: {selectedState}</Text>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        {isEligible ? (
          <View style={{ gap: 10 }}>
            <AppButton
              title="📄 Step 3: Verify & Upload Documents"
              onPress={() => router.push('/document/verification')}
              fullWidth
            />
            <AppButton
              title="🌐 Go Directly to Official Government Portal"
              onPress={handleOpenOfficial}
              variant="secondary"
              fullWidth
            />
            <AppButton
              title="🏠 Back to Home Page"
              onPress={() => router.push('/(tabs)')}
              variant="outline"
              fullWidth
            />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <AppButton
              title="Browse Other Schemes for My State"
              onPress={() => router.push('/(tabs)/schemes')}
              fullWidth
            />
            <AppButton
              title="🏠 Back to Home Page"
              onPress={() => router.push('/(tabs)')}
              variant="outline"
              fullWidth
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { flex: 1 },
  scrollContent: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  iconContainer: { marginBottom: 14, marginTop: 8 },
  iconGradient: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 22, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  schemeTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary.blue, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.gray.text, textAlign: 'center', lineHeight: 18, marginBottom: 18 },
  
  docNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  docNoticeTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  docNoticeText: { fontSize: 12, color: '#78350F', lineHeight: 16 },

  criteriaCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.gray.border },
  docsCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.gray.border },

  criteriaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  criteriaTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  criteriaText: { fontSize: 13, color: Colors.dark, flex: 1, lineHeight: 18 },

  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  docDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary.blue, marginRight: 8 },
  docNameText: { fontSize: 13, fontWeight: '600', color: '#1E293B', flex: 1 },
  docPendingTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#BFDBFE' },
  docPendingTagText: { fontSize: 11, fontWeight: '700', color: Colors.primary.blue },

  stateBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary.blue + '10', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  stateBadgeText: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  footer: { width: '100%', padding: 16, paddingBottom: 36, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
});
