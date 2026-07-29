import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { supabase } from '@/lib/supabase';

interface Category {
  name: string;
  count: number;
  color: string;
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Array<Category & { id: string }>>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('schemes').select('category');

      if (data) {
        const categoryMap = new Map<string, number>();
        data.forEach((item: any) => {
          const cat = item.category;
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        const categoryList = Array.from(categoryMap.entries()).map(([name, count], index) => ({
          id: `${index}`,
          name,
          count,
          color: categoryColors[name] || Colors.primary.blue,
        }));

        setCategories(categoryList);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryCard = ({ item }: { item: Category & { id: string } }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/scheme/category/[id]',
        params: { id: item.name, name: item.name },
      })}
      style={[styles.categoryCard, { backgroundColor: item.color + '10' }]}
      activeOpacity={0.8}
    >
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <Text style={styles.categoryName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.count} schemes</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Categories" showBack onBackPress={() => router.back()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryCard}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
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
  grid: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.gray.text,
    fontWeight: '500',
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
    fontSize: 16,
    color: Colors.gray.text,
    fontWeight: '500',
  },
});
