import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, TrendingUp, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { SchemeCard } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';

const recentSearches = ['PM Scholarship', 'Health Insurance', 'Farmer', 'Education Loan'];

export default function SearchSchemesScreen() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const { searchSchemes, recentlyViewed, getSchemes } = useSchemeStore();
  const [results, setResults] = useState(getSchemes().slice(0, 5));

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setSearching(true);
      setResults(searchSchemes(text));
    } else {
      setSearching(false);
      setResults(getSchemes().slice(0, 5));
    }
  };

  const popularSchemes = getSchemes().filter(s => s.featured);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.gray.icon} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search schemes..."
            placeholderTextColor={Colors.gray.icon}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={20} color={Colors.gray.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/scheme/${item.id}`)}>
            <SchemeCard scheme={item} compact />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.results}
        ListHeaderComponent={
          !searching ? (
            <View style={styles.suggestions}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, index) => (
                <TouchableOpacity key={index} style={styles.recentItem} onPress={() => handleSearch(search)}>
                  <Clock size={16} color={Colors.gray.icon} />
                  <Text style={styles.recentText}>{search}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Popular Schemes</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchHeader: { padding: 16, backgroundColor: Colors.white },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: Colors.dark },
  results: { padding: 16 },
  suggestions: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  recentText: { fontSize: 15, color: Colors.gray.text },
});
