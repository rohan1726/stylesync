import Vibrant from 'node-vibrant';
import {
  rgbStringToHex,
  deduplicateColors,
  isNearWhite,
  isNearBlack,
  categorizeSaturation,
  getColorLuminance,
  hexToRgb,
  rgbToHex,
} from '../utils/colorUtils';

export interface ColorPalette {
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

export async function analyzeColors(
  cssColors: string[],
  imageUrls: string[]
): Promise<ColorPalette> {
  // Convert all CSS colors to hex
  const hexColors: string[] = [];
  for (const color of cssColors) {
    if (color.startsWith('#')) {
      const normalized =
        color.length === 4
          ? '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
          : color;
      hexColors.push(normalized.toLowerCase());
    } else {
      const hex = rgbStringToHex(color);
      if (hex) hexColors.push(hex.toLowerCase());
    }
  }

  // Extract colors from images
  const imageColors = await extractImageColors(imageUrls);
  const allColors = [...hexColors, ...imageColors];

  // Deduplicate
  const uniqueColors = deduplicateColors(allColors, 25);

  // Separate into categories
  const whites = uniqueColors.filter(isNearWhite);
  const blacks = uniqueColors.filter(isNearBlack);
  const vibrants = uniqueColors.filter(
    (c) => categorizeSaturation(c) === 'vibrant' && !isNearWhite(c) && !isNearBlack(c)
  );
  const muteds = uniqueColors.filter(
    (c) => categorizeSaturation(c) === 'muted' && !isNearWhite(c) && !isNearBlack(c)
  );
  const neutrals = uniqueColors.filter(
    (c) => categorizeSaturation(c) === 'neutral' && !isNearWhite(c) && !isNearBlack(c)
  );

  // Count frequency of colors for scoring
  const freq: Record<string, number> = {};
  for (const c of allColors) {
    const key = c.toLowerCase();
    freq[key] = (freq[key] || 0) + 1;
  }

  // Sort vibrants by frequency
  vibrants.sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
  muteds.sort((a, b) => (freq[b] || 0) - (freq[a] || 0));

  // Build palette
  const primary = vibrants[0] || muteds[0] || '#6366f1';
  const secondary = vibrants[1] || muteds[1] || shiftHue(primary, 60);
  const accent = vibrants[2] || muteds[2] || shiftHue(primary, 180);

  // Determine if site is dark or light themed
  const bgCandidates = [...whites, ...neutrals.filter((c) => getColorLuminance(c) > 0.7)];
  const background = bgCandidates[0] || '#ffffff';
  const isDarkTheme = getColorLuminance(background) < 0.5;

  const surface = isDarkTheme
    ? lightenHex(background, 0.1)
    : darkenHex(background, 0.03);

  const text = isDarkTheme
    ? whites[0] || '#e8e8f0'
    : blacks[0] || '#1a1a2e';

  const textSecondary = isDarkTheme
    ? neutrals.find((c) => getColorLuminance(c) > 0.3 && getColorLuminance(c) < 0.7) || '#8888a0'
    : neutrals.find((c) => getColorLuminance(c) > 0.2 && getColorLuminance(c) < 0.5) || '#6b7280';

  const border = isDarkTheme
    ? neutrals.find((c) => getColorLuminance(c) > 0.1 && getColorLuminance(c) < 0.3) || '#2a2a3e'
    : neutrals.find((c) => getColorLuminance(c) > 0.7 && getColorLuminance(c) < 0.9) || '#e5e7eb';

  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text,
    textSecondary,
    border,
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    neutrals: neutrals.slice(0, 5),
  };
}

async function extractImageColors(urls: string[]): Promise<string[]> {
  const colors: string[] = [];

  for (const url of urls.slice(0, 5)) {
    try {
      const palette = await Vibrant.from(url).getPalette();
      const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted,
      ];

      for (const swatch of swatches) {
        if (swatch) {
          const [r, g, b] = swatch.rgb;
          colors.push(rgbToHex(Math.round(r), Math.round(g), Math.round(b)));
        }
      }
    } catch (error) {
      console.warn(`Failed to extract colors from image: ${url}`);
    }
  }

  return colors;
}

function shiftHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const s = max === 0 ? 0 : (max - min) / max;
  const v = max;

  if (max !== min) {
    const d = max - min;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  h = ((h * 360 + degrees) % 360) / 360;

  const hi = Math.floor(h * 6);
  const f = h * 6 - hi;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let rr: number, gg: number, bb: number;
  switch (hi % 6) {
    case 0: rr = v; gg = t; bb = p; break;
    case 1: rr = q; gg = v; bb = p; break;
    case 2: rr = p; gg = v; bb = t; break;
    case 3: rr = p; gg = q; bb = v; break;
    case 4: rr = t; gg = p; bb = v; break;
    default: rr = v; gg = p; bb = q; break;
  }

  return rgbToHex(Math.round(rr * 255), Math.round(gg * 255), Math.round(bb * 255));
}

function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  );
}

function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.max(0, Math.round(rgb.r * (1 - amount))),
    Math.max(0, Math.round(rgb.g * (1 - amount))),
    Math.max(0, Math.round(rgb.b * (1 - amount)))
  );
}
