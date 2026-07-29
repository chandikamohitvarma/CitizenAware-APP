import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, FileText, Calendar, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton } from '@/components/ui';

export default function ApplicationSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[Colors.success, Colors.primary.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <CheckCircle size={50} color={Colors.white} strokeWidth={2} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>
          Your application for PM Scholarship Scheme has been successfully submitted
        </Text>

        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Application Reference No.</Text>
          <Text style={styles.refNo}>PMSS-2024-0012345</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FileText size={20} color={Colors.primary.blue} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoText}>Your application will be reviewed by the concerned department</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.warning + '15' }]}>
              <Calendar size={20} color={Colors.warning} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Expected Timeline</Text>
              <Text style={styles.infoText}>15-30 working days for processing</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: Colors.success + '15' }]}>
              <Bell size={20} color={Colors.success} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Stay Updated</Text>
              <Text style={styles.infoText}>You'll receive notifications on status changes</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton title="Track Application" onPress={() => router.replace('/application/tracking')} fullWidth style={styles.trackBtn} />
        <AppButton title="Go to Home" onPress={() => router.replace('/(tabs)')} variant="outline" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 60 },
  iconContainer: { marginBottom: 32 },
  iconGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: Colors.dark, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.gray.text, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  refCard: { backgroundColor: Colors.primary.blue + '15', borderRadius: 16, paddingVertical: 24, paddingHorizontal: 40, marginBottom: 24 },
  refLabel: { fontSize: 13, color: Colors.gray.text, marginBottom: 8 },
  refNo: { fontSize: 20, fontWeight: '700', color: Colors.primary.blue },
  infoCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primary.blue + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.gray.text, lineHeight: 19 },
  footer: { padding: 24, paddingBottom: 40 },
  trackBtn: { marginBottom: 12 },
});
