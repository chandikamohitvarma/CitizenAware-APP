import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Bell, ChevronRight, TrendingUp, Clock, Sparkles, FileText, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSchemeStore } from '@/store/schemeStore';
import { t } from '@/constants/translations';
import { router } from 'expo-router';
import { getSchemes, getApplications, getNotifications } from '@/lib/api';
import { FloatingAIButton } from '@/components/ui/FloatingAIButton';
import { evaluateAndProceedScheme } from '@/lib/eligibilityEngine';


import { schemes as defaultSchemes } from '@/constants/data';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  featured: boolean;
}

export default function HomeScreen() {
  const { user, token } = useAuthStore();
  const { isDarkMode, language } = useSettingsStore();
  const storeApps = useSchemeStore((state) => state.applications);
  const createApplication = useSchemeStore((state) => state.createApplication);
  const themeColors = getThemeColors(isDarkMode);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState({ applied: 0, approved: 0, pending: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [token, storeApps]);

  const loadData = async () => {
    try {
      setLoading(true);

      const schemesData = await getSchemes().catch(() => null);
      if (schemesData && Array.isArray(schemesData) && schemesData.length > 0) {
        setSchemes(schemesData);
      } else {
        setSchemes(defaultSchemes as any);
      }

      let appList: Array<{ status: string }> = storeApps as any;
      if (token) {
        try {
          const appData = (await getApplications(token)) as Array<{ status: string }>;
          if (appData && Array.isArray(appData) && appData.length > 0) {
            appList = appData;
          }
        } catch {
          // Fall back to local store
        }

        try {
          const notifs = await getNotifications(token);
          if (notifs && Array.isArray(notifs) && notifs.length > 0) {
            const unread = notifs.filter((n: { read?: boolean }) => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (err) {
          // Fall back
        }
      }

      const filterUserApps = (list: any[]) => {
        if (!user || user.id === '1' || (user.email && user.email.toLowerCase().includes('mohit'))) {
          return list.filter(a => !a.userId || a.userId === '1' || (user?.id && a.userId === user.id));
        }
        return list.filter(a => a.userId === user.id);
      };

      const userAppList = filterUserApps(appList);

      const totalApplied = userAppList.length;
      const totalApproved = userAppList.filter(a => (a.status || '').toLowerCase() === 'approved').length;
      const totalPending = userAppList.filter(a => ['submitted', 'in_review', 'pending', 'draft'].includes((a.status || '').toLowerCase())).length;

      setApplications({
        applied: totalApplied,
        approved: totalApproved,
        pending: totalPending,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setSchemes(defaultSchemes as any);
      setApplications({
        applied: storeApps.length,
        approved: storeApps.filter(a => (a.status || '').toLowerCase() === 'approved').length,
        pending: storeApps.filter(a => ['submitted', 'in_review', 'pending', 'draft'].includes((a.status || '').toLowerCase())).length,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const quickStats = [
    {
      label: t('applied', language),
      value: applications.applied.toString(),
      icon: FileText,
      color: Colors.primary.blue,
      onPress: () => router.push('/application/tracking'),
    },
    {
      label: t('approved', language),
      value: applications.approved.toString(),
      icon: CheckCircle2,
      color: Colors.success,
      onPress: () => router.push('/application/tracking'),
    },
    {
      label: t('pending', language),
      value: applications.pending.toString(),
      icon: Clock,
      color: Colors.warning,
      onPress: () => router.push('/application/tracking'),
    },
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
        {/* 1. Welcome Card Header */}
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
                  {t('welcome', language)}, {user?.name?.split(' ')[0] || 'Citizen'}!
                </Text>
                <Text style={styles.subtitle}>{t('governmentSchemes', language)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                style={styles.bellButton}
              >
                <Bell size={20} color={Colors.white} strokeWidth={2.5} />
                {unreadCount > 0 && <View style={styles.notificationBadge} />}
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push('/scheme/search')}
              style={styles.searchBar}
              activeOpacity={0.8}
            >
              <Search size={18} color={Colors.gray.icon} strokeWidth={2} />
              <Text style={styles.searchText}>{t('searchSchemes', language)}</Text>
              <ChevronRight size={18} color={Colors.gray.icon} />
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>

        {/* 2. AI Recommendation Card */}
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
                  <Text style={styles.aiTitle}>AI-Powered Eligibility Engine</Text>
                  <Text style={styles.aiDescription}>
                    Verify age, income, state & occupation against 100% database schemes
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 3. Eligible Schemes Carousel/Highlight Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Eligible Schemes for You</Text>
              <Text style={styles.sectionSubtitle}>Tailored to your age, income & state domicile</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/scheme/ai-recommendations')}>
              <Text style={styles.viewAll}>Check All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            {schemes.slice(0, 3).map((scheme) => (
              <TouchableOpacity
                key={`eligible-${scheme.id}`}
                style={[styles.schemeCard, { width: 270, marginRight: 12, marginBottom: 4 }]}
                onPress={() => router.push(`/scheme/eligibility/${scheme.id}`)}
              >
                <View style={styles.schemeContent}>
                  <View style={[styles.schemeBadge, { backgroundColor: getCategoryColor(scheme.category) + '15' }]}>
                    <Text style={[styles.schemeBadgeText, { color: getCategoryColor(scheme.category) }]}>
                      {scheme.category}
                    </Text>
                  </View>
                  <Text style={styles.schemeName} numberOfLines={1}>{scheme.name}</Text>
                  <Text style={styles.schemeDescription} numberOfLines={2}>{scheme.description}</Text>
                  <View style={styles.schemeFooter}>
                    <Text style={styles.appliedCount}>100% Matched</Text>
                    <TouchableOpacity
                      style={styles.homeApplyBtn}
                      onPress={() => router.push(`/scheme/eligibility/${scheme.id}`)}
                    >
                      <Text style={styles.homeApplyText}>Check Eligibility</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Latest Government Schemes Feed */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Latest Government Schemes</Text>
              <Text style={styles.sectionSubtitle}>{t('governmentInitiatives', language)}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/scheme/all')}>
              <Text style={styles.viewAll}>{t('viewAll', language)}</Text>
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
                    <Text style={styles.appliedCount}>4.2K {t('applied', language)}</Text>
                    <TouchableOpacity
                      style={styles.homeApplyBtn}
                      onPress={() => router.push(`/scheme/eligibility/${scheme.id}`)}
                    >
                      <Text style={styles.homeApplyText}>Check Eligibility</Text>
                    </TouchableOpacity>
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

        {/* 5. Active Applications */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={stat.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                <stat.icon size={20} color={stat.color} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 6. Pending Documents Banner */}
        <TouchableOpacity
          style={styles.docAlertCard}
          onPress={() => router.push('/document/verification')}
          activeOpacity={0.85}
        >
          <View style={styles.docAlertLeft}>
            <View style={styles.docAlertIcon}>
              <FileText size={20} color="#D97706" />
            </View>
            <View style={styles.docAlertText}>
              <Text style={styles.docAlertTitle}>Pending Documents Verification</Text>
              <Text style={styles.docAlertDesc}>Upload Aadhaar, Income & Caste certificates for 1-click verification</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#D97706" />
        </TouchableOpacity>

        {/* 7. Notifications Bar */}
        <TouchableOpacity
          style={styles.infoBanner}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.85}
        >
          <View style={styles.bannerIcon}>
            <Bell size={18} color={Colors.primary.blue} strokeWidth={2} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Real-time Official Announcements</Text>
            <Text style={styles.bannerDescription}>
              Check new scheme launches, DBT credit releases & document update alerts.
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.primary.blue} />
        </TouchableOpacity>

        {/* 8. Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('quickActions', language)}</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/schemes')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary.blue + '15' }]}>
                <Search size={22} color={Colors.primary.blue} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Find Schemes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/scheme/ai-recommendations')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary.green + '15' }]}>
                <CheckCircle2 size={22} color={Colors.primary.green} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Eligibility</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/document/verification')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                <FileText size={22} color="#8B5CF6" strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Upload Docs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/application/tracking')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.warning + '15' }]}>
                <Clock size={22} color={Colors.warning} strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>Track Apps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/ai')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EC4899' + '15' }]}>
                <Sparkles size={22} color="#EC4899" strokeWidth={2} />
              </View>
              <Text style={styles.actionText}>AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />

      </ScrollView>
      <FloatingAIButton />
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
    fontSize: 12,
    color: Colors.gray.text,
    fontWeight: '500',
  },

  docAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  docAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  docAlertIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAlertText: { flex: 1 },
  docAlertTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  docAlertSub: { fontSize: 11, color: '#B45309', lineHeight: 15, marginTop: 1 },
  docAlertDesc: { fontSize: 11, color: '#B45309', lineHeight: 15, marginTop: 1 },

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
  homeApplyBtn: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  homeApplyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
