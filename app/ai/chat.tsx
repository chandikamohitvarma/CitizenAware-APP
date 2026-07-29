import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, KeyboardAvoidingViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Send, Mic } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { ChatBubble, Header } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { sendMessage, chatMessages, isTyping, addAIResponse } = useNotificationStore();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    setTimeout(() => {
      addAIResponse('Based on your query, I found some relevant schemes. Would you like me to show them?', ['Yes, show me', 'More details']);
    }, 1500);
  };

  const quickQuestions = [
    'What schemes am I eligible for?',
    'How do I apply for PM Scholarship?',
    'Track my application status',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI Assistant" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatContainer} keyboardVerticalOffset={80}>
        <ScrollView ref={scrollViewRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
          {chatMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onSuggestionPress={(s) => setInput(s)} />
          ))}
          {isTyping && <Text style={styles.typing}>AI is typing...</Text>}
        </ScrollView>

        <View style={styles.quickQuestions}>
          {quickQuestions.map((q, i) => (
            <TouchableOpacity key={i} style={styles.quickChip} onPress={() => setInput(q)}>
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.micBtn} onPress={() => router.push('/ai/voice')}>
            <Mic size={22} color={Colors.gray.icon} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about schemes..."
            placeholderTextColor={Colors.gray.icon}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={20} color={Colors.primary.blue} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chatContainer: { flex: 1 },
  messages: { flex: 1, padding: 16 },
  messagesContent: { paddingBottom: 16 },
  typing: { color: Colors.gray.text, fontSize: 12, fontStyle: 'italic', marginLeft: 16 },
  quickQuestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  quickChip: { backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.gray.border },
  quickText: { fontSize: 12, color: Colors.dark },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border, gap: 8 },
  micBtn: { padding: 8 },
  input: { flex: 1, backgroundColor: Colors.gray.light, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendBtn: { padding: 10, backgroundColor: Colors.primary.blue + '15', borderRadius: 20 },
});
