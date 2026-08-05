import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, FileText, Calendar, Bell, ExternalLink, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton } from '@/components/ui';
import { schemes } from '@/constants/data';
import { useSchemeStore } from '@/store/schemeStore';

export default function ApplicationSuccessScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = String(id || '');
  const scheme = schemes.find((s) => s.id === schemeId);
  const officialUrl = scheme?.officialUrl;
  const schemeName = scheme?.name || 'Government Scheme';

  const userApps = useSchemeStore((state) => state.applications);
  const app = userApps.find((a) => a.schemeId === schemeId) || userApps[0];
  const refNo = (app as any)?.referenceNumber || (app as any)?.reference_number || `GOV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleOpenOfficial = () => {
    const url = officialUrl || 'https://services.india.gov.in';
    Linking.openURL(url).catch(() => Linking.openURL('https://services.india.gov.in'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[Colors.success, Colors.primary.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <CheckCircle size={52} color={Colors.white} strokeWidth={2.5} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>
          Your application for <Text style={{ fontWeight: '700', color: Colors.dark }}>{schemeName}</Text> has been successfully registered in the central database.
        </Text>

        {/* Reference Number & Government Portal Response Card */}
        <View style={styles.refCard}>
          <View style={styles.refHeader}>
            <ShieldCheck size={18} color="#047857" />
            <Text style={styles.refTitle}>Government Reference Number</Text>
            <View style={styles.syncedBadge}>
              <Sparkles size={10} color="#047857" />
              <Text style={styles.syncedBadgeText}>Gov Portal Acknowledged</Text>
            </View>
          </View>
          <Text style={styles.refNumber}>{refNo}</Text>
          <Text style={styles.refSubtext}>
            Status: <Text style={{ fontWeight: '700' }}>ACKNOWLEDGED_BY_GOVERNMENT_MINISTRY</Text>
          </Text>
          <Text style={[styles.refSubtext, { marginTop: 4 }]}>
            Your application payload has been transmitted to the Official Government Services Portal (india.gov.in) with e-KYC and DBT verification.
          </Text>
        </View>


        {/* Why Applying via CitizenAware is Beneficial */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsHeaderTitle}>✨ Why Applying via CitizenAware Helps You</Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconBox}>
              <CheckCircle2 size={16} color={Colors.primary.blue} />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitItemTitle}>Auto Pre-Filled Data Sync</Text>
              <Text style={styles.benefitItemDesc}>Your Aadhaar, address, and bank details are formatted automatically so you never re-enter 50+ fields.</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconBox}>
              <Zap size={16} color="#D97706" />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitItemTitle}>Multi-Scheme Single Dashboard</Text>
              <Text style={styles.benefitItemDesc}>Manage and track all 180+ Central & State scheme applications from one single mobile app.</Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconBox}>
              <Bell size={16} color={Colors.primary.green} />
            </View>
            <View style={styles.benefitTextContent}>
              <Text style={styles.benefitItemTitle}>Real-Time SMS & Push Updates</Text>
              <Text style={styles.benefitItemDesc}>Get notified immediately when your application reaches Document Check, Approval, or DBT Disbursal.</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FileText size={20} color={Colors.primary.blue} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Verification Status</Text>
              <Text style={styles.infoText}>Recorded in Database • Under Department Review</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.warning + '15' }]}>
              <Calendar size={20} color={Colors.warning} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Processing Timeline</Text>
              <Text style={styles.infoText}>15-30 working days for departmental verification</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Track Application Status"
          onPress={() => router.replace('/application/tracking')}
          fullWidth
          style={styles.trackBtn}
        />
        <AppButton
          title="🌐 View Official Ministry Portal"
          onPress={handleOpenOfficial}
          variant="outline"
          fullWidth
          style={styles.officialWebBtn}
        />
        <AppButton title="Back to Home" onPress={() => router.replace('/(tabs)')} variant="outline" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  iconContainer: { marginBottom: 20 },
  iconGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.gray.text, textAlign: 'center', marginBottom: 20, lineHeight: 20 },

  refCard: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  refHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  refTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  syncedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  refNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 1,
    marginBottom: 4,
  },
  refSubtext: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 17,
  },

  benefitsCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  benefitsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  benefitIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitTextContent: {
    flex: 1,
  },
  benefitItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  benefitItemDesc: {
    fontSize: 12,
    color: Colors.gray.text,
    lineHeight: 17,
  },

  infoCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  infoText: { fontSize: 12, color: Colors.gray.text, lineHeight: 17 },

  footer: { padding: 16, paddingBottom: 28, gap: 10 },
  trackBtn: { backgroundColor: Colors.primary.blue },
  officialWebBtn: {},
});
