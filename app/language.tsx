import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { languages } from '@/constants/data';
import { AppButton, Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { setLanguage } = useAuthStore();

  const handleContinue = () => {
    setLanguage(selectedLanguage);
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Select Language" showBack onBackPress={() => router.back()} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose your preferred language for the app
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage === lang.code && styles.languageItemActive,
              ]}
              onPress={() => setSelectedLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.languageNative}>{lang.native}</Text>
              </View>
              {selectedLanguage === lang.code && (
                <View style={styles.checkContainer}>
                  <Check size={20} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            title="Continue"
            onPress={handleContinue}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  languageItemActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  languageNative: {
    fontSize: 13,
    color: Colors.gray.text,
    marginTop: 2,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
});
