import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function AddressInformationScreen() {
  const { user, updateProfile } = useAuthStore();
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');

  const handleSave = () => {
    updateProfile({ address: { street, city, state, pincode } });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Address Information" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <AppInput label="Street Address" value={street} onChangeText={setStreet} placeholder="House No, Street" multiline numberOfLines={2} />
        <AppInput label="City" value={city} onChangeText={setCity} placeholder="Enter city" />
        <AppInput label="State" value={state} onChangeText={setState} placeholder="Enter state" />
        <AppInput label="Pincode" value={pincode} onChangeText={setPincode} placeholder="6-digit pincode" keyboardType="numeric" maxLength={6} />
      </ScrollView>
      <View style={styles.footer}>
        <AppButton title="Save Changes" onPress={handleSave} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
