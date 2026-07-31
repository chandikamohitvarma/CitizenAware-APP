import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowLeft, Send, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput } from '@/components/ui';
import { requestPasswordReset } from '@/lib/api';

const RESET_EMAIL_KEY = 'citizenaware_password_reset_email';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await AsyncStorage.setItem(`citizenaware_otp_${email}`, generatedOtp);
      await AsyncStorage.setItem(RESET_EMAIL_KEY, email);
      await requestPasswordReset(email, generatedOtp);
      router.push('/auth/otp');
    } catch {
      await AsyncStorage.setItem(RESET_EMAIL_KEY, email);
      router.push('/auth/otp');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.successContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.successIcon}>
              <LinearGradient
                colors={[Colors.success, Colors.primary.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successGradient}
              >
                <CheckCircle size={48} color={Colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.resendButtonText}>Resend Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.push('/auth/login')}
            >
              <ArrowLeft size={20} color={Colors.primary.blue} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/login'))}
          >
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primary.blue, Colors.primary.green]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Text style={styles.logoText}>CA</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a 6-digit verification code.
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <AppInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={<Mail size={20} color={Colors.gray.icon} />}
              disabled={isLoading}
              autoCapitalize="none"
            />

            <AppButton
              title="Send Verification Code"
              onPress={handleResetPassword}
              loading={isLoading}
              icon={<Send size={20} color={Colors.white} />}
              iconPosition="right"
              fullWidth
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                We'll send a 6-digit verification code to your email address to reset your password.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push('/auth/login')}
          >
            <ArrowLeft size={20} color={Colors.primary.blue} />
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    gap: 16,
  },
  errorBox: {
    backgroundColor: Colors.error + '15',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: Colors.primary.blue + '08',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.gray.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
  // Success state styles
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary.blue,
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: Colors.primary.blue + '15',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary.blue,
    textAlign: 'center',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
});
