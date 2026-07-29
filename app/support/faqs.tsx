import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronDown, ChevronUp } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { FAQs } from '@/constants/data';

export default function FAQsScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="FAQs" showBack onBackPress={() => router.back()} />
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.gray.icon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search FAQs..."
          placeholderTextColor={Colors.gray.icon}
        />
      </View>
      <ScrollView style={styles.content}>
        {filteredFAQs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => setExpanded(expanded === faq.id ? null : faq.id)}
            activeOpacity={0.8}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question}>{faq.question}</Text>
              {expanded === faq.id ? (
                <ChevronUp size={20} color={Colors.gray.icon} />
              ) : (
                <ChevronDown size={20} color={Colors.gray.icon} />
              )}
            </View>
            {expanded === faq.id && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.dark },
  content: { padding: 16, paddingTop: 0 },
  faqItem: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.dark, marginRight: 12 },
  answer: { fontSize: 14, color: Colors.gray.text, marginTop: 12, lineHeight: 21 },
});
