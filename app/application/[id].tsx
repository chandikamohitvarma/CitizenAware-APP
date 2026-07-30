import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle, Clock, Upload, FileText, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header, AppButton } from '@/components/ui';
import { applications as localApps, schemes as localSchemes } from '@/constants/data';
import { getApplications } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function ApplicationDetailScreen() {
  const { id: appId } = useLocalSearchParams();
  const { token } = useAuthStore();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppDetails();
  }, [appId, token]);

  const loadAppDetails = async () => {
    try {
      setLoading(true);
      if (token) {
        const userApps = await getApplications(token);
        const found = userApps.find((a: any) => String(a.id) === String(appId));
        if (found) {
          setApp(found);
          setLoading(false);
          return;
        }
      }

      const fallback = localApps.find(a => String(a.id) === String(appId)) || localApps[0];
      setApp(fallback);
    } catch (err) {
      console.log('Error loading app detail:', err);
      const fallback = localApps.find(a => String(a.id) === String(appId)) || localApps[0];
      setApp(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !app) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Application Details" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/application/tracking')} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      </SafeAreaView>
    );
  }

  const schemeName = app.scheme_name || app.schemeName || 'Government Scheme Application';
  const currentStep = app.current_step ?? app.currentStep ?? 1;
  const totalSteps = app.total_steps ?? app.totalSteps ?? 6;
  const status = app.status || 'submitted';
  const refNo = app.reference_number || app.id ? `REF-${String(app.id).slice(0, 8).toUpperCase()}` : 'REF-2026-987654';

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isDraft = status === 'draft' || status === 'pending';

  const statusColor = isApproved ? Colors.success : isRejected ? Colors.error : isDraft ? Colors.primary.blue : Colors.warning;
  const statusLabel = isDraft ? 'IN PROGRESS (DRAFT)' : status === 'submitted' || status === 'in_review' ? 'UNDER REVIEW' : status.toUpperCase();

  const timeline = [
    { status: 'Submitted & Identity Verification', date: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : 'Submitted', icon: Upload, completed: true },
    { status: 'Address & Category Check', date: 'Verification Complete', icon: FileText, completed: currentStep > 2 || isApproved },
    { status: 'Documents Verification', date: 'Document Check', icon: Clock, completed: currentStep > 4 || isApproved },
    { status: 'DBT Bank Account Verification', date: 'Bank Link Verified', icon: CheckCircle, completed: currentStep > 5 || isApproved },
    { status: isApproved ? 'Approved & Benefit Issued' : isRejected ? 'Rejected' : 'Final Approval Pending', date: isApproved ? 'Sanctioned' : 'Processing', icon: isApproved ? CheckCircle : isRejected ? AlertCircle : Clock, completed: isApproved },
  ];

  const docs = [
    { name: 'Aadhaar Identity Card', verified: true },
    { name: 'Domicile / Address Certificate', verified: currentStep > 2 || isApproved },
    { name: 'Income / Category Certificate', verified: currentStep > 3 || isApproved },
    { name: 'Aadhaar-Linked Bank Passbook', verified: currentStep > 4 || isApproved },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Application Details"
        showBack
        onBackPress={() => router.canGoBack() ? router.back() : router.push('/application/tracking')}
      />

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.schemeName}>{schemeName}</Text>
          <Text style={styles.refNo}>{refNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>

          <View style={styles.stepInfoContainer}>
            <Text style={styles.stepTitle}>Application Progress ({currentStep} of {totalSteps} Steps)</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: statusColor }]} />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Application Processing Timeline</Text>
        <View style={styles.timeline}>
          {timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineIcon, item.completed && { backgroundColor: Colors.success }]}>
                <item.icon size={18} color={item.completed ? Colors.white : Colors.gray.icon} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, item.completed && styles.timelineStatusCompleted]}>{item.status}</Text>
                <Text style={styles.timelineDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Required Verification Documents</Text>
        <View style={styles.docsList}>
          {docs.map((doc, index) => (
            <View key={index} style={styles.docItem}>
              <View style={styles.docInfo}>
                <FileText size={18} color={Colors.primary.blue} />
                <Text style={styles.docName}>{doc.name}</Text>
              </View>
              <View style={styles.docStatus}>
                {doc.verified ? (
                  <CheckCircle size={18} color={Colors.success} />
                ) : (
                  <Clock size={18} color={Colors.warning} />
                )}
                <Text style={[styles.docStatusText, { color: doc.verified ? Colors.success : Colors.warning }]}>
                  {doc.verified ? 'Verified' : 'Pending Verification'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {isDraft && (
          <AppButton
            title="Resume & Complete Application"
            onPress={() => {
              const schemeId = app.scheme_id || app.schemeId || '1';
              router.push(`/apply/${schemeId}/personal`);
            }}
            fullWidth
            style={{ marginTop: 24, marginBottom: 32 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  summaryCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  schemeName: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 4, textAlign: 'center' },
  refNo: { fontSize: 13, color: Colors.gray.text, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  statusText: { fontSize: 13, fontWeight: '700' },
  stepInfoContainer: { width: '100%', marginTop: 8 },
  stepTitle: { fontSize: 12, fontWeight: '600', color: Colors.gray.text, marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: Colors.gray.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12, marginTop: 12 },
  timeline: { paddingLeft: 4, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray.light, alignItems: 'center', justifyContent: 'center' },
  timelineContent: { marginLeft: 14 },
  timelineStatus: { fontSize: 14, fontWeight: '500', color: Colors.gray.text },
  timelineStatusCompleted: { color: Colors.dark, fontWeight: '600' },
  timelineDate: { fontSize: 12, color: Colors.gray.text, marginTop: 2 },
  docsList: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 24 },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  docInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docName: { fontSize: 14, color: Colors.dark, fontWeight: '500' },
  docStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docStatusText: { fontSize: 12, fontWeight: '600' },
});
