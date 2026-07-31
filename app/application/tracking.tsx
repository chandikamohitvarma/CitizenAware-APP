import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CircleCheck as CheckCircle2,
  Clock,
  CircleAlert as AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  FileEdit,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, getThemeColors } from '@/constants/colors';
import { Header, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useSchemeStore } from '@/store/schemeStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getApplications } from '@/lib/api';

interface Application {
  id: string;
  scheme_id?: string;
  schemeId?: string;
  scheme_name?: string;
  schemeName?: string;
  category?: string;
  status: string;
  current_step?: number;
  currentStep?: number;
  total_steps?: number;
  totalSteps?: number;
  submitted_at?: string;
  submittedAt?: string;
}

type FilterType = 'all' | 'approved' | 'in_review' | 'pending' | 'draft' | 'rejected';

export default function ApplicationTrackingScreen() {
  const { user, token } = useAuthStore();
  const { applications: storeApps } = useSchemeStore();
  const { isDarkMode } = useSettingsStore();
  const themeColors = getThemeColors(isDarkMode);

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const filterUserApps = (list: any[]) => {
    if (!user || user.id === '1' || (user.email && user.email.toLowerCase().includes('mohit'))) {
      return list.filter(a => !a.userId || a.userId === '1' || (user?.id && a.userId === user.id));
    }
    return list.filter(a => a.userId === user.id);
  };

  const loadApps = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    let rawApps: Application[] = storeApps as Application[];
    try {
      if (token) {
        const applications = await getApplications(token);
        if (applications && Array.isArray(applications) && applications.length > 0) {
          rawApps = applications;
        }
      }
    } catch {
      rawApps = storeApps as Application[];
    } finally {
      setApps(filterUserApps(rawApps));
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getName = (app: Application) => app.scheme_name || app.schemeName || 'Government Scheme Application';
  const getStep = (app: Application) => app.current_step ?? app.currentStep ?? 1;
  const getTotalSteps = (app: Application) => app.total_steps ?? app.totalSteps ?? 6;
  const getDate = (app: Application) => app.submitted_at || app.submittedAt || '';
  const getStatus = (app: Application) => (app.status || 'pending').toLowerCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'in_review':
      case 'submitted': return '#F59E0B';
      case 'draft':
      case 'pending': return '#3B82F6';
      default: return Colors.gray.text;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'APPROVED';
      case 'rejected': return 'REJECTED';
      case 'in_review':
      case 'submitted': return 'IN REVIEW';
      case 'draft': return 'DRAFT';
      case 'pending': return 'PENDING';
      default: return status.toUpperCase();
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'approved': return <CheckCircle2 size={13} color={color} strokeWidth={2.5} />;
      case 'rejected': return <AlertCircle size={13} color={color} strokeWidth={2.5} />;
      case 'in_review':
      case 'submitted': return <Clock size={13} color={color} strokeWidth={2.5} />;
      case 'draft':
      case 'pending': return <FileEdit size={13} color={color} strokeWidth={2.5} />;
      default: return <FileText size={13} color={color} strokeWidth={2.5} />;
    }
  };

  const matchesFilter = (app: Application) => {
    const status = getStatus(app);
    if (filter === 'all') return true;
    if (filter === 'in_review') return status === 'in_review' || status === 'submitted';
    if (filter === 'pending') return status === 'pending' || status === 'draft';
    return status === filter;
  };

  const filtered = apps.filter(matchesFilter);

  const stats = {
    total: apps.length,
    approved: apps.filter(a => getStatus(a) === 'approved').length,
    inReview: apps.filter(a => ['in_review', 'submitted'].includes(getStatus(a))).length,
    pending: apps.filter(a => ['pending', 'draft'].includes(getStatus(a))).length,
    rejected: apps.filter(a => getStatus(a) === 'rejected').length,
  };

  const filterLabels: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'approved', label: 'Approved', count: stats.approved },
    { key: 'in_review', label: 'In Review', count: stats.inReview },
    { key: 'pending', label: 'Pending / Draft', count: stats.pending },
    { key: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
        <Header title="My Applications" showBack onBackPress={() => router.replace('/(tabs)')} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
          <Text style={[styles.loadingText, { color: themeColors.subtext }]}>Loading your 2026 applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Header title="My Applications" showBack onBackPress={() => router.replace('/(tabs)')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadApps(true)} colors={[Colors.primary.blue]} />
        }
      >
        {/* ─── Hero Summary Header ─── */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#1E4FC7', '#0D2464']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroHeaderRow}>
              <View>
                <Text style={styles.heroTitle}>2026 Application Portal</Text>
                <Text style={styles.heroSubtitle}>Real-time status & DBT tracking</Text>
              </View>
              <View style={styles.sparkleBadge}>
                <Sparkles size={16} color="#F59E0B" />
                <Text style={styles.sparkleText}>Active Sync</Text>
              </View>
            </View>

            {/* Quick Stat Cards */}
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={[styles.statBox, filter === 'all' && styles.statBoxActive]}
                onPress={() => setFilter('all')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <FileText size={16} color="#60A5FA" />
                </View>
                <Text style={styles.statBoxNum}>{stats.total}</Text>
                <Text style={styles.statBoxLabel}>TOTAL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBox, filter === 'approved' && styles.statBoxActive]}
                onPress={() => setFilter('approved')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <CheckCircle2 size={16} color="#34D399" />
                </View>
                <Text style={[styles.statBoxNum, { color: '#34D399' }]}>{stats.approved}</Text>
                <Text style={styles.statBoxLabel}>APPROVED</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBox, filter === 'in_review' && styles.statBoxActive]}
                onPress={() => setFilter('in_review')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                  <Clock size={16} color="#FBBF24" />
                </View>
                <Text style={[styles.statBoxNum, { color: '#FBBF24' }]}>{stats.inReview}</Text>
                <Text style={styles.statBoxLabel}>IN REVIEW</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.statBox, filter === 'pending' && styles.statBoxActive]}
                onPress={() => setFilter('pending')}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                  <FileEdit size={16} color="#818CF8" />
                </View>
                <Text style={[styles.statBoxNum, { color: '#818CF8' }]}>{stats.pending}</Text>
                <Text style={styles.statBoxLabel}>PENDING</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ─── Filter Pills Bar ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {filterLabels.map(f => {
            const isActive = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.pillChip,
                  { backgroundColor: isActive ? Colors.primary.blue : themeColors.card, borderColor: isActive ? Colors.primary.blue : themeColors.border },
                ]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: isActive ? '#FFFFFF' : themeColors.text }]}>
                  {f.label}
                </Text>
                <View style={[styles.pillCountBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : themeColors.border }]}>
                  <Text style={[styles.pillCountText, { color: isActive ? '#FFFFFF' : themeColors.subtext }]}>
                    {f.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Applications List ─── */}
        <View style={styles.listContainer}>
          {filtered.length === 0 ? (
            <EmptyState
              title="No Applications Found"
              description={
                filter === 'all'
                  ? 'You have no active applications. Discover government schemes and apply in minutes.'
                  : `No ${filter.replace('_', ' ')} applications found.`
              }
              actionLabel="Explore 180+ Schemes"
              onAction={() => router.push('/(tabs)/schemes')}
            />
          ) : (
            filtered.map((app, index) => {
              const status = getStatus(app);
              const step = getStep(app);
              const total = getTotalSteps(app);
              const percent = Math.min(Math.round((step / total) * 100), 100);
              const date = getDate(app);
              const statusColor = getStatusColor(status);
              const isDraft = status === 'draft' || status === 'pending';
              const schemeId = app.scheme_id || app.schemeId || '1';
              const refNo = `REF-2026-00${index + 1}`;

              return (
                <TouchableOpacity
                  key={app.id}
                  style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                  onPress={() => {
                    if (isDraft) {
                      router.push(`/apply/${schemeId}/personal`);
                    } else {
                      router.push(`/application/${app.id}` as any);
                    }
                  }}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.refBadge, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                        <Text style={[styles.refBadgeText, { color: themeColors.subtext }]}>{refNo}</Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                      {getStatusIcon(status)}
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.schemeTitle, { color: themeColors.text }]} numberOfLines={2}>
                    {getName(app)}
                  </Text>

                  {/* Progress Section */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderRow}>
                      <Text style={[styles.progressStepText, { color: themeColors.text }]}>
                        Step {step} of {total} <Text style={{ color: themeColors.subtext, fontWeight: '500' }}>({percent}%)</Text>
                      </Text>
                      {date ? (
                        <View style={styles.dateRow}>
                          <Calendar size={12} color={themeColors.subtext} />
                          <Text style={[styles.dateText, { color: themeColors.subtext }]}>
                            {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
                      <LinearGradient
                        colors={
                          status === 'approved'
                            ? ['#10B981', '#34D399']
                            : status === 'in_review' || status === 'submitted'
                            ? ['#F59E0B', '#FBBF24']
                            : ['#2563EB', '#3B82F6']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${percent}%` }]}
                      />
                    </View>
                  </View>

                  {/* Card Action Footer */}
                  <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                    <Text style={[styles.actionLabel, { color: statusColor }]}>
                      {isDraft ? 'Resume Application' : 'View Details & Verification Timeline'}
                    </Text>
                    <View style={[styles.arrowCircle, { backgroundColor: statusColor + '15' }]}>
                      <ArrowRight size={14} color={statusColor} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Plus FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/schemes')}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={['#1E4FC7', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingBottom: 24 },

  /* ── Hero Section ── */
  heroSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  heroGradient: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2, fontWeight: '500' },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sparkleText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  /* ── Stats Grid ── */
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  statIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statBoxNum: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  statBoxLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255, 255, 255, 0.75)', marginTop: 2, letterSpacing: 0.3 },

  /* ── Filter Pills ── */
  filterPillsRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  pillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: { fontSize: 13, fontWeight: '700' },
  pillCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pillCountText: { fontSize: 11, fontWeight: '800' },

  /* ── List ── */
  listContainer: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },

  schemeTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 14 },

  /* Progress Section */
  progressContainer: { marginBottom: 14 },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStepText: { fontSize: 12, fontWeight: '700' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12, fontWeight: '500' },

  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },

  /* Action Footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionLabel: { fontSize: 13, fontWeight: '700' },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#1E4FC7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
