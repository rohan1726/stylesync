import { create } from 'zustand';
import * as api from '../api/client';

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  neutrals: string[];
}

export interface TypeScaleEntry {
  size: number;
  weight: number;
  lineHeight: number;
}

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: number;
  scaleRatio: number;
  weights: number[];
  lineHeights: Record<string, number>;
  letterSpacing: Record<string, string>;
  scale: Record<string, TypeScaleEntry>;
}

export interface SpacingTokens {
  unit: number;
  scale: number[];
  values: Record<string, number>;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BorderRadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface VersionEntry {
  id: string;
  tokenPath: string;
  previousValue: string;
  newValue: string;
  changeType: string;
  createdAt: string;
}

type ExtractionStatus = 'idle' | 'scraping' | 'complete' | 'error';
type ActiveSection = 'colors' | 'typography' | 'spacing' | 'preview' | 'history' | 'export';

interface TokenStore {
  // Site data
  currentSiteId: string | null;
  siteUrl: string;
  siteTitle: string;
  extractionStatus: ExtractionStatus;
  errorMessage: string;

  // Tokens
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;

  // Lock state
  lockedPaths: Set<string>;

  // History
  versionHistory: VersionEntry[];

  // UI state
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;

  // Actions
  submitUrl: (url: string) => Promise<void>;
  pollStatus: (siteId: string) => Promise<void>;
  updateToken: (path: string, value: any) => void;
  toggleLock: (path: string) => void;
  applyCSSVariables: () => void;
  loadHistory: () => Promise<void>;
  reset: () => void;
}

const defaultColors: ColorTokens = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  neutrals: [],
};

const defaultTypography: TypographyTokens = {
  headingFont: 'Inter',
  bodyFont: 'Inter',
  monoFont: 'JetBrains Mono',
  baseSize: 16,
  scaleRatio: 1.25,
  weights: [400, 500, 600, 700],
  lineHeights: {},
  letterSpacing: { tight: '-0.02em', normal: '0em', wide: '0.05em' },
  scale: {
    h1: { size: 40, weight: 700, lineHeight: 1.2 },
    h2: { size: 32, weight: 700, lineHeight: 1.25 },
    h3: { size: 25, weight: 600, lineHeight: 1.3 },
    h4: { size: 20, weight: 600, lineHeight: 1.35 },
    h5: { size: 18, weight: 600, lineHeight: 1.4 },
    h6: { size: 16, weight: 600, lineHeight: 1.4 },
    body: { size: 16, weight: 400, lineHeight: 1.6 },
    caption: { size: 14, weight: 400, lineHeight: 1.4 },
  },
};

const defaultSpacing: SpacingTokens = {
  unit: 4,
  scale: [2, 4, 8, 16, 24, 32, 48, 64],
  values: { '2xs': 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 },
};

const defaultShadows: ShadowTokens = {
  sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
};

const defaultBorderRadius: BorderRadiusTokens = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const useTokenStore = create<TokenStore>((set, get) => ({
  currentSiteId: null,
  siteUrl: '',
  siteTitle: '',
  extractionStatus: 'idle',
  errorMessage: '',
  colors: { ...defaultColors },
  typography: { ...defaultTypography },
  spacing: { ...defaultSpacing },
  shadows: { ...defaultShadows },
  borderRadius: { ...defaultBorderRadius },
  lockedPaths: new Set<string>(),
  versionHistory: [],
  activeSection: 'colors',

  setActiveSection: (section) => set({ activeSection: section }),

  submitUrl: async (url: string) => {
    set({ extractionStatus: 'scraping', errorMessage: '', siteUrl: url });
    try {
      const result = await api.submitUrl(url);
      set({ currentSiteId: result.siteId });
      // Start polling
      get().pollStatus(result.siteId);
    } catch (error: any) {
      set({
        extractionStatus: 'error',
        errorMessage: error.message || 'Failed to submit URL',
      });
    }
  },

  pollStatus: async (siteId: string) => {
    const maxAttempts = 60;
    let attempt = 0;

    const poll = async () => {
      try {
        const data = await api.getScrapeStatus(siteId);

        if (data.status === 'completed' && data.tokens) {
          set({
            extractionStatus: 'complete',
            siteTitle: data.title || '',
            colors: data.tokens.colors,
            typography: data.tokens.typography,
            spacing: data.tokens.spacing,
            shadows: data.tokens.shadows || defaultShadows,
            borderRadius: data.tokens.borderRadius || defaultBorderRadius,
            lockedPaths: new Set(data.tokens.lockedPaths || []),
          });
          get().applyCSSVariables();
          return;
        }

        if (data.status === 'failed') {
          set({
            extractionStatus: 'error',
            errorMessage: data.errorMessage || 'Extraction failed',
          });
          return;
        }

        attempt++;
        if (attempt < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          set({
            extractionStatus: 'error',
            errorMessage: 'Extraction timed out. The site may be too complex.',
          });
        }
      } catch {
        attempt++;
        if (attempt < maxAttempts) {
          setTimeout(poll, 3000);
        }
      }
    };

    poll();
  },

  updateToken: (path: string, value: any) => {
    const state = get();
    const [category, ...rest] = path.split('.');
    const key = rest.join('.');

    // Update local state immediately for instant preview
    const newState: any = {};

    if (category === 'colors') {
      const updated = { ...state.colors } as any;
      setDeep(updated, key, value);
      newState.colors = updated;
    } else if (category === 'typography') {
      const updated = { ...state.typography, scale: { ...state.typography.scale } } as any;
      setDeep(updated, key, value);
      newState.typography = updated;
    } else if (category === 'spacing') {
      const updated = { ...state.spacing, values: { ...state.spacing.values } } as any;
      setDeep(updated, key, value);
      newState.spacing = updated;
    } else if (category === 'shadows') {
      const updated = { ...state.shadows } as any;
      setDeep(updated, key, value);
      newState.shadows = updated;
    } else if (category === 'borderRadius') {
      const updated = { ...state.borderRadius } as any;
      setDeep(updated, key, value);
      newState.borderRadius = updated;
    }

    set(newState);

    // Apply CSS variables immediately
    setTimeout(() => get().applyCSSVariables(), 0);

    // Persist to backend (fire and forget)
    if (state.currentSiteId) {
      api.updateToken(state.currentSiteId, path, String(value)).catch(console.error);
    }
  },

  toggleLock: (path: string) => {
    const state = get();
    const newLocked = new Set(state.lockedPaths);

    if (newLocked.has(path)) {
      newLocked.delete(path);
      if (state.currentSiteId) {
        api.unlockToken(state.currentSiteId, path).catch(console.error);
      }
    } else {
      newLocked.add(path);
      if (state.currentSiteId) {
        api.lockToken(state.currentSiteId, path).catch(console.error);
      }
    }

    set({ lockedPaths: newLocked });
  },

  applyCSSVariables: () => {
    const state = get();
    const root = document.documentElement;
    const { colors, typography, spacing, shadows, borderRadius } = state;

    // Colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);

    // Typography
    root.style.setProperty('--font-heading', `'${typography.headingFont}', sans-serif`);
    root.style.setProperty('--font-body', `'${typography.bodyFont}', sans-serif`);
    root.style.setProperty('--font-mono', `'${typography.monoFont}', monospace`);
    root.style.setProperty('--font-size-base', `${typography.baseSize}px`);

    for (const [name, val] of Object.entries(typography.scale)) {
      root.style.setProperty(`--font-size-${name}`, `${val.size}px`);
      root.style.setProperty(`--font-weight-${name}`, `${val.weight}`);
      root.style.setProperty(`--line-height-${name}`, `${val.lineHeight}`);
    }

    // Spacing
    for (const [name, val] of Object.entries(spacing.values)) {
      root.style.setProperty(`--spacing-${name}`, `${val}px`);
    }

    // Shadows
    root.style.setProperty('--shadow-sm', shadows.sm);
    root.style.setProperty('--shadow-md', shadows.md);
    root.style.setProperty('--shadow-lg', shadows.lg);
    root.style.setProperty('--shadow-xl', shadows.xl);

    // Border Radius
    root.style.setProperty('--radius-sm', `${borderRadius.sm}px`);
    root.style.setProperty('--radius-md', `${borderRadius.md}px`);
    root.style.setProperty('--radius-lg', `${borderRadius.lg}px`);
    root.style.setProperty('--radius-xl', `${borderRadius.xl}px`);
    root.style.setProperty('--radius-full', `${borderRadius.full}px`);

    // Load Google Fonts dynamically
    loadGoogleFont(typography.headingFont);
    if (typography.bodyFont !== typography.headingFont) {
      loadGoogleFont(typography.bodyFont);
    }
  },

  loadHistory: async () => {
    const state = get();
    if (!state.currentSiteId) return;
    try {
      const history = await api.getVersionHistory(state.currentSiteId);
      set({ versionHistory: history });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  },

  reset: () => {
    set({
      currentSiteId: null,
      siteUrl: '',
      siteTitle: '',
      extractionStatus: 'idle',
      errorMessage: '',
      colors: { ...defaultColors },
      typography: { ...defaultTypography },
      spacing: { ...defaultSpacing },
      shadows: { ...defaultShadows },
      borderRadius: { ...defaultBorderRadius },
      lockedPaths: new Set<string>(),
      versionHistory: [],
    });
  },
}));

function setDeep(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) current[keys[i]] = {};
    if (typeof current[keys[i]] === 'object' && !Array.isArray(current[keys[i]])) {
      current[keys[i]] = { ...current[keys[i]] };
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const loadedFonts = new Set<string>();

function loadGoogleFont(fontName: string) {
  if (loadedFonts.has(fontName)) return;
  if (['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(fontName)) return;

  loadedFonts.add(fontName);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}
