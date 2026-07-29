import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Bookmark, Share2, Users, Calendar, Building, ChevronRight, CircleCheck, CircleAlert as AlertCircle, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';
import { supabase } from '@/lib/supabase';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  documents_required: string[];
  featured: boolean;
  eligibility?: { requirements?: string[] };
}

export default function SchemeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { isSchemeSaved, saveScheme, unsaveScheme } = useSchemeStore();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadScheme();
  }, [id]);

  const loadScheme = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('schemes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setScheme(data);
        setSaved(isSchemeSaved(data.id));
      }
    } catch (error) {
      console.error('Error loading scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (scheme) {
      if (saved) {
        unsaveScheme(scheme.id);
      } else {
        saveScheme(scheme.id);
      }
      setSaved(!saved);
    }
  };

  const handleApply = () => {
    if (scheme) {
      router.push(`/apply/${scheme.id}`);
    }
  };

  const handleCheckEligibility = () => {
    if (scheme) {
      router.push(`/scheme/eligibility/${scheme.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.blue} />
      </View>
    );
  }

  if (!scheme) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Scheme" showBack onBackPress={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Scheme not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronRight size={24} color={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
              <Bookmark
                size={22}
                color={saved ? Colors.primary.blue : Colors.gray.icon}
                fill={saved ? Colors.primary.blue : 'transparent'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={22} color={Colors.gray.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{scheme.category}</Text>
          <Text style={styles.title}>{scheme.name}</Text>

          <Text style={styles.description}>{scheme.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Users size={20} color={Colors.primary.blue} />
              <Text style={styles.statValue}>4.2K</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={20} color={Colors.warning} />
              <Text style={styles.statValue}>Dec 31</Text>
              <Text style={styles.statLabel}>Deadline</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Scheme</Text>
            <View style={styles.infoCard}>
              <Building size={20} color={Colors.primary.blue} />
              <View>
                <Text style={styles.infoLabel}>Government Program</Text>
                <Text style={styles.infoText}>Latest scheme for 2026</Text>
              </View>
            </View>
          </View>

          {scheme.eligibility?.requirements && scheme.eligibility.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
              {scheme.eligibility.requirements.map((req, index) => (
                <View key={index} style={styles.listItem}>
                  <CircleCheck size={20} color={Colors.success} />
                  <Text style={styles.listText}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {scheme.documents_required && scheme.documents_required.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Documents</Text>
              {scheme.documents_required.map((doc, index) => (
                <View key={index} style={styles.listItem}>
                  <FileText size={20} color={Colors.primary.blue} />
                  <Text style={styles.listText}>{doc}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.eligibilityCard}
            onPress={handleCheckEligibility}
          >
            <View style={styles.eligibilityContent}>
              <AlertCircle size={24} color={Colors.primary.blue} />
              <View style={styles.eligibilityText}>
                <Text style={styles.eligibilityTitle}>Check Your Eligibility</Text>
                <Text style={styles.eligibilityDesc}>
                  Answer a few questions to know if you qualify
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.gray.icon} />
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Apply Now"
          onPress={handleApply}
          fullWidth
          icon={<ChevronRight size={20} color={Colors.white} />}
          iconPosition="right"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray.text,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.blue,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 14,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: Colors.gray.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: Colors.gray.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
    marginTop: 2,
  },
  eligibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.blue + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.blue,
  },
  eligibilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  eligibilityText: {
    flex: 1,
  },
  eligibilityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  eligibilityDesc: {
    fontSize: 13,
    color: Colors.gray.text,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
});
