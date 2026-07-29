import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mic, MicOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';

export default function VoiceAssistantScreen() {
  const [listening, setListening] = useState(false);
  const { setIsListening } = useNotificationStore();
  const scaleAnim = React.useRef(new RNAnimated.Value(1)).current;
  const opacityAnim = React.useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    if (listening) {
      const timer = setTimeout(() => {
        setListening(false);
        router.push('/ai/results');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [listening]);

  React.useEffect(() => {
    if (listening) {
      const scaleAnimation = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(scaleAnim, { toValue: 1.3, duration: 400, useNativeDriver: false }),
          RNAnimated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
        ])
      );
      const opacityAnimation = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(opacityAnim, { toValue: 0.8, duration: 400, useNativeDriver: false }),
          RNAnimated.timing(opacityAnim, { toValue: 0.3, duration: 400, useNativeDriver: false }),
        ])
      );
      scaleAnimation.start();
      opacityAnimation.start();
      return () => {
        scaleAnimation.stop();
        opacityAnimation.stop();
      };
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
        RNAnimated.timing(opacityAnim, { toValue: 0.3, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [listening]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Voice Assistant" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        <Text style={styles.title}>{listening ? 'Listening...' : 'Tap to Speak'}</Text>
        <Text style={styles.subtitle}>
          {listening ? 'Say the name of a scheme or ask a question' : 'Use your voice to interact with CitizenAware'}
        </Text>

        <TouchableOpacity
          style={styles.micContainer}
          onPress={() => setListening(!listening)}
          activeOpacity={0.9}
        >
          <RNAnimated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <LinearGradient
            colors={listening ? [Colors.primary.green, Colors.primary.blue] : [Colors.primary.blue, Colors.primary.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.micGradient}
          >
            {listening ? <MicOff size={40} color={Colors.white} /> : <Mic size={40} color={Colors.white} />}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hint}>Try saying: "Show education schemes" or "Check my application status"</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.gray.text, textAlign: 'center', marginBottom: 48 },
  micContainer: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
  ripple: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primary.blue + '30' },
  micGradient: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 13, color: Colors.gray.text, textAlign: 'center' },
});
