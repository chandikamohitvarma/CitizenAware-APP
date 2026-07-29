import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';
import { Bookmark } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  featured: boolean;
}

export default function SavedSchemesScreen() {
  const { savedSchemes } = useSchemeStore();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedSchemes();
  }, [savedSchemes]);

  const loadSavedSchemes = async () => {
    try {
      setLoading(true);
      if (savedSchemes.length === 0) {
        setSchemes([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('schemes')
        .select('*')
        .in('id', savedSchemes);

      setSchemes(data || []);
    } catch (error) {
      console.error('Error loading saved schemes:', error);
    } finally {
      setLoading(false);
    }
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
    <SafeAreaView style={styles.container}>
      <Header title="Saved Schemes" showBack onBackPress={() => router.back()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      ) : schemes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bookmark size={60} color={Colors.gray.icon} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No Saved Schemes</Text>
          <Text style={styles.emptyDescription}>
            Save schemes to view them here for quick access
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/schemes')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Schemes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={schemes}
          keyExtractor={(item) => item.id}
          renderItem={renderSchemeCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
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
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: Colors.primary.blue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
});
