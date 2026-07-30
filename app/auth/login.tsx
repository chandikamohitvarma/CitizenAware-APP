import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, GraduationCap, Leaf, HeartPulse, IndianRupee, ShieldCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { AppInput } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

function ParliamentBuilding() {
  return (
    <Svg width="80" height="72" viewBox="0 0 90 80">
      {/* Base steps */}
      <Rect x="8" y="68" width="74" height="7" rx="2" fill="white" />
      <Rect x="16" y="60" width="58" height="9" rx="2" fill="white" />

      {/* Main building body */}
      <Rect x="20" y="30" width="50" height="31" fill="white" />

      {/* Dome arch */}
      <Path d="M20 30 Q45 6 70 30 Z" fill="white" />

      {/* Columns (cutouts in blue) */}
      <Rect x="24" y="32" width="5" height="27" rx="2" fill="#1A3FA8" />
      <Rect x="33" y="32" width="5" height="27" rx="2" fill="#1A3FA8" />
      <Rect x="42" y="32" width="5" height="27" rx="2" fill="#1A3FA8" />
      <Rect x="52" y="32" width="5" height="27" rx="2" fill="#1A3FA8" />
      <Rect x="61" y="32" width="5" height="27" rx="2" fill="#1A3FA8" />

      {/* Central door arch */}
      <Path d="M39 57 Q45 48 51 57 Z" fill="#1A3FA8" />
      <Rect x="39" y="57" width="12" height="4" rx="0" fill="#1A3FA8" />

      {/* Flagpole */}
      <Rect x="43.5" y="6" width="2.5" height="24" fill="white" />

      {/* Indian tricolor flag */}
      <Rect x="46" y="6" width="15" height="4" rx="0.8" fill="#FF9933" />
      <Rect x="46" y="10" width="15" height="4" rx="0" fill="white" />
      <Rect x="46" y="14" width="15" height="4" rx="0.8" fill="#138808" />
      <Circle cx="53.5" cy="12" r="1.5" fill="#000080" />
    </Svg>
  );
}

const CATEGORIES = [
  { icon: GraduationCap, label: 'Scholarships', color: '#2563EB' },
  { icon: IndianRupee, label: 'Subsidies', color: '#059669' },
  { icon: HeartPulse, label: 'Health\nSchemes', color: '#DC2626' },
  { icon: Leaf, label: 'Farmer\nBenefits', color: '#16A34A' },
];

function GoogleIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, isAuthenticated, error: authError } = useAuthStore();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCategoryPress = (label: string) => {
    const cleanLabel = label.replace('\n', ' ');
    if (!isAuthenticated) {
      setError(`Please sign in to access ${cleanLabel}`);
      return;
    }
    router.push('/(tabs)/schemes');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const success = await login(email, password);
      if (!success) {
        setError(authError || 'Incorrect email or password');
        return;
      }
      router.replace('/(tabs)');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0D2464', '#1A3DA8', '#1E4FC7']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          bounces={false}
        >
          {/* ─── Hero Header ─── */}
          <View style={styles.hero}>
            {/* Building badge */}
            <View style={styles.buildingBadge}>
              <LinearGradient
                colors={['#1A4FCC', '#0D2FA8']}
                style={styles.buildingGrad}
              >
                <ParliamentBuilding />
              </LinearGradient>
            </View>

            <Text style={styles.appName}>CitizenAware</Text>

            <View style={styles.editionBadge}>
              <Text style={styles.editionText}>2026 Edition</Text>
            </View>

            <Text style={styles.heroSub}>180+ Government Schemes Await</Text>
          </View>

          {/* ─── White Card ─── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back!</Text>
            <Text style={styles.cardSub}>Sign in to access Government Schemes</Text>

            {/* Form */}
            <View style={styles.form}>
              <AppInput
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon={<Mail size={20} color={Colors.gray.icon} />}
                disabled={isLoading}
              />

              <AppInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon={<Lock size={20} color={Colors.gray.icon} />}
                disabled={isLoading}
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Sign In button */}
              <TouchableOpacity
                style={[styles.signInBtn, isLoading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1A3DA8', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInGrad}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push('/auth/forgot-password')}
                style={styles.forgotWrap}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* OR Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In button */}
              <TouchableOpacity
                style={[styles.googleBtn, (isLoading || isGoogleLoading) && styles.btnDisabled]}
                onPress={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                activeOpacity={0.85}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color={Colors.dark} size="small" />
                ) : (
                  <View style={styles.googleContent}>
                    <GoogleIcon />
                    <Text style={styles.googleBtnText}>Sign in with Google</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>



            {/* Create account */}
            <View style={styles.registerRow}>
              <Text style={styles.registerRowText}>New to CitizenAware? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <ShieldCheck size={14} color={Colors.gray.icon} />
              <Text style={styles.footerText}>Secure  •  Private  •  Reliable</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1 },

  /* ── Hero ── */
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  buildingBadge: {
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  buildingGrad: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  editionBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  editionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
  },

  /* ── White Card ── */
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    flex: 1,
    minHeight: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  cardSub: {
    fontSize: 14,
    color: Colors.gray.text,
    marginBottom: 24,
    fontWeight: '500',
  },
  form: { gap: 0 },

  errorBox: {
    backgroundColor: Colors.error + '10',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    marginBottom: 12,
  },
  errorText: { color: Colors.error, fontSize: 13, fontWeight: '500' },

  signInBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
    shadowColor: '#1A3DA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  signInGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  btnDisabled: { opacity: 0.65 },

  forgotWrap: { alignItems: 'center', paddingVertical: 8 },
  forgotText: { fontSize: 14, fontWeight: '600', color: Colors.primary.blue },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray.icon,
    marginHorizontal: 12,
  },

  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 2,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.2,
  },

  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  catItem: { alignItems: 'center', flex: 1 },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerRowText: { fontSize: 14, color: Colors.gray.text },
  registerLink: { fontSize: 14, fontWeight: '700', color: Colors.primary.blue },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  footerText: { fontSize: 12, color: Colors.gray.icon, fontWeight: '500' },
});
