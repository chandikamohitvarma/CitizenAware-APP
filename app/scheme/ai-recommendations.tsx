import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { SchemeCard, Header } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function AIRecommendationsScreen() {
  const recommendedSchemes = schemes.filter(s => s.featured);

  const reasons = [
    { scheme: 'PM Scholarship Scheme', reason: 'Based on your education level and income' },
    { scheme: 'Ayushman Bharat', reason: 'Matches your healthcare needs and family size' },
    { scheme: 'PM Awas Yojana', reason: 'You meet the income criteria for housing benefits' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI Recommendations" showBack onBackPress={() => router.back()} />

      <View style={styles.introCard}>
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.introGradient}
        >
          <Sparkles size={32} color={Colors.white} />
          <Text style={styles.introTitle}>Personalized for You</Text>
          <Text style={styles.introText}>
            Based on your profile, we found {recommendedSchemes.length} schemes you're likely eligible for
          </Text>
        </LinearGradient>
      </View>

      <FlatList
        data={recommendedSchemes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => router.push(`/scheme/${item.id}`)}>
            <View>
              <View style={styles.reasonCard}>
                <View style={styles.reasonIcon}>
                  <Sparkles size={16} color={Colors.primary.blue} />
                </View>
                <Text style={styles.reasonText}>
                  {reasons[index]?.reason || 'Recommended based on your profile'}
                </Text>
              </View>
              <SchemeCard scheme={item} />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  introCard: { padding: 16 },
  introGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  introTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  introText: { fontSize: 14, color: Colors.white + 'CC', textAlign: 'center' },
  list: { padding: 16 },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  reasonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: { flex: 1, fontSize: 13, color: Colors.primary.blue, fontWeight: '500' },
});
