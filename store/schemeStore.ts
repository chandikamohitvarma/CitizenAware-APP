import { create } from 'zustand';
import { Scheme, Application } from '@/types';
import { schemes, applications } from '@/constants/data';

interface SchemeState {
  schemes: Scheme[];
  applications: Application[];
  savedSchemes: string[];
  recentlyViewed: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;

  // Actions
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
  createApplication: (schemeId: string) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
}

export const useSchemeStore = create<SchemeState>()(
  (set, get) => ({
      schemes: schemes,
      applications: applications,
      savedSchemes: [],
      recentlyViewed: [],
      selectedCategory: null,
      searchQuery: '',
      isLoading: false,

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

      createApplication: (schemeId: string) => {
        const scheme = get().getSchemeById(schemeId);
        if (!scheme) throw new Error('Scheme not found');

        const newApplication: Application = {
          id: Date.now().toString(),
          schemeId,
          schemeName: scheme.name,
          userId: '1',
          status: 'draft',
          currentStep: 1,
          totalSteps: 6,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents: scheme.documents.map(doc => ({
            name: doc,
            uploaded: false,
            verified: false,
          })),
        };

        set(state => ({
          applications: [...state.applications, newApplication],
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
