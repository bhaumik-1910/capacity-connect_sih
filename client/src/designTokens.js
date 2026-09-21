/**
 * CAPACITY CONNECT - Centralized Design Tokens
 * Ministry of Earth Sciences (MoES) | India Meteorological Department (IMD)
 * Strict Minimalism Government Digital Product UI System
 */

export const colors = {
  // Brand / Institutional Primary
  primary: '#1F4E79',
  primaryHover: '#163A5C',
  primarySoft: '#EAF2F8',
  primaryMuted: '#D0E1F0',

  // Typography / Neutrals
  textPrimary: '#17202A',
  textSecondary: '#5F6B76',
  textMuted: '#87919B',
  textInverse: '#FFFFFF',

  // Surfaces & Backgrounds
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F3F6',
  surfaceHover: '#F8FAFC',
  border: '#E5E7EB',
  borderSubtle: '#F0F2F5',
  borderFocus: '#1F4E79',

  // Semantic Feedback (Subdued / Non-saturated)
  success: '#1F7A4D',
  successSoft: '#E8F5E9',
  successText: '#145A32',

  warning: '#A66A00',
  warningSoft: '#FFF8E1',
  warningText: '#7D5000',

  error: '#B42318',
  errorSoft: '#FEE4E2',
  errorText: '#912018',

  info: '#2563EB',
  infoSoft: '#EFF6FF',
  infoText: '#1D4ED8',
};

export const typography = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  display: { fontSize: '36px', lineHeight: '44px', fontWeight: 700 },
  h1: { fontSize: '28px', lineHeight: '36px', fontWeight: 700 },
  h2: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
  h3: { fontSize: '20px', lineHeight: '28px', fontWeight: 600 },
  h4: { fontSize: '18px', lineHeight: '24px', fontWeight: 600 },
  bodyLarge: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
  body: { fontSize: '14px', lineHeight: '20px', fontWeight: 400 },
  small: { fontSize: '12px', lineHeight: '16px', fontWeight: 400 },
  tiny: { fontSize: '11px', lineHeight: '14px', fontWeight: 500 },
  button: { fontSize: '14px', lineHeight: '20px', fontWeight: 500 },
};

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  pill: '9999px',
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 2px 8px rgba(0, 0, 0, 0.06)',
  focus: '0 0 0 2px rgba(31, 78, 121, 0.25)',
  none: 'none',
};

export const layout = {
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '72px',
  topbarHeight: '64px',
  contentMaxWidth: '1440px',
  pagePaddingDesktop: '32px',
  pagePaddingTablet: '24px',
  pagePaddingMobile: '16px',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  layout,
  transitions,
};
