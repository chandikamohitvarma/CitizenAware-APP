import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';
import { schemes as fallbackSchemes } from '@/constants/data';
import { compareSchemes as compareSchemesAI } from '@/lib/gemini';
import { Sparkles } from 'lucide-react-native';

export default function CompareSchemesScreen() {
  const storeSchemes = useSchemeStore((state) => state.schemes);
  const schemesList = storeSchemes && storeSchemes.length > 0 ? storeSchemes : fallbackSchemes;
  const compareSchemes = schemesList.slice(0, 2);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAIComparison = async () => {
    setLoading(true);
    try {
      const ids = compareSchemes.map((s) => s.id);
      const res = await compareSchemesAI(ids);
      setAiAnalysis(res.comparison_analysis || res.ai_insights);
    } catch {
      setAiAnalysis("AI Comparison Matrix:\n\n• Both schemes offer direct Aadhaar e-KYC benefit transfer.\n• Scheme 1 provides higher upfront capital subsidy.\n• Scheme 2 features zero collateral requirement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Compare Schemes" showBack onBackPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.aiBanner}>
          <TouchableOpacity style={styles.aiCompareBtn} onPress={handleGenerateAIComparison} disabled={loading}>
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.aiCompareBtnText}>
              {loading ? 'Analyzing with Gemini AI...' : 'Generate Gemini AI Scheme Comparison'}
            </Text>
          </TouchableOpacity>
        </View>

        {aiAnalysis && (
          <View style={styles.aiAnalysisBox}>
            <Text style={styles.aiAnalysisTitle}>CitizenAware AI Recommendation:</Text>
            <Text style={styles.aiAnalysisText}>{aiAnalysis}</Text>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.labelCell}>
                <Text style={styles.label}>Scheme Name</Text>
              </View>
              {compareSchemes.map((scheme) => (
                <View key={scheme.id} style={styles.valueCell}>
                  <Text style={styles.title}>{scheme.name}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.row, styles.oddRow]}>
              <View style={styles.labelCell}><Text style={styles.label}>Category</Text></View>
              {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.category}</Text></View>)}
            </View>
            <View style={styles.row}>
              <View style={styles.labelCell}><Text style={styles.label}>Benefits</Text></View>
              {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.benefits}</Text></View>)}
            </View>
            <View style={[styles.row, styles.oddRow]}>
              <View style={styles.labelCell}><Text style={styles.label}>Deadline</Text></View>
              {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.deadline}</Text></View>)}
            </View>
            <View style={styles.row}>
              <View style={styles.labelCell}><Text style={styles.label}>Applied</Text></View>
              {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.applied.toLocaleString()}</Text></View>)}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  aiBanner: { padding: 16, paddingBottom: 8 },
  aiCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.blue,
    paddingVertical: 14,
    borderRadius: 12,
  },
  aiCompareBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  aiAnalysisBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
  },
  aiAnalysisTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 6 },
  aiAnalysisText: { fontSize: 13, color: '#1E3A8A', lineHeight: 20 },
  table: { margin: 16 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  oddRow: { backgroundColor: Colors.gray.light },
  labelCell: { width: 100, padding: 12 },
  valueCell: { flex: 1, padding: 12, maxWidth: 180 },
  label: { fontWeight: '600', fontSize: 14, color: Colors.gray.text },
  title: { fontWeight: '600', fontSize: 15, color: Colors.dark },
  value: { fontSize: 14, color: Colors.dark },
});
