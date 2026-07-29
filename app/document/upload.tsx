import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';

export default function DocumentUploadScreen() {
  const [uploading, setUploading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Document Upload" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.title}>Upload Document</Text>
        <Text style={styles.subtitle}>Choose how you want to upload</Text>
        <View style={styles.options}>
          <AppButton title="Camera" onPress={() => {}} variant="outline" fullWidth style={styles.optionBtn} />
          <AppButton title="Gallery" onPress={() => {}} variant="outline" fullWidth style={styles.optionBtn} />
          <AppButton title="Browse Files" onPress={() => {}} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.gray.text, marginBottom: 32 },
  options: { gap: 12 },
  optionBtn: { marginBottom: 0 },
});
