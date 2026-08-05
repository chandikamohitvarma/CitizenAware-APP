import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useSettingsStore } from '@/store/settingsStore';

// Prevent splash screen from auto-hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useFrameworkReady();
  const isDarkMode = useSettingsStore(state => state.isDarkMode);

  useEffect(() => {
    // Dismiss native splash screen once root layout mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}
