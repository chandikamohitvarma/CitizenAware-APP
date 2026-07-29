import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle as HelpCircle, MessageCircle, Phone, Mail, ChevronRight, FileText, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';

export default function HelpSupportScreen() {
  const supportOptions = [
    { icon: FileText, label: 'FAQs', desc: 'Find answers to common questions', route: '/support/faqs' },
    { icon: MessageCircle, label: 'Raise a Ticket', desc: 'Submit a support request', route: '/support/ticket/new' },
    { icon: FileText, label: 'My Tickets', desc: 'View your support tickets', route: '/support/ticket/new' },
  ];

  const contactOptions = [
    { icon: Phone, label: 'Helpline', value: '1800-XXX-XXXX' },
    { icon: Mail, label: 'Email', value: 'support@citizenaware.gov' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Help & Support" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <HelpCircle size={48} color={Colors.primary.blue} />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroDesc}>We're here to assist you with any questions or issues</Text>
        </View>

        <Text style={styles.sectionTitle}>Get Help</Text>
        {supportOptions.map((opt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={() => router.push(opt.route as any)}
          >
            <View style={[styles.optIcon, { backgroundColor: Colors.primary.blue + '15' }]}>
              <opt.icon size={22} color={Colors.primary.blue} />
            </View>
            <View style={styles.optInfo}>
              <Text style={styles.optLabel}>{opt.label}</Text>
              <Text style={styles.optDesc}>{opt.desc}</Text>
            </View>
            <ChevronRight size={20} color={Colors.gray.icon} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Contact Us</Text>
        {contactOptions.map((opt, index) => (
          <TouchableOpacity key={index} style={styles.contactCard}>
            <opt.icon size={20} color={Colors.primary.blue} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{opt.label}</Text>
              <Text style={styles.contactValue}>{opt.value}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.hours}>Available 24/7</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 24, marginBottom: 24 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginTop: 12, marginBottom: 8 },
  heroDesc: { fontSize: 14, color: Colors.gray.text, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  optIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optInfo: { flex: 1 },
  optLabel: { fontSize: 16, fontWeight: '600', color: Colors.dark },
  optDesc: { fontSize: 13, color: Colors.gray.text, marginTop: 2 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 10, padding: 14, marginBottom: 8 },
  contactInfo: {},
  contactLabel: { fontSize: 14, fontWeight: '500', color: Colors.gray.text },
  contactValue: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginTop: 2 },
  hours: { textAlign: 'center', fontSize: 13, color: Colors.gray.text, marginTop: 24 },
});
