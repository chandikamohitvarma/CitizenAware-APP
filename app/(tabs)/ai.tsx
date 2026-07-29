import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Mic, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { ChatBubble } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';
import { chatMessages } from '@/constants/data';

export default function AIScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, chatMessages: messages, isTyping, addAIResponse } = useNotificationStore();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    setTimeout(() => {
      const responses = [
        'I found 3 schemes matching your criteria. Would you like me to show them?',
        'Based on your profile, you are eligible for PM Scholarship Scheme and Ayushman Bharat.',
        'Let me check that for you. This scheme provides benefits up to INR 50,000 per year.',
      ];
      addAIResponse(responses[Math.floor(Math.random() * responses.length)], [
        'View details',
        'Check eligibility',
        'Compare schemes',
      ]);
    }, 1500);
  };

  const handleSuggestionPress = (suggestion: string) => {
    sendMessage(suggestion);
    setTimeout(() => {
      addAIResponse('Great choice! Let me find the information you need.', [
        'Tell me more',
        'Apply now',
      ]);
    }, 1000);
  };

  const handleVoice = () => {
    router.push('/ai/voice');
  };

  const quickActions = [
    { label: 'Find Education Schemes', query: 'Show education schemes for students' },
    { label: 'Check Eligibility', query: 'Am I eligible for PM Scholarship?' },
    { label: 'Track Applications', query: 'What is the status of my applications?' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Sparkles size={24} color={Colors.white} />
            <View style={styles.headerText}>
              <Text style={styles.title}>AI Assistant</Text>
              <Text style={styles.subtitle}>Ask me anything about schemes</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.quickActions} horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickChip}
            onPress={() => handleSuggestionPress(action.query)}
          >
            <Text style={styles.quickText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} onSuggestionPress={handleSuggestionPress} />
          ))}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleVoice} style={styles.voiceButton}>
            <Mic size={22} color={Colors.primary.blue} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about schemes..."
              placeholderTextColor={Colors.gray.icon}
              style={styles.input}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <LinearGradient
              colors={[Colors.primary.blue, Colors.primary.green]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendGradient}
            >
              <Send size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { router } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    borderRadius: 16,
    margin: 16,
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary.blue + '30',
  },
  quickText: {
    fontSize: 13,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.blue,
    opacity: 0.4,
  },
  typingDot2: {
    marginLeft: 4,
    opacity: 0.6,
  },
  typingDot3: {
    marginLeft: 4,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.gray.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: Colors.dark,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
