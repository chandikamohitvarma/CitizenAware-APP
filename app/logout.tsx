import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function LogoutScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={Colors.gray.icon} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <LogOut size={40} color={Colors.error} />
        </View>

        <Text style={styles.title}>Logout</Text>
        <Text style={styles.message}>
          Are you sure you want to logout? You'll need to sign in again to access your account.
        </Text>

        <View style={styles.buttons}>
          <AppButton title="Cancel" onPress={() => router.back()} variant="outline" style={styles.cancelBtn} />
          <AppButton title="Logout" onPress={handleLogout} style={styles.logoutBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.dark + '80',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  message: { fontSize: 15, color: Colors.gray.text, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1 },
  logoutBtn: { flex: 1 },
});
