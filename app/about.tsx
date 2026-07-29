import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, Mail, Phone, ExternalLink, Award } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="About CitizenAware" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[Colors.primary.blue, Colors.primary.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>CA</Text>
          </LinearGradient>
          <Text style={styles.appName}>CitizenAware</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          CitizenAware is an AI-powered mobile application that helps citizens discover and apply for government schemes and services. Our mission is to bridge the gap between citizens and government welfare programs.
        </Text>

        <View style={styles.feature}>
          <Award size={20} color={Colors.primary.blue} />
          <Text style={styles.featureText}>Discover 100+ government schemes</Text>
        </View>
        <View style={styles.feature}>
          <Award size={20} color={Colors.primary.blue} />
          <Text style={styles.featureText}>AI-powered recommendations</Text>
        </View>
        <View style={styles.feature}>
          <Award size={20} color={Colors.primary.blue} />
          <Text style={styles.featureText}>Easy application process</Text>
        </View>
        <View style={styles.feature}>
          <Award size={20} color={Colors.primary.blue} />
          <Text style={styles.featureText}>Real-time tracking</Text>
        </View>

        <Text style={styles.sectionTitle}>Partners</Text>
        <View style={styles.partnersGrid}>
          {['Ministry of Education', 'Ministry of Health', 'Ministry of Finance'].map((partner, i) => (
            <View key={i} style={styles.partnerItem}>
              <Text style={styles.partnerText}>{partner}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Contact</Text>
        <TouchableOpacity style={styles.contactRow}>
          <Globe size={18} color={Colors.gray.icon} />
          <Text style={styles.contactText}>www.citizenaware.gov.in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow}>
          <Mail size={18} color={Colors.gray.icon} />
          <Text style={styles.contactText}>support@citizenaware.gov.in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow}>
          <Phone size={18} color={Colors.gray.icon} />
          <Text style={styles.contactText}>1800-XXX-XXXX</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tosLink}>
          <Text style={styles.tosText}>Terms of Service</Text>
          <ExternalLink size={14} color={Colors.primary.blue} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tosLink}>
          <Text style={styles.tosText}>Privacy Policy</Text>
          <ExternalLink size={14} color={Colors.primary.blue} />
        </TouchableOpacity>

        <Text style={styles.footer}>
          Made with care for the citizens of India
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  logoSection: { alignItems: 'center', paddingVertical: 24 },
  logo: { width: 90, height: 90, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: '800', color: Colors.white },
  appName: { fontSize: 26, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  version: { fontSize: 13, color: Colors.gray.text },
  description: { fontSize: 15, color: Colors.gray.text, textAlign: 'center', lineHeight: 23, marginBottom: 24 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 15, color: Colors.dark },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginTop: 20, marginBottom: 12 },
  partnersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  partnerItem: { backgroundColor: Colors.white, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 },
  partnerText: { fontSize: 13, color: Colors.dark },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  contactText: { fontSize: 14, color: Colors.dark },
  tosLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  tosText: { fontSize: 14, color: Colors.primary.blue, fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 12, color: Colors.gray.text, marginTop: 24, marginBottom: 40 },
});
