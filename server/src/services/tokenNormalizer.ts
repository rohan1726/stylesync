import { ColorPalette } from './colorAnalyzer';
import { TypographyTokens } from './typographyAnalyzer';
import { SpacingTokens, ShadowTokens, BorderRadiusTokens } from './spacingAnalyzer';

export interface NormalizedTokens {
  colors: ColorPalette;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
}

export interface LockedTokenMap {
  [path: string]: string;
}

export function mergeWithLockedTokens(
  newTokens: NormalizedTokens,
  lockedTokens: LockedTokenMap
): NormalizedTokens {
  const merged = JSON.parse(JSON.stringify(newTokens)) as NormalizedTokens;

  for (const [path, value] of Object.entries(lockedTokens)) {
    setNestedValue(merged, path, value);
  }

  return merged;
}

function setNestedValue(obj: any, path: string, value: string): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) return;
    current = current[keys[i]];
  }

  const lastKey = keys[keys.length - 1];
  if (current[lastKey] !== undefined) {
    // Try to preserve the type
    const original = current[lastKey];
    if (typeof original === 'number') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        current[lastKey] = num;
        return;
      }
    }
    current[lastKey] = value;
  }
}

export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}

export function generateCSSVariables(tokens: NormalizedTokens): string {
  const vars: string[] = [':root {'];

  // Colors
  const { colors } = tokens;
  vars.push(`  /* Colors */`);
  vars.push(`  --color-primary: ${colors.primary};`);
  vars.push(`  --color-secondary: ${colors.secondary};`);
  vars.push(`  --color-accent: ${colors.accent};`);
  vars.push(`  --color-background: ${colors.background};`);
  vars.push(`  --color-surface: ${colors.surface};`);
  vars.push(`  --color-text: ${colors.text};`);
  vars.push(`  --color-text-secondary: ${colors.textSecondary};`);
  vars.push(`  --color-border: ${colors.border};`);
  vars.push(`  --color-success: ${colors.success};`);
  vars.push(`  --color-warning: ${colors.warning};`);
  vars.push(`  --color-error: ${colors.error};`);
  colors.neutrals.forEach((n, i) => {
    vars.push(`  --color-neutral-${i + 1}: ${n};`);
  });

  // Typography
  const { typography } = tokens;
  vars.push('');
  vars.push(`  /* Typography */`);
  vars.push(`  --font-heading: '${typography.headingFont}', sans-serif;`);
  vars.push(`  --font-body: '${typography.bodyFont}', sans-serif;`);
  vars.push(`  --font-mono: '${typography.monoFont}', monospace;`);
  vars.push(`  --font-size-base: ${typography.baseSize}px;`);
  vars.push(`  --font-scale-ratio: ${typography.scaleRatio};`);

  for (const [name, val] of Object.entries(typography.scale)) {
    vars.push(`  --font-size-${name}: ${val.size}px;`);
    vars.push(`  --font-weight-${name}: ${val.weight};`);
    vars.push(`  --line-height-${name}: ${val.lineHeight};`);
  }

  // Spacing
  const { spacing } = tokens;
  vars.push('');
  vars.push(`  /* Spacing */`);
  vars.push(`  --spacing-unit: ${spacing.unit}px;`);
  for (const [name, val] of Object.entries(spacing.values)) {
    vars.push(`  --spacing-${name}: ${val}px;`);
  }

  // Shadows
  const { shadows } = tokens;
  vars.push('');
  vars.push(`  /* Shadows */`);
  vars.push(`  --shadow-sm: ${shadows.sm};`);
  vars.push(`  --shadow-md: ${shadows.md};`);
  vars.push(`  --shadow-lg: ${shadows.lg};`);
  vars.push(`  --shadow-xl: ${shadows.xl};`);

  // Border Radius
  const { borderRadius } = tokens;
  vars.push('');
  vars.push(`  /* Border Radius */`);
  vars.push(`  --radius-sm: ${borderRadius.sm}px;`);
  vars.push(`  --radius-md: ${borderRadius.md}px;`);
  vars.push(`  --radius-lg: ${borderRadius.lg}px;`);
  vars.push(`  --radius-xl: ${borderRadius.xl}px;`);
  vars.push(`  --radius-full: ${borderRadius.full}px;`);

  vars.push('}');
  return vars.join('\n');
}

export function generateJSONTokens(tokens: NormalizedTokens): object {
  return {
    colors: {
      primary: { value: tokens.colors.primary },
      secondary: { value: tokens.colors.secondary },
      accent: { value: tokens.colors.accent },
      background: { value: tokens.colors.background },
      surface: { value: tokens.colors.surface },
      text: { value: tokens.colors.text },
      textSecondary: { value: tokens.colors.textSecondary },
      border: { value: tokens.colors.border },
      success: { value: tokens.colors.success },
      warning: { value: tokens.colors.warning },
      error: { value: tokens.colors.error },
    },
    typography: {
      fontFamily: {
        heading: { value: tokens.typography.headingFont },
        body: { value: tokens.typography.bodyFont },
        mono: { value: tokens.typography.monoFont },
      },
      fontSize: {
        base: { value: `${tokens.typography.baseSize}px` },
        ...Object.fromEntries(
          Object.entries(tokens.typography.scale).map(([k, v]) => [
            k,
            { value: `${v.size}px` },
          ])
        ),
      },
    },
    spacing: tokens.spacing.values,
    shadows: tokens.shadows,
    borderRadius: tokens.borderRadius,
  };
}

export function generateTailwindConfig(tokens: NormalizedTokens): string {
  const config = {
    theme: {
      extend: {
        colors: {
          primary: tokens.colors.primary,
          secondary: tokens.colors.secondary,
          accent: tokens.colors.accent,
          background: tokens.colors.background,
          surface: tokens.colors.surface,
          foreground: tokens.colors.text,
          muted: tokens.colors.textSecondary,
          border: tokens.colors.border,
          success: tokens.colors.success,
          warning: tokens.colors.warning,
          destructive: tokens.colors.error,
        },
        fontFamily: {
          heading: [`'${tokens.typography.headingFont}'`, 'sans-serif'],
          body: [`'${tokens.typography.bodyFont}'`, 'sans-serif'],
          mono: [`'${tokens.typography.monoFont}'`, 'monospace'],
        },
        fontSize: Object.fromEntries(
          Object.entries(tokens.typography.scale).map(([k, v]) => [
            k,
            [`${v.size}px`, { lineHeight: `${v.lineHeight}`, fontWeight: `${v.weight}` }],
          ])
        ),
        spacing: Object.fromEntries(
          Object.entries(tokens.spacing.values).map(([k, v]) => [k, `${v}px`])
        ),
        borderRadius: {
          sm: `${tokens.borderRadius.sm}px`,
          md: `${tokens.borderRadius.md}px`,
          lg: `${tokens.borderRadius.lg}px`,
          xl: `${tokens.borderRadius.xl}px`,
          full: `${tokens.borderRadius.full}px`,
        },
        boxShadow: tokens.shadows,
      },
    },
  };

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(config, null, 2)}`;
}
