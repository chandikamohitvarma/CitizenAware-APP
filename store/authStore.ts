import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { User } from '@/types';
import { getCurrentUser, login as apiLogin, register as apiRegister } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
  selectedLanguage: string;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<boolean>;
  setUser: (user: User, token?: string | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLanguage: (lang: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

const AUTH_TOKEN_KEY = 'citizenaware_auth_token';

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      onboardingCompleted: false,
      selectedLanguage: 'en',

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const tokenResponse = await apiLogin(email, password);
          const token = tokenResponse.access_token;
          const user = await getCurrentUser(token);
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          const message = error?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          set({
            isAuthenticated: true,
            user: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ error: 'Google sign-in failed', isLoading: false });
          return false;
        }
      },

      register: async (name: string, email: string, phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiRegister(name, email, password, phone);
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          const message = error?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      verifyOTP: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (otp === '123456' || otp.length === 6) {
            set({
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ error: 'Invalid OTP', isLoading: false });
          return false;
        } catch (error) {
          set({ error: 'Verification failed', isLoading: false });
          return false;
        }
      },

      setUser: (user: User, token: string | null = null) => set({ user, token, isAuthenticated: true }),

      setOnboardingCompleted: (completed: boolean) => set({ onboardingCompleted: completed }),

      setLanguage: (lang: string) => set({ selectedLanguage: lang }),

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),
    })
);
