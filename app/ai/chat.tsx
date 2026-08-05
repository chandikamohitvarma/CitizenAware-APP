import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Send, Mic, Sparkles, Trash2, Globe, ShieldCheck } from 'lucide-react-native';
import { Linking } from 'react-native';
import { Colors } from '@/constants/colors';
import { ChatBubble, Header } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';
import { processAIQuery } from '@/lib/aiEngine';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, chatMessages, isTyping, addAIResponse, setTyping, clearChat } =
    useNotificationStore();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages, isTyping]);

  const handleSendQuery = (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    sendMessage(text);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = processAIQuery(text);
      addAIResponse(response.text, response.suggestions);

      if (response.actionType === 'apply' && response.actionTargetId) {
        setTimeout(() => {
          router.push(`/apply/${response.actionTargetId}`);
        }, 1200);
      } else if (response.actionType === 'eligibility' && response.actionTargetId) {
        setTimeout(() => {
          router.push(`/scheme/eligibility/${response.actionTargetId}`);
        }, 1200);
      } else if (response.actionType === 'tracking') {
        setTimeout(() => {
          router.push('/application/tracking');
        }, 1200);
      } else if (response.actionType === 'official' && response.actionUrl) {
        Linking.openURL(response.actionUrl).catch(() => {});
      }
    }, 600);
  };

  const quickQuestions = [
    'July 2026 Scheme Updates',
    'What schemes am I eligible for?',
    'Scholarships for Students',
    'Farmer & Agriculture Benefits',
    'Women Welfare Schemes',
    'Business Loans & Subsidies',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="AI Scheme Assistant"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity style={styles.clearBtn} onPress={clearChat}>
            <Trash2 size={18} color={Colors.gray.icon} />
          </TouchableOpacity>
        }
      />

      <View style={styles.aiBadgeBanner}>
        <Sparkles size={16} color="#2563EB" />
        <Text style={styles.aiBadgeText}>
          Powered by CitizenAware Scheme Intelligence • 180+ Active Schemes
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onSuggestionPress={(s) => handleSendQuery(s)}
            />
          ))}

          {isTyping && (
            <View style={styles.typingContainer}>
              <Sparkles size={14} color={Colors.primary.blue} />
              <Text style={styles.typingText}>CitizenAware AI is analyzing schemes...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickPromptContainer}>
          <Text style={styles.quickPromptHeader}>Suggested Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickQuestions}>
            {quickQuestions.map((q, i) => (
              <TouchableOpacity key={i} style={styles.quickChip} onPress={() => handleSendQuery(q)}>
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.micBtn} onPress={() => router.push('/ai/voice')}>
            <Mic size={20} color={Colors.primary.blue} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about PM Kisan, Scholarships, Housing..."
            placeholderTextColor={Colors.gray.icon}
            onSubmitEditing={() => handleSendQuery(input)}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSendQuery(input)}
            disabled={!input.trim()}
          >
            <Send size={18} color={input.trim() ? Colors.white : Colors.gray.icon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  clearBtn: { padding: 4 },
  aiBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  aiBadgeText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },
  chatContainer: { flex: 1 },
  messages: { flex: 1, paddingHorizontal: 16 },
  messagesContent: { paddingTop: 12, paddingBottom: 16 },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
    marginLeft: 36,
  },
  typingText: {
    fontSize: 12,
    color: Colors.primary.blue,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  quickPromptContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
    paddingTop: 8,
    paddingBottom: 4,
  },
  quickPromptHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 6,
  },
  quickQuestions: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 6,
  },
  quickChip: {
    backgroundColor: Colors.gray.light,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  quickText: { fontSize: 12, color: Colors.dark, fontWeight: '500' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
    gap: 8,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary.blue + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.dark,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.gray.border,
  },
});
