export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

export function parsePxValue(value: string): number | null {
  const match = value.match(/^([\d.]+)px$/);
  return match ? parseFloat(match[1]) : null;
}

export function parseRemValue(value: string, baseFontSize = 16): number | null {
  const match = value.match(/^([\d.]+)rem$/);
  return match ? parseFloat(match[1]) * baseFontSize : null;
}

export function parseNumericValue(value: string, baseFontSize = 16): number | null {
  const px = parsePxValue(value);
  if (px !== null) return px;
  const rem = parseRemValue(value, baseFontSize);
  if (rem !== null) return rem;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export function cleanFontFamily(fontFamily: string): string {
  return fontFamily
    .split(',')[0]
    .trim()
    .replace(/["']/g, '');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
