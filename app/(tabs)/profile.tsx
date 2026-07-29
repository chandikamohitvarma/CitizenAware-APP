import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, Settings, Circle as HelpCircle, LogOut, ChevronRight, Bookmark, FileText, Shield, CreditCard as Edit2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useSchemeStore } from '@/store/schemeStore';
import { supabase } from '@/lib/supabase';

interface UserStats {
  savedCount: number;
  appliedCount: number;
  approvedCount: number;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { savedSchemes } = useSchemeStore();
  const [stats, setStats] = useState<UserStats>({
    savedCount: 0,
    appliedCount: 0,
    approvedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [user?.id, savedSchemes.length]);

  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get saved schemes count
      const savedCount = savedSchemes.length;

      // Get applications count
      const { data: applications } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user.id);

      const appliedCount = applications?.length || 0;
      const approvedCount = applications?.filter((a: any) => a.status === 'approved').length || 0;

      setStats({
        savedCount,
        appliedCount,
        approvedCount,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'Personal Information',
      color: Colors.primary.blue,
      route: '/profile/personal',
      description: 'Update your name, email, phone',
    },
    {
      icon: MapPin,
      label: 'Address Information',
      color: Colors.primary.green,
      route: '/profile/address',
      description: 'Manage your address details',
    },
    {
      icon: Bookmark,
      label: 'Saved Schemes',
      color: Colors.warning,
      route: '/scheme/saved',
      description: 'View bookmarked schemes',
    },
    {
      icon: FileText,
      label: 'My Applications',
      color: Colors.success,
      route: '/application/tracking',
      description: 'Track application status',
    },
  ];

  const settingsItems = [
    {
      icon: Settings,
      label: 'Settings',
      color: Colors.gray.text,
      route: '/settings',
      description: 'Preferences & notifications',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      color: Colors.primary.blue,
      route: '/support',
      description: 'FAQs & contact support',
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors.primary.blue, '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile/personal')}
          >
            <Edit2 size={18} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@email.com'}</Text>

          {/* Stats Row */}
          <View style={styles.stats}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/scheme/saved')}
            >
              <Text style={styles.statValue}>{stats.savedCount}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push('/application/tracking')}
            >
              <Text style={styles.statValue}>{stats.appliedCount}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.approvedCount}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Contact Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Information</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primary.blue + '15' }]}>
                <Mail size={18} color={Colors.primary.blue} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText}>{user?.email || 'Not provided'}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.primary.green + '15' }]}>
                <Phone size={18} color={Colors.primary.green} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoText}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </View>

          {/* Account Section */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={18} color={Colors.gray.icon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings Section */}
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <ChevronRight size={18} color={Colors.gray.icon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.error + '15' }]}>
              <LogOut size={20} color={Colors.error} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: Colors.white + 'DD',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white + '15',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white + 'CC',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.white + '25',
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.gray.text,
    marginBottom: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.gray.border,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: Colors.gray.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '08',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.error + '20',
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
});
