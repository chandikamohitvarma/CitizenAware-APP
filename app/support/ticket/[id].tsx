import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header, AppButton } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';
import { tickets } from '@/constants/data';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const ticket = tickets.find((t) => t.id === id) || tickets[0];
  const [reply, setReply] = useState('');

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'resolved':
        return Colors.success;
      case 'open':
        return Colors.warning;
      default:
        return Colors.gray.text;
    }
  };

  const handleReply = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ticket Details" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.idRow}>
            <Text style={styles.ticketId}>{ticket.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{ticket.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.subject}>{ticket.subject}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={Colors.gray.text} />
              <Text style={styles.metaText}>{new Date(ticket.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color={Colors.gray.text} />
              <Text style={styles.metaText}>{ticket.priority[0].toUpperCase() + ticket.priority.slice(1)} Priority</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conversation</Text>
        {ticket.responses.map((resp) => (
          <View
            key={resp.id}
            style={[styles.message, resp.sender === 'user' ? styles.userMsg : styles.supportMsg]}
          >
            <Text style={styles.senderName}>{resp.sender === 'user' ? 'You' : 'Support Team'}</Text>
            <Text style={styles.messageText}>{resp.message}</Text>
            <Text style={styles.messageTime}>
              {new Date(resp.timestamp).toLocaleDateString()}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Reply</Text>
        <TextInput
          style={styles.replyInput}
          value={reply}
          onChangeText={setReply}
          placeholder="Type your reply..."
          placeholderTextColor={Colors.gray.icon}
          multiline
          numberOfLines={4}
        />
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Send Reply" onPress={handleReply} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  header: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { fontSize: 14, fontWeight: '700', color: Colors.primary.blue },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700' },
  subject: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: Colors.gray.text },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  message: { borderRadius: 12, padding: 14, marginBottom: 12 },
  userMsg: { backgroundColor: Colors.primary.blue + '15', alignSelf: 'flex-end', marginLeft: 32 },
  supportMsg: { backgroundColor: Colors.white },
  senderName: { fontSize: 12, fontWeight: '600', color: Colors.dark, marginBottom: 6 },
  messageText: { fontSize: 14, color: Colors.dark, lineHeight: 20 },
  messageTime: { fontSize: 11, color: Colors.gray.text, marginTop: 8, textAlign: 'right' },
  replyInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white }
});
