import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CircleCheck as CheckCircle, Clock, Upload, FileText, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header, AppButton } from '@/components/ui';
import { applications, schemes } from '@/constants/data';

export default function ApplicationDetailScreen() {
  const { id: appId } = useLocalSearchParams();
  const application = applications.find(a => a.id === appId) || applications[0];
  const scheme = schemes.find(s => s.id === application.schemeId) || schemes[0];

  const timeline = [
    { status: 'Submitted', date: 'Jan 5, 2024', icon: Upload, completed: true },
    { status: 'Documents Verified', date: 'Jan 8, 2024', icon: FileText, completed: application.currentStep > 2 },
    { status: 'Under Review', date: 'Jan 10, 2024', icon: Clock, completed: application.currentStep > 3 },
    { status: 'Approved', date: 'Jan 15, 2024', icon: CheckCircle, completed: application.status === 'approved' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Application Details" showBack onBackPress={() => router.back()} />

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.schemeName}>{application.schemeName}</Text>
          <Text style={styles.refNo}>Ref: PMSS-2024-0012345</Text>
          <View style={[styles.statusBadge, { backgroundColor: (application.status === 'approved' ? Colors.success : application.status === 'rejected' ? Colors.error : Colors.warning) + '20' }]}>
            <Text style={[styles.statusText, { color: application.status === 'approved' ? Colors.success : application.status === 'rejected' ? Colors.error : Colors.warning }]}>{application.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Application Timeline</Text>
        <View style={styles.timeline}>
          {timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineIcon, item.completed && styles.timelineIconCompleted]}>
                <item.icon size={18} color={item.completed ? Colors.white : Colors.gray.icon} />
              </View>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineLineFill, { height: item.completed ? '100%' : '25%', backgroundColor: item.completed ? Colors.success : Colors.gray.border }]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, item.completed && styles.timelineStatusCompleted]}>{item.status}</Text>
                <Text style={styles.timelineDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Documents Status</Text>
        <View style={styles.docsList}>
          {application.documents.map((doc, index) => (
            <View key={index} style={styles.docItem}>
              <View style={styles.docInfo}>
                <FileText size={18} color={Colors.primary.blue} />
                <Text style={styles.docName}>{doc.name}</Text>
              </View>
              <View style={styles.docStatus}>
                {doc.verified ? (
                  <CheckCircle size={18} color={Colors.success} />
                ) : doc.uploaded ? (
                  <Clock size={18} color={Colors.warning} />
                ) : (
                  <AlertCircle size={18} color={Colors.error} />
                )}
                <Text style={[styles.docStatusText, { color: doc.verified ? Colors.success : doc.uploaded ? Colors.warning : Colors.error }]}>
                  {doc.verified ? 'Verified' : doc.uploaded ? 'Pending' : 'Required'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  summaryCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16 },
  schemeName: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  refNo: { fontSize: 13, color: Colors.gray.text, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray.light, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineIconCompleted: { backgroundColor: Colors.success },
  timelineLine: { position: 'absolute', left: 17, top: 36, width: 2, height: 50 },
  timelineLineFill: { borderRadius: 1 },
  timelineContent: { marginLeft: 16, paddingTop: 6 },
  timelineStatus: { fontSize: 15, fontWeight: '500', color: Colors.gray.text },
  timelineStatusCompleted: { color: Colors.dark },
  timelineDate: { fontSize: 12, color: Colors.gray.text, marginTop: 2 },
  docsList: { backgroundColor: Colors.white, borderRadius: 12, padding: 16 },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  docInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  docName: { fontSize: 14, color: Colors.dark },
  docStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docStatusText: { fontSize: 13, fontWeight: '500' },
});
