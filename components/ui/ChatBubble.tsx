import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  onSuggestionPress?: (suggestion: string) => void;
}

export function ChatBubble({ message, onSuggestionPress }: ChatBubbleProps) {
  const isUser = message.sender === 'user';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.time}>{formatTime(message.timestamp)}</Text>

      {message.suggestions && message.suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {message.suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSuggestionPress?.(suggestion)}
              style={styles.suggestionChip}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: Colors.primary.blue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    ...Colors.shadows?.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  aiText: {
    color: Colors.dark,
  },
  time: {
    fontSize: 11,
    color: Colors.gray.text,
    marginTop: 4,
    marginHorizontal: 4,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.primary.blue + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary.blue + '40',
  },
  suggestionText: {
    fontSize: 13,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
});
