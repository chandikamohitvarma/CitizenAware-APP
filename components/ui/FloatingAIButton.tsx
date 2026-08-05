import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';

export function FloatingAIButton() {
  return (
    <TouchableOpacity
      style={styles.floatingBtn}
      onPress={() => router.push('/(tabs)/ai')}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[Colors.primary.blue, Colors.primary.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Sparkles size={24} color={Colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 999,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
