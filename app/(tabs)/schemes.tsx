import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ListFilter as Filter, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  featured: boolean;
}

export default function SchemesScreen() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchQuery, selectedCategory, schemes]);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('schemes').select('*');

      if (data) {
        setSchemes(data);
        const uniqueCategories = [...new Set(data.map((s: Scheme) => s.category))];
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {
      console.error('Error loading schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    let filtered = schemes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    setFilteredSchemes(filtered);
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Digital Infrastructure': Colors.primary.blue,
      'Skills & Employment': Colors.primary.green,
      'Environment': '#10B981',
      'Healthcare': Colors.error,
      'Education': Colors.primary.blue,
      'Housing': '#F59E0B',
      'Business & Startup': Colors.primary.green,
      'Social Security': '#8B5CF6',
      'Agriculture': '#059669',
      'Finance': '#0EA5E9',
    };
    return categoryColors[category] || Colors.primary.blue;
  };

  const renderSchemeCard = ({ item }: { item: Scheme }) => (
    <TouchableOpacity
      onPress={() => router.push(`/scheme/${item.id}`)}
      style={styles.schemeCard}
      activeOpacity={0.8}
    >
      <View style={styles.schemeContent}>
        <View
          style={[
            styles.schemeBadge,
            { backgroundColor: getCategoryColor(item.category) + '15' },
          ]}
        >
          <Text style={[styles.schemeBadgeText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.schemeName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.schemeDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Schemes</Text>
        <Text style={styles.count}>{filteredSchemes.length} schemes available</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.gray.icon} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes..."
            placeholderTextColor={Colors.gray.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.gray.icon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {categories.length > 0 && (
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.slice(0, 6).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      ) : filteredSchemes.length > 0 ? (
        <FlatList
          data={filteredSchemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSchemeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No schemes found</Text>
          <Text style={styles.emptySubtext}>Try different search or category</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  count: {
    fontSize: 14,
    color: Colors.gray.text,
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '500',
  },
  filtersRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  schemeCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  schemeContent: {
    padding: 16,
  },
  schemeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  schemeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  schemeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 6,
    lineHeight: 20,
  },
  schemeDescription: {
    fontSize: 13,
    color: Colors.gray.text,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray.text,
  },
});
