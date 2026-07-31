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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, X, ChevronDown, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { getSchemes } from '@/lib/api';
import { schemes as defaultSchemes } from '@/constants/data';
import { INDIAN_STATES, TOP_STATES } from '@/constants/states';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  featured: boolean;
  state?: string;
  eligibility?: string[];
}

export default function SchemesScreen() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('All India (Central)');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    loadSchemes();
  }, []);

  useEffect(() => {
    filterSchemes();
  }, [searchQuery, selectedCategory, selectedState, schemes]);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const data = await getSchemes();

      if (data && data.length > 0) {
        // Merge with local state schemes
        const localStateSchemes = defaultSchemes.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          featured: s.featured,
          state: s.state || 'All India (Central)',
        }));
        
        // Combine unique schemes
        const combined = [...data];
        localStateSchemes.forEach(ls => {
          if (!combined.some(c => c.name === ls.name)) {
            combined.push(ls);
          }
        });

        setSchemes(combined);
        const uniqueCategories = [...new Set(combined.map((s: Scheme) => s.category))];
        setCategories(uniqueCategories as string[]);
      } else {
        setSchemes(defaultSchemes as any);
        const uniqueCategories = [...new Set(defaultSchemes.map(s => s.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.log('Using fallback scheme data:', error);
      setSchemes(defaultSchemes as any);
      const uniqueCategories = [...new Set(defaultSchemes.map(s => s.category))];
      setCategories(uniqueCategories);
    } finally {
      setLoading(false);
    }
  };

  const filterSchemes = () => {
    let filtered = schemes;

    // State Filter
    if (selectedState !== 'All India (Central)') {
      filtered = filtered.filter(
        (s) => !s.state || s.state === 'All India (Central)' || s.state.toLowerCase() === selectedState.toLowerCase()
      );
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          (s.state && s.state.toLowerCase().includes(query))
      );
    }

    // Category Filter
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
      'Women & Child': '#EC4899',
    };
    return categoryColors[category] || Colors.primary.blue;
  };

  const filteredStateList = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const renderSchemeCard = ({ item }: { item: Scheme }) => (
    <TouchableOpacity
      onPress={() => router.push(`/scheme/${item.id}`)}
      style={styles.schemeCard}
      activeOpacity={0.8}
    >
      <View style={styles.schemeContent}>
        <View style={styles.badgesRow}>
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

          <View style={styles.stateTag}>
            <MapPin size={10} color={Colors.primary.blue} />
            <Text style={styles.stateTagText}>{item.state || 'Central'}</Text>
          </View>
        </View>

        <Text style={styles.schemeName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.schemeDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardActionRow}>
          <TouchableOpacity
            style={styles.checkEligBtn}
            onPress={() => router.push(`/scheme/eligibility/${item.id}`)}
          >
            <CheckCircle size={12} color={Colors.primary.green} />
            <Text style={styles.checkEligText}>Eligibility</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyNowCardBtn}
            onPress={() => router.push(`/apply/${item.id}`)}
          >
            <Text style={styles.applyNowCardText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Government Schemes</Text>
        <Text style={styles.count}>{filteredSchemes.length} active schemes available in India</Text>
      </View>

      {/* State Selector Filter Bar */}
      <View style={styles.stateFilterContainer}>
        <Text style={styles.filterLabel}>Filter by State / UT:</Text>
        <TouchableOpacity style={styles.stateDropdownBtn} onPress={() => setIsStateModalOpen(true)}>
          <MapPin size={16} color={Colors.primary.blue} />
          <Text style={styles.stateDropdownText}>{selectedState}</Text>
          <ChevronDown size={16} color={Colors.gray.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.gray.icon} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes by name or benefit..."
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
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
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
          <Text style={styles.emptyText}>No schemes found for {selectedState}</Text>
          <Text style={styles.emptySubtext}>Try changing state or clearing filters</Text>
        </View>
      )}

      {/* All Indian States Modal */}
      <Modal visible={isStateModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State / UT in India</Text>
            <TouchableOpacity onPress={() => setIsStateModalOpen(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalSearch}>
            <Search size={18} color={Colors.gray.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15 }}
              placeholder="Search 36 Indian States & UTs..."
              value={stateSearch}
              onChangeText={setStateSearch}
            />
          </View>
          <FlatList
            data={filteredStateList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.stateItem, selectedState === item && styles.stateItemActive]}
                onPress={() => {
                  setSelectedState(item);
                  setIsStateModalOpen(false);
                }}
              >
                <Text style={[styles.stateItemText, selectedState === item && styles.stateItemTextActive]}>
                  {item}
                </Text>
                {selectedState === item && <MapPin size={18} color={Colors.primary.blue} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  count: {
    fontSize: 13,
    color: Colors.gray.text,
    marginTop: 2,
    fontWeight: '500',
  },
  stateFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
  },
  stateDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary.blue + '40',
  },
  stateDropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
  },
  filtersRow: {
    paddingVertical: 8,
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
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  schemeContent: {
    padding: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  schemeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  schemeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary.blue + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateTagText: {
    fontSize: 11,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
  schemeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
    lineHeight: 20,
  },
  schemeDescription: {
    fontSize: 13,
    color: Colors.gray.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border + '60',
    paddingTop: 8,
  },
  checkEligBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primary.green + '12',
    borderRadius: 8,
  },
  checkEligText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.green,
  },
  applyNowCardBtn: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  applyNowCardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.gray.text,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.white, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray.light, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  stateItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  stateItemActive: { backgroundColor: Colors.primary.blue + '10' },
  stateItemText: { fontSize: 15, color: Colors.dark },
  stateItemTextActive: { fontWeight: '700', color: Colors.primary.blue },
});
