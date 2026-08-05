import { create } from 'zustand';

export interface DraftFormData {
  // Personal Details
  name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;

  // Address Details
  street: string;
  state: string;
  city: string;
  pincode: string;

  // Income Details
  annualIncome: string;
  incomeSource: string;
  incomeCategory: string;
  bplCardNumber: string;
  incomeCertNumber: string;

  // Documents
  documents: Record<string, boolean>;

  // Bank Details
  accountNumber: string;
  confirmAccount: string;
  ifsc: string;
  bankName: string;
  accountType: string;
  customBankName: string;
}

interface ApplicationDraftState {
  drafts: Record<string, DraftFormData>;
  getDraft: (
    schemeId: string,
    userDefaults?: {
      name?: string;
      phone?: string;
      email?: string;
      dateOfBirth?: string;
      gender?: string;
    }
  ) => DraftFormData;
  updateDraft: (schemeId: string, updates: Partial<DraftFormData>) => void;
  clearDraft: (schemeId: string) => void;
  clearAllDrafts: () => void;
}

const initialDraft: DraftFormData = {
  name: '',
  dob: '',
  gender: 'Male',
  phone: '',
  email: '',
  street: '',
  state: '',
  city: '',
  pincode: '',
  annualIncome: '',
  incomeSource: 'Salaried',
  incomeCategory: 'APL',
  bplCardNumber: '',
  incomeCertNumber: '',
  documents: {},
  accountNumber: '',
  confirmAccount: '',
  ifsc: '',
  bankName: '',
  accountType: 'Savings',
  customBankName: '',
};

export const useApplicationDraftStore = create<ApplicationDraftState>((set, get) => ({
  drafts: {},

  getDraft: (schemeId: string, userDefaults?: { name?: string; phone?: string; email?: string; dateOfBirth?: string; gender?: string }) => {
    const existing = get().drafts[schemeId];
    if (existing) {
      // If draft exists but user profile has filled in fields that draft is missing, apply them
      const merged: DraftFormData = { ...existing };
      if (!existing.name && userDefaults?.name) merged.name = userDefaults.name;
      if (!existing.phone && userDefaults?.phone) merged.phone = userDefaults.phone;
      if (!existing.email && userDefaults?.email) merged.email = userDefaults.email;
      if (!existing.dob && userDefaults?.dateOfBirth) merged.dob = userDefaults.dateOfBirth;
      if (!existing.gender && userDefaults?.gender) merged.gender = userDefaults.gender;
      return merged;
    }
    return {
      ...initialDraft,
      name: userDefaults?.name || '',
      phone: userDefaults?.phone || '',
      email: userDefaults?.email || '',
      dob: userDefaults?.dateOfBirth || '',
      gender: userDefaults?.gender || 'Male',
    };
  },

  updateDraft: (schemeId: string, updates: Partial<DraftFormData>) => {
    set((state) => {
      const current = state.drafts[schemeId] || initialDraft;
      return {
        drafts: {
          ...state.drafts,
          [schemeId]: {
            ...current,
            ...updates,
          },
        },
      };
    });
  },

  clearDraft: (schemeId: string) => {
    set((state) => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[schemeId];
      return { drafts: newDrafts };
    });
  },

  clearAllDrafts: () => {
    set({ drafts: {} });
  },
}));
