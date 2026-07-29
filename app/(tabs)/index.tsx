import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell, ChevronRight, TrendingUp, Clock, Sparkles, FileText, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  featured: boolean;
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState({ applied: 0, approved: 0, pending: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch featured schemes
      const { data: schemesData } = await supabase
        .from('schemes')
        .select('id, name, description, category, featured')
        .eq('featured', true)
        .limit(6);

      setSchemes(schemesData || []);

      // Fetch user applications stats
      const { data: appData } = await supabase
        .from('applications')
        .select('status');

      if (appData) {
        setApplications({
          applied: appData.length,
          approved: appData.filter(a => a.status === 'approved').length,
          pending: appData.filter(a => a.status === 'submitted').length,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const quickStats = [
    { label: 'Applied', value: applications.applied.toString(), icon: FileText, color: Colors.primary.blue },
    { label: 'Approved', value: applications.approved.toString(), icon: CheckCircle2, color: Colors.success },
    { label: 'Pending', value: applications.pending.toString(), icon: Clock, color: Colors.warning },
  ];

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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors.primary.blue, '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.headerContent}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>
                  Welcome, {user?.name?.split(' ')[0] || 'Citizen'}!
                </Text>
                <Text style={styles.subtitle}>2026 Government Schemes</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                style={styles.bellButton}
              >
                <Bell size={20} color={Colors.white} strokeWidth={2.5} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Modern Search Bar */}
            <TouchableOpacity
              onPress={() => router.push('/scheme/search')}
              style={styles.searchBar}
              activeOpacity={0.8}
            >
              <Search size={18} color={Colors.gray.icon} strokeWidth={2} />
              <Text style={styles.searchText}>Search schemes & services</Text>
              <ChevronRight size={18} color={Colors.gray.icon} />
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                <stat.icon size={20} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Recommendations Section */}
        <TouchableOpacity
          onPress={() => router.push('/scheme/ai-recommendations')}
          style={styles.aiCard}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#2563EB', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiContent}>
              <View style={styles.aiLeft}>
                <View style={styles.aiIconBox}>
                  <Sparkles size={22} color={Colors.white} strokeWidth={2} />
                </View>
                <View style={styles.aiText}>
                  <Text style={styles.aiTitle}>AI-Powered Recommendations</Text>
                  <Text style={styles.aiDescription}>
                    Discover schemes perfectly matched to your profile
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Featured Schemes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured 2026 Schemes</Text>
              <Text style={styles.sectionSubtitle}>Government's latest initiatives</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/scheme/all')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary.blue} />
            </View>
          ) : schemes.length > 0 ? (
            schemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.id}
                onPress={() => router.push(`/scheme/${scheme.id}`)}
                style={styles.schemeCard}
                activeOpacity={0.8}
              >
                <View style={styles.schemeContent}>
                  <View
                    style={[
                      styles.schemeBadge,
                      { backgroundColor: getCategoryColor(scheme.category) + '15' },
                    ]}
                  >
                    <Text style={[styles.schemeBadgeText, { color: getCategoryColor(scheme.category) }]}>
                      {scheme.category}
                    </Text>
                  </View>
                  <Text style={styles.schemeName} numberOfLines={2}>
                    {scheme.name}
                  </Text>
                  <Text style={styles.schemeDescription} numberOfLines={2}>
                    {scheme.description}
                  </Text>
                  <View style={styles.schemeFooter}>
                    <Text style={styles.appliedCount}>4.2K applied</Text>
                    <ChevronRight size={16} color={Colors.primary.blue} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <AlertCircle size={32} color={Colors.gray.text} />
              <Text style={styles.emptyText}>No schemes available</Text>
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/application/tracking')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary.blue + '15' }]}>
                <FileText size={22} color={Colors.primary.blue} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Track</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/ai/chat')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary.green + '15' }]}>
                <Sparkles size={22} color={Colors.primary.green} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Ask AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/scheme/saved')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.warning + '15' }]}>
                <TrendingUp size={22} color={Colors.warning} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/support')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.error + '15' }]}>
                <AlertCircle size={22} color={Colors.error} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.bannerIcon}>
            <AlertCircle size={18} color={Colors.primary.blue} strokeWidth={2} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Did you know?</Text>
            <Text style={styles.bannerDescription}>
              You may be eligible for schemes you haven't discovered yet. Use AI Recommendations!
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.white + 'DD',
    fontWeight: '500',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: Colors.gray.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray.text,
    fontWeight: '600',
  },
  aiCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  aiGradient: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  aiDescription: {
    fontSize: 12,
    color: Colors.white + 'DD',
    lineHeight: 16,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.gray.text,
    marginTop: 2,
    fontWeight: '500',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
  schemeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
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
    marginBottom: 10,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedCount: {
    fontSize: 12,
    color: Colors.gray.text,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray.text,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
  },
  infoBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    backgroundColor: Colors.primary.blue + '10',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.blue,
    gap: 12,
    alignItems: 'flex-start',
  },
  bannerIcon: {
    marginTop: 2,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  bannerDescription: {
    fontSize: 12,
    color: Colors.gray.text,
    lineHeight: 16,
  },
});
