import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mic, MicOff, Volume2, Sparkles, MessageSquare } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';
import { processAIQuery } from '@/lib/aiEngine';

export default function VoiceAssistantScreen() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const { sendMessage, addAIResponse, setTyping } = useNotificationStore();

  const scaleAnim = React.useRef(new RNAnimated.Value(1)).current;
  const opacityAnim = React.useRef(new RNAnimated.Value(0.3)).current;

  // Initialize Web Speech API if on Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-IN';

        recog.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recog.onend = () => {
          setListening(false);
        };

        setRecognition(recog);
      }
    }
  }, []);

  const handleToggleListening = () => {
    if (listening) {
      setListening(false);
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    } else {
      setListening(true);
      setTranscript('');
      if (recognition) {
        try {
          recognition.start();
        } catch {}
      } else {
        // Fallback simulation timer if Speech API unavailable
        const sampleQueries = [
          'Show scholarship schemes for students',
          'What benefits are available for farmers?',
          'Tell me about PM Vishwakarma Yojana',
          'How do I apply for housing subsidy?',
        ];
        const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];

        let i = 0;
        const interval = setInterval(() => {
          if (i <= randomQuery.length) {
            setTranscript(randomQuery.slice(0, i));
            i += 3;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setListening(false);
            }, 600);
          }
        }, 80);
      }
    }
  };

  const handleProcessVoiceInput = (textToProcess?: string) => {
    const query = (textToProcess || transcript).trim();
    if (!query) return;

    sendMessage(query);
    setTyping(true);

    const response = processAIQuery(query);
    setTimeout(() => {
      addAIResponse(response.text, response.suggestions);
      router.push('/ai/chat');
    }, 500);
  };

  useEffect(() => {
    if (transcript && !listening) {
      const timer = setTimeout(() => {
        handleProcessVoiceInput(transcript);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [listening, transcript]);

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

  const presetVoiceQueries = [
    '🎓 Show Education Scholarships',
    '🌾 Farmer Benefit Schemes',
    '👩 Women Welfare Schemes',
    '🏠 Housing Subsidies',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Voice Assistant" showBack onBackPress={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Sparkles size={14} color={Colors.primary.blue} />
          <Text style={styles.badgeText}>Voice Scheme Search</Text>
        </View>

        <Text style={styles.title}>
          {listening ? 'Listening to your voice...' : transcript ? 'Speech Recognized!' : 'Tap Mic & Speak'}
        </Text>

        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            Ask about any scheme, eligibility requirements, or documents in English or Hindi
          </Text>
        )}

        <TouchableOpacity
          style={styles.micContainer}
          onPress={handleToggleListening}
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
            colors={
              listening
                ? [Colors.primary.green, Colors.primary.blue]
                : [Colors.primary.blue, '#3B82F6']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.micGradient}
          >
            {listening ? (
              <MicOff size={44} color={Colors.white} />
            ) : (
              <Mic size={44} color={Colors.white} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {transcript && !listening && (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => handleProcessVoiceInput(transcript)}
          >
            <MessageSquare size={18} color={Colors.white} />
            <Text style={styles.submitBtnText}>Search Schemes for "{transcript}"</Text>
          </TouchableOpacity>
        )}

        <View style={styles.presetsContainer}>
          <Text style={styles.presetsTitle}>Or tap a sample question:</Text>
          <View style={styles.presetsGrid}>
            {presetVoiceQueries.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetChip}
                onPress={() => handleProcessVoiceInput(preset.replace(/^[^\w]+/, ''))}
              >
                <Text style={styles.presetText}>{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.blue + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, color: Colors.primary.blue, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.gray.text, textAlign: 'center', marginBottom: 32, paddingHorizontal: 16, lineHeight: 20 },
  transcriptBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary.blue + '30',
    maxWidth: '90%',
  },
  transcriptText: { fontSize: 16, color: Colors.primary.blue, fontWeight: '600', fontStyle: 'italic', textAlign: 'center' },
  micContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  ripple: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.primary.blue + '30' },
  micGradient: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
  },
  submitBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  presetsContainer: { width: '100%', alignItems: 'center', marginTop: 12 },
  presetsTitle: { fontSize: 12, color: Colors.gray.text, marginBottom: 12, fontWeight: '500' },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  presetChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  presetText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
});
