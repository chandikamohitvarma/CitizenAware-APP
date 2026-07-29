import { create } from 'zustand';
import { Notification, Message, Ticket } from '@/types';
import { notifications, chatMessages, tickets } from '@/constants/data';

interface NotificationState {
  notifications: Notification[];
  chatMessages: Message[];
  tickets: Ticket[];
  unreadCount: number;
  isTyping: boolean;
  isListening: boolean;

  // Actions
  getNotifications: () => Notification[];
  getUnreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;

  // Chat actions
  sendMessage: (content: string) => void;
  addAIResponse: (content: string, suggestions?: string[]) => void;
  setTyping: (typing: boolean) => void;
  clearChat: () => void;

  // Voice actions
  setIsListening: (listening: boolean) => void;

  // Support actions
  getTickets: () => Ticket[];
  getTicketById: (id: string) => Ticket | undefined;
  createTicket: (subject: string, description: string) => Ticket;
  addTicketResponse: (ticketId: string, message: string, sender: 'user' | 'support') => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
      notifications: notifications,
      chatMessages: chatMessages,
      tickets: tickets,
      unreadCount: notifications.filter(n => !n.read).length,
      isTyping: false,
      isListening: false,

      getNotifications: () => get().notifications,

      getUnreadCount: () => get().notifications.filter(n => !n.read).length,

      markAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      addNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      deleteNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      sendMessage: (content: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: 'user',
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage],
        }));
      },

      addAIResponse: (content: string, suggestions?: string[]) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          suggestions,
        };
        set(state => ({
          chatMessages: [...state.chatMessages, aiMessage],
          isTyping: false,
        }));
      },

      setTyping: (typing: boolean) => set({ isTyping: typing }),

      clearChat: () => set({ chatMessages: chatMessages }),

      setIsListening: (listening: boolean) => set({ isListening: listening }),

      getTickets: () => get().tickets,

      getTicketById: (id: string) => get().tickets.find(t => t.id === id),

      createTicket: (subject: string, description: string) => {
        const newTicket: Ticket = {
          id: `TKT${String(get().tickets.length + 1).padStart(3, '0')}`,
          subject,
          description,
          status: 'open',
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          responses: [],
        };
        set(state => ({
          tickets: [newTicket, ...state.tickets],
        }));
        return newTicket;
      },

      addTicketResponse: (ticketId: string, message: string, sender: 'user' | 'support') => {
        const response = {
          id: Date.now().toString(),
          message,
          sender,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          tickets: state.tickets.map(t =>
            t.id === ticketId
              ? { ...t, responses: [...t.responses, response], updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },
    })
);
