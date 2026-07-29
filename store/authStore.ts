import { create } from 'zustand';
import { User } from '@/types';
import { currentUser } from '@/constants/data';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
  selectedLanguage: string;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  setUser: (user: User) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLanguage: (lang: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      onboardingCompleted: false,
      selectedLanguage: 'en',

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          if (email && password.length >= 6) {
            set({
              isAuthenticated: true,
              user: currentUser,
              isLoading: false,
            });
            return true;
          }
          set({ error: 'Invalid credentials', isLoading: false });
          return false;
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          set({
            isAuthenticated: true,
            user: currentUser,
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
          await new Promise(resolve => setTimeout(resolve, 1500));
          const newUser: User = {
            ...currentUser,
            id: Date.now().toString(),
            name,
            email,
            phone,
            createdAt: new Date().toISOString(),
          };
          set({
            user: newUser,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ error: 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
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

      setUser: (user: User) => set({ user, isAuthenticated: true }),

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
