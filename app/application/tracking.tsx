import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, FileText, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useSchemeStore } from '@/store/schemeStore';

interface Application {
  id: string;
  scheme_name?: string;
  schemeName?: string;
  status: string;
  current_step?: number;
  currentStep?: number;
  total_steps?: number;
  totalSteps?: number;
  submitted_at?: string;
  submittedAt?: string;
}

type FilterType = 'all' | 'approved' | 'pending' | 'in_review' | 'rejected';

export default function ApplicationTrackingScreen() {
  const { user } = useAuthStore();
  const { applications: storeApps } = useSchemeStore();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadApps();
  }, [user?.id]);

  const loadApps = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (user?.id) {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setApps(data);
        } else {
          // Fall back to store data for demo
          setApps(storeApps as Application[]);
        }
      } else {
        setApps(storeApps as Application[]);
      }
    } catch {
      setApps(storeApps as Application[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getName = (app: Application) => app.scheme_name || app.schemeName || 'Unknown Scheme';
  const getStep = (app: Application) => app.current_step ?? app.currentStep ?? 1;
  const getTotalSteps = (app: Application) => app.total_steps ?? app.totalSteps ?? 6;
  const getDate = (app: Application) => app.submitted_at || app.submittedAt || '';
  const getStatus = (app: Application) => app.status || 'pending';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return Colors.success;
      case 'rejected': return Colors.error;
      case 'in_review': return Colors.warning;
      case 'submitted': return Colors.warning;
      default: return Colors.gray.text;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_review': return 'IN REVIEW';
      case 'submitted': return 'IN REVIEW';
      default: return status.toUpperCase();
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} color={color} />;
      case 'rejected': return <AlertCircle size={14} color={color} />;
      case 'in_review':
      case 'submitted': return <Clock size={14} color={color} />;
      default: return <FileText size={14} color={color} />;
    }
  };

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Approved' },
    { key: 'in_review', label: 'In Review' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const matchesFilter = (app: Application) => {
    const status = getStatus(app);
    if (filter === 'all') return true;
    if (filter === 'in_review') return status === 'in_review' || status === 'submitted';
    return status === filter;
  };

  const filtered = apps.filter(matchesFilter);

  const stats = {
    total: apps.length,
    approved: apps.filter(a => getStatus(a) === 'approved').length,
    pending: apps.filter(a => ['pending', 'draft'].includes(getStatus(a))).length,
    inReview: apps.filter(a => ['in_review', 'submitted'].includes(getStatus(a))).length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="My Applications" showBack onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Applications" showBack onBackPress={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadApps(true)} colors={[Colors.primary.blue]} />}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: Colors.primary.blue }]}>
            <Text style={[styles.statNum, { color: Colors.primary.blue }]}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.success }]}>
            <Text style={[styles.statNum, { color: Colors.success }]}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.warning }]}>
            <Text style={[styles.statNum, { color: Colors.warning }]}>{stats.inReview}</Text>
            <Text style={styles.statLabel}>In Review</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: Colors.gray.text }]}>
            <Text style={[styles.statNum, { color: Colors.gray.text }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterLabels.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <EmptyState
              title="No Applications"
              description={filter === 'all' ? 'You have no applications yet. Browse schemes to get started.' : `No ${filter.replace('_', ' ')} applications found.`}
              actionLabel="Browse Schemes"
              onAction={() => router.push('/(tabs)/schemes')}
            />
          ) : (
            filtered.map(app => {
              const status = getStatus(app);
              const step = getStep(app);
              const total = getTotalSteps(app);
              const progress = Math.min(step / total, 1);
              const date = getDate(app);
              const statusColor = getStatusColor(status);

              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.card}
                  onPress={() => router.push(`/application/${app.id}` as any)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={styles.schemeName} numberOfLines={2}>{getName(app)}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                        {getStatusIcon(status)}
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                          {getStatusLabel(status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress * 100}%`, backgroundColor: statusColor },
                          ]}
                        />
                      </View>
                      <Text style={styles.stepText}>Step {step} of {total}</Text>
                    </View>

                    {date ? (
                      <Text style={styles.dateText}>
                        Submitted: {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight size={20} color={Colors.gray.icon} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/schemes')}>
        <Plus size={24} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statNum: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, color: Colors.gray.text, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  filterRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray.border,
  },
  chipActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.dark },
  chipTextActive: { color: Colors.white },

  list: { paddingHorizontal: 14, paddingTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardBody: { flex: 1, marginRight: 8 },
  cardTop: { marginBottom: 12 },
  schemeName: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 8, lineHeight: 21 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  progressSection: { marginBottom: 8 },
  progressBar: {
    height: 5,
    backgroundColor: Colors.gray.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  stepText: { fontSize: 11, color: Colors.gray.text, fontWeight: '500' },
  dateText: { fontSize: 11, color: Colors.gray.text, fontWeight: '500' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});
