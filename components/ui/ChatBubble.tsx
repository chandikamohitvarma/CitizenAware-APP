import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Message } from '@/types';
import { Bot, User as UserIcon } from 'lucide-react-native';

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

  // Simple Markdown-style **bold** renderer
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={styles.avatarRow}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Bot size={16} color={Colors.white} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {renderFormattedText(message.content)}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <UserIcon size={14} color={Colors.white} />
          </View>
        )}
      </View>

      <Text style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
        {formatTime(message.timestamp)}
      </Text>

      {message.suggestions && message.suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {message.suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSuggestionPress?.(suggestion)}
              style={styles.suggestionChip}
              activeOpacity={0.8}
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
    marginVertical: 6,
    maxWidth: '90%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 16,
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: Colors.primary.blue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  boldText: {
    fontWeight: '700',
  },
  userText: {
    color: Colors.white,
  },
  aiText: {
    color: Colors.dark,
  },
  time: {
    fontSize: 10,
    color: Colors.gray.text,
    marginTop: 4,
  },
  userTime: {
    marginRight: 32,
  },
  aiTime: {
    marginLeft: 36,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginLeft: 36,
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 12,
    color: Colors.primary.blue,
    fontWeight: '600',
  },
});
