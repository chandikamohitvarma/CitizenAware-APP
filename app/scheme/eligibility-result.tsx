import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';

export default function EligibilityResultScreen() {
  const isEligible = true;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Eligibility Result" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isEligible ? (
            <LinearGradient
              colors={[Colors.success, Colors.primary.green]}
              style={styles.iconGradient}
            >
              <CheckCircle size={64} color={Colors.white} />
            </LinearGradient>
          ) : (
            <View style={[styles.iconGradient, { backgroundColor: Colors.error + '20' }]}>
              <XCircle size={64} color={Colors.error} />
            </View>
          )}
        </View>

        <Text style={styles.title}>
          {isEligible ? 'Congratulations!' : 'Not Eligible'}
        </Text>
        <Text style={styles.subtitle}>
          {isEligible
            ? 'You are eligible for PM Scholarship Scheme. You can now proceed with your application.'
            : 'Unfortunately, you do not meet the eligibility criteria for this scheme. Please check other schemes.'
          }
        </Text>

        {isEligible && (
          <View style={styles.criteriaCard}>
            <Text style={styles.criteriaTitle}>Eligibility Criteria Met</Text>
            {['Family income below INR 6 lakh', 'Minimum 60% marks', 'Indian citizen'].map((item, i) => (
              <View key={i} style={styles.criteriaItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.criteriaText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          {isEligible ? (
            <AppButton title="Apply Now" onPress={() => router.push('/apply/1')} fullWidth />
          ) : (
            <AppButton title="Browse Other Schemes" onPress={() => router.push('/(tabs)/schemes')} fullWidth />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', padding: 32 },
  iconContainer: { marginBottom: 24 },
  iconGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  subtitle: { fontSize: 15, color: Colors.gray.text, textAlign: 'center', lineHeight: 24 },
  criteriaCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginTop: 32 },
  criteriaTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  criteriaText: { fontSize: 14, color: Colors.dark },
  footer: { width: '100%', position: 'absolute', bottom: 40, paddingHorizontal: 32 },
});
