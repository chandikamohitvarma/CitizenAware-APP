import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, onboardingCompleted } = useAuthStore();

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {/* Auth Flow */}
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="language" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/set-password" />


        {/* Main App with Tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Scheme Details */}
        <Stack.Screen name="scheme/[id]" />
        <Stack.Screen name="scheme/all" />
        <Stack.Screen name="scheme/search" />
        <Stack.Screen name="scheme/categories" />
        <Stack.Screen name="scheme/category/[id]" />
        <Stack.Screen name="scheme/compare" />
        <Stack.Screen name="scheme/eligibility/[id]" />
        <Stack.Screen name="scheme/eligibility-result" />
        <Stack.Screen name="scheme/saved" />
        <Stack.Screen name="scheme/ai-recommendations" />

        {/* Application Flow */}
        <Stack.Screen name="apply/[id]" />
        <Stack.Screen name="apply/[id]/personal" />
        <Stack.Screen name="apply/[id]/address" />
        <Stack.Screen name="apply/[id]/bank" />
        <Stack.Screen name="apply/[id]/documents" />
        <Stack.Screen name="apply/[id]/review" />
        <Stack.Screen name="apply/[id]/success" />
        <Stack.Screen name="application/[id]" />
        <Stack.Screen name="application/tracking" />
        <Stack.Screen name="document/upload" />
        <Stack.Screen name="document/preview" />

        {/* Notifications & AI */}
        <Stack.Screen name="notification/[id]" />
        <Stack.Screen name="ai/chat" />
        <Stack.Screen name="ai/voice" />
        <Stack.Screen name="ai/results" />

        {/* Profile */}
        <Stack.Screen name="profile/personal" />
        <Stack.Screen name="profile/address" />

        {/* Settings */}
        <Stack.Screen name="settings" />
        <Stack.Screen name="settings/language" />
        <Stack.Screen name="settings/theme" />
        <Stack.Screen name="settings/reminders" />

        {/* Support */}
        <Stack.Screen name="support" />
        <Stack.Screen name="support/faqs" />
        <Stack.Screen name="support/ticket/new" />
        <Stack.Screen name="support/ticket/[id]" />

        {/* Document */}
        <Stack.Screen name="document/verification" />

        {/* Extra */}
        <Stack.Screen name="about" />
        <Stack.Screen name="logout" />

        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
