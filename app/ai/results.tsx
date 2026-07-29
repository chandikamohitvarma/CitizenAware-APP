import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sparkles, ChevronRight, Mic } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { SchemeCard, AppButton, Header } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function AIVoiceResultsScreen() {
  const matchedSchemes = schemes.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Voice Results" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.queryCard}>
          <Sparkles size={20} color={Colors.primary.blue} />
          <Text style={styles.queryText}>"Show education schemes"</Text>
        </View>

        <Text style={styles.matchCount}>Found {matchedSchemes.length} matching schemes</Text>

        {matchedSchemes.map((scheme) => (
          <TouchableOpacity key={scheme.id} onPress={() => router.push(`/scheme/${scheme.id}`)}>
            <SchemeCard scheme={scheme} compact />
          </TouchableOpacity>
        ))}

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Related Suggestions</Text>
          {['Check PM Scholarship eligibility', 'Compare education schemes', 'View application process'].map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestionItem}>
              <Text style={styles.suggestionText}>{s}</Text>
              <ChevronRight size={18} color={Colors.gray.icon} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.micButton} onPress={() => router.push('/ai/voice')}>
          <Mic size={22} color={Colors.primary.blue} />
          <Text style={styles.micText}>Speak Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  queryCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary.blue + '15', borderRadius: 12, padding: 14, marginBottom: 16 },
  queryText: { fontSize: 15, color: Colors.primary.blue, fontWeight: '500' },
  matchCount: { fontSize: 14, color: Colors.gray.text, marginBottom: 16 },
  suggestions: { marginTop: 16 },
  suggestionsTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: 10, padding: 14, marginBottom: 8 },
  suggestionText: { fontSize: 14, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  micButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: Colors.primary.blue + '15' },
  micText: { fontSize: 15, fontWeight: '600', color: Colors.primary.blue },
});
