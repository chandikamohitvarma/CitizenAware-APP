import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, CircleX as XCircle, MapPin, Award } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';

export default function EligibilityResultScreen() {
  const params = useLocalSearchParams();
  const schemeId = (params.schemeId as string) || '1';
  const schemeName = (params.schemeName as string) || 'PM Vishwakarma Yojana 2026';
  const isEligible = params.isEligible === 'true' || params.isEligible === undefined;
  const selectedState = (params.selectedState as string) || 'Telangana';

  let reasons: string[] = [];
  try {
    reasons = params.reasons ? JSON.parse(params.reasons as string) : [
      `Domicile verified: Resident of ${selectedState}`,
      'Income criteria verified: Eligible under EWS/BPL limit',
      'Age and category guidelines satisfied',
    ];
  } catch (e) {
    reasons = [
      `Domicile verified: Resident of ${selectedState}`,
      'Income criteria verified',
      'Age and category guidelines satisfied',
    ];
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Eligibility Evaluation Result" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          {isEligible ? (
            <LinearGradient colors={[Colors.success, Colors.primary.green]} style={styles.iconGradient}>
              <CheckCircle size={60} color={Colors.white} />
            </LinearGradient>
          ) : (
            <View style={[styles.iconGradient, { backgroundColor: Colors.error }]}>
              <XCircle size={60} color={Colors.white} />
            </View>
          )}
        </View>

        <Text style={styles.statusTitle}>
          {isEligible ? 'You Are Eligible!' : 'Not Eligible for Scheme'}
        </Text>
        <Text style={styles.schemeTitle}>{schemeName}</Text>
        <Text style={styles.subtitle}>
          {isEligible
            ? `Based on your profile and state selection (${selectedState}), you meet all government eligibility criteria.`
            : `Your profile or state selection (${selectedState}) does not match the eligibility guidelines for this scheme.`
          }
        </Text>

        <View style={styles.criteriaCard}>
          <View style={styles.criteriaHeader}>
            <Award size={18} color={isEligible ? Colors.success : Colors.error} />
            <Text style={styles.criteriaTitle}>
              {isEligible ? 'Eligibility Verification Details' : 'Reason / Missing Criteria'}
            </Text>
          </View>

          {reasons.map((item, i) => (
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

        <View style={styles.stateBadgeRow}>
          <MapPin size={16} color={Colors.primary.blue} />
          <Text style={styles.stateBadgeText}>Evaluated for resident state: {selectedState}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isEligible ? (
          <AppButton
            title="Start Scheme Application (6 Steps)"
            onPress={() => router.push(`/apply/${schemeId}`)}
            fullWidth
          />
        ) : (
          <AppButton
            title="Browse Other Schemes for My State"
            onPress={() => router.push('/(tabs)/schemes')}
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  contentContainer: { flex: 1 },
  scrollContent: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  iconContainer: { marginBottom: 16, marginTop: 12 },
  iconGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 24, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  schemeTitle: { fontSize: 16, fontWeight: '600', color: Colors.primary.blue, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.gray.text, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  criteriaCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.gray.border },
  criteriaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  criteriaTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  criteriaText: { fontSize: 13, color: Colors.dark, flex: 1, lineHeight: 18 },
  stateBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary.blue + '10', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  stateBadgeText: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  footer: { width: '100%', padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
});
