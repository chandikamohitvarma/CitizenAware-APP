import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, Lock, ArrowLeft, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Logo } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isGmail = (value: string) => /@gmail\.com$/i.test(value.trim());
  const isTenDigitPhone = (value: string) => /^\d{10}$/.test(value.replace(/\s/g, ''));

  const validateEmail = (value: string) => {
    if (!value.trim()) { setEmailError(''); return; }
    if (!isGmail(value)) { setEmailError('Only @gmail.com addresses are allowed'); return; }
    setEmailError('');
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) { setPhoneError(''); return; }
    if (!/^\d{10}$/.test(digits)) { setPhoneError('Phone number must be exactly 10 digits'); return; }
    setPhoneError('');
  };

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    return errors;
  };

  const handleRegister = async () => {
    setError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isGmail(email)) {
      setError('Only @gmail.com addresses are allowed');
      return;
    }

    if (!isTenDigitPhone(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });

      if (authError) {
        setError(authError.message || 'Registration failed');
        return;
      }

      if (data.user) {
        await supabase.auth.signOut();
        setSuccess('Account created successfully! Please sign in to continue.');
        setTimeout(() => router.replace('/auth/login'), 1500);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft size={22} color={Colors.dark} />
        </TouchableOpacity>

        {/* Logo & Heading */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Logo size={72} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Access 180+ government schemes</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppInput
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            icon={<User size={20} color={Colors.gray.icon} />}
            disabled={isLoading}
          />

          <AppInput
            label="Email Address (must be @gmail.com)"
            placeholder="username@gmail.com"
            value={email}
            onChangeText={(text) => { setEmail(text); validateEmail(text); }}
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.gray.icon} />}
            disabled={isLoading}
            error={emailError}
            autoCapitalize="none"
          />

          <AppInput
            label="Phone Number (10 digits only)"
            placeholder="9876543210"
            value={phone}
            onChangeText={(text) => { const digits = text.replace(/\D/g, '').slice(0, 10); setPhone(digits); validatePhone(digits); }}
            keyboardType="phone-pad"
            icon={<Phone size={20} color={Colors.gray.icon} />}
            disabled={isLoading}
            error={phoneError}
            maxLength={10}
          />

          <View>
            <AppInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordErrors(validatePassword(text));
              }}
              secureTextEntry
              icon={<Lock size={20} color={Colors.gray.icon} />}
              disabled={isLoading}
            />
            {password && passwordErrors.length > 0 && (
              <View style={styles.pwdErrors}>
                {passwordErrors.map((e, i) => (
                  <Text key={i} style={styles.pwdErrorText}>• {e}</Text>
                ))}
              </View>
            )}
            {password && passwordErrors.length === 0 && (
              <View style={styles.pwdValid}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={styles.pwdValidText}>Password is strong</Text>
              </View>
            )}
          </View>

          <AppInput
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon={<Lock size={20} color={Colors.gray.icon} />}
            disabled={isLoading}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            style={styles.registerBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            disabled={isLoading}
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  header: { alignItems: 'center', marginBottom: 24 },
  logoWrapper: {
    marginBottom: 16,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: Colors.gray.text },

  form: { gap: 16, marginBottom: 24 },
  pwdErrors: {
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  pwdErrorText: { fontSize: 13, color: Colors.error, marginBottom: 2 },
  pwdValid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  pwdValidText: { fontSize: 13, color: Colors.success, fontWeight: '500' },
  errorBox: {
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: { color: Colors.error, fontSize: 13, fontWeight: '500' },
  successBox: {
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  successText: { color: Colors.success, fontSize: 13, fontWeight: '500' },
  registerBtn: { marginTop: 4 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: { fontSize: 15, color: Colors.gray.text },
  loginLink: { fontSize: 15, fontWeight: '600', color: Colors.primary.blue },
});
