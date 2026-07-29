import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RotateCw, ZoomIn, Download, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';

export default function DocumentPreviewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Document Preview" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.previewArea}>
          <Image source={{ uri: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600' }} style={styles.preview} />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <RotateCw size={20} color={Colors.primary.blue} />
            <Text style={styles.actionText}>Rotate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <ZoomIn size={20} color={Colors.primary.blue} />
            <Text style={styles.actionText}>Zoom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Download size={20} color={Colors.primary.blue} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Share2 size={20} color={Colors.primary.blue} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <AppButton title="Upload Document" onPress={() => router.back()} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  previewArea: { flex: 1, backgroundColor: Colors.gray.light, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  preview: { width: '90%', height: '90%', borderRadius: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionText: { fontSize: 12, color: Colors.dark },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
