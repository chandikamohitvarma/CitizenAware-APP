import React, { useEffect } from 'react';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const { isAuthenticated, onboardingCompleted } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/auth/login');
      } else {
        router.replace('/(tabs)');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, onboardingCompleted]);

  return (
    <LinearGradient
      colors={[Colors.primary.blue, Colors.primary.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>CA</Text>
        </View>
      </View>
      <Text style={styles.appName}>CitizenAware</Text>
      <Text style={styles.subtitle}>2026 Edition</Text>
      <Text style={styles.tagline}>180+ Government Schemes at Your Fingertips</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary.blue,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white + 'DD',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 15,
    color: Colors.white + 'BB',
    textAlign: 'center',
    lineHeight: 22,
  },
});
