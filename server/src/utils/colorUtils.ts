export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function parseRgbString(rgb: string): { r: number; g: number; b: number } | null {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

export function rgbStringToHex(rgb: string): string | null {
  const parsed = parseRgbString(rgb);
  if (!parsed) return null;
  return rgbToHex(parsed.r, parsed.g, parsed.b);
}

export function getColorLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getColorLuminance(hex1);
  const l2 = getColorLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function darkenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.max(0, Math.round(rgb.r * (1 - amount))),
    Math.max(0, Math.round(rgb.g * (1 - amount))),
    Math.max(0, Math.round(rgb.b * (1 - amount)))
  );
}

export function lightenColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  );
}

export function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return Infinity;
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  );
}

export function deduplicateColors(colors: string[], threshold = 30): string[] {
  const unique: string[] = [];
  for (const color of colors) {
    const isDuplicate = unique.some((existing) => colorDistance(color, existing) < threshold);
    if (!isDuplicate) {
      unique.push(color);
    }
  }
  return unique;
}

export function isNearWhite(hex: string): boolean {
  return getColorLuminance(hex) > 0.9;
}

export function isNearBlack(hex: string): boolean {
  return getColorLuminance(hex) < 0.05;
}

export function categorizeSaturation(hex: string): 'neutral' | 'muted' | 'vibrant' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'neutral';
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;
  if (saturation < 0.15) return 'neutral';
  if (saturation < 0.5) return 'muted';
  return 'vibrant';
}
