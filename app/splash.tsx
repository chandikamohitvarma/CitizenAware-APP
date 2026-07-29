import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreenPage() {
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, onboardingCompleted]);

  return (
    <LinearGradient
      colors={[Colors.primary.blue, Colors.primary.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CA</Text>
        </View>
        <Text style={styles.appName}>CitizenAware</Text>
        <Text style={styles.tagline}>AI-Powered Citizen Assistance</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary.blue,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: Colors.white + 'CC',
  },
});
