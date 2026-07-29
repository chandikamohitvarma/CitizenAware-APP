import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export function Loading({ message = 'Loading...', size = 'large' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary.blue} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.gray.text,
    marginTop: 8,
  },
});
