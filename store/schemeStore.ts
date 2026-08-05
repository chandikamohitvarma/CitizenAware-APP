import { create } from 'zustand';
import { Scheme, Application } from '@/types';
import { schemes, applications } from '@/constants/data';
import { getSchemes } from '@/lib/api';

interface SchemeState {
  schemes: Scheme[];
  applications: Application[];
  savedSchemes: string[];
  recentlyViewed: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  fetchLatestSchemes: () => Promise<Scheme[]>;
  getSchemes: () => Scheme[];
  getSchemeById: (id: string) => Scheme | undefined;
  getSchemesByCategory: (category: string) => Scheme[];
  getFeaturedSchemes: () => Scheme[];
  searchSchemes: (query: string) => Scheme[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  saveScheme: (schemeId: string) => void;
  unsaveScheme: (schemeId: string) => void;
  isSchemeSaved: (schemeId: string) => boolean;
  addToRecentlyViewed: (schemeId: string) => void;
  getRecentlyViewedSchemes: () => Scheme[];
  getApplications: () => Application[];
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByStatus: (status: string) => Application[];
  createApplication: (schemeId: string, userId?: string, schemeOverride?: { name: string; documents: string[] }, statusOverride?: 'draft' | 'submitted', refNumber?: string, dbSynced?: boolean) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
}

export const useSchemeStore = create<SchemeState>()(
  (set, get) => ({
      schemes: schemes,
      applications: [],
      savedSchemes: [],
      recentlyViewed: [],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,

      fetchLatestSchemes: async () => {
        set({ isLoading: true });
        try {
          const fetchedSchemes = await getSchemes();
          if (Array.isArray(fetchedSchemes) && fetchedSchemes.length > 0) {
            set({ schemes: fetchedSchemes, isLoading: false });
            return fetchedSchemes;
          }
        } catch (error) {
          console.warn('Could not fetch latest schemes from API, using cached/default schemes:', error);
        }
        set({ isLoading: false });
        return get().schemes;
      },

      getSchemes: () => get().schemes,

      getSchemeById: (id: string) => get().schemes.find(s => s.id === id),

      getSchemesByCategory: (category: string) =>
        get().schemes.filter(s => s.category === category),

      getFeaturedSchemes: () => get().schemes.filter(s => s.featured),

      searchSchemes: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().schemes.filter(
          s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery) ||
            s.category.toLowerCase().includes(lowerQuery)
        );
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      setSelectedCategory: (category: string | null) => set({ selectedCategory: category }),

      saveScheme: (schemeId: string) => {
        const { savedSchemes } = get();
        if (!savedSchemes.includes(schemeId)) {
          set({ savedSchemes: [...savedSchemes, schemeId] });
        }
      },

      unsaveScheme: (schemeId: string) => {
        const { savedSchemes } = get();
        set({ savedSchemes: savedSchemes.filter(id => id !== schemeId) });
      },

      isSchemeSaved: (schemeId: string) => get().savedSchemes.includes(schemeId),

      addToRecentlyViewed: (schemeId: string) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter(id => id !== schemeId);
        set({ recentlyViewed: [schemeId, ...filtered].slice(0, 10) });
      },

      getRecentlyViewedSchemes: () => {
        const { recentlyViewed, schemes } = get();
        return recentlyViewed.map(id => schemes.find(s => s.id === id)).filter(Boolean) as Scheme[];
      },

      getApplications: () => get().applications,

      getApplicationById: (id: string) => get().applications.find(a => a.id === id),

      getApplicationsByStatus: (status: string) =>
        get().applications.filter(a => a.status === status),

      createApplication: (
        schemeId: string,
        userId?: string,
        schemeOverride?: { name: string; documents: string[] },
        statusOverride: 'draft' | 'submitted' = 'submitted',
        refNumber?: string,
        dbSynced: boolean = true
      ) => {
        const scheme = get().getSchemeById(schemeId);
        // Use local scheme data, or fall back to the override for API-sourced schemes with UUID ids
        const schemeName = scheme?.name ?? schemeOverride?.name ?? 'Unknown Scheme';
        const schemeDocs = scheme?.documents ?? schemeOverride?.documents ?? [];
        const govRef = refNumber || `GOV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        const newApplication: Application = {
          id: Date.now().toString(),
          schemeId,
          schemeName,
          userId: userId || '1',
          status: statusOverride,
          currentStep: statusOverride === 'submitted' ? 6 : 1,
          totalSteps: 6,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          referenceNumber: govRef,
          dbSynced: dbSynced,
          documents: schemeDocs.map(doc => ({
            name: doc,
            uploaded: true,
            verified: statusOverride === 'submitted',
          })),
        };

        set(state => ({
          applications: [newApplication, ...state.applications.filter(a => a.schemeId !== schemeId || a.status !== 'draft')],
        }));

        return newApplication;
      },

      updateApplication: (id: string, updates: Partial<Application>) => {
        set(state => ({
          applications: state.applications.map(app =>
            app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
          ),
        }));
      },
    })
);
