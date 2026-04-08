import { TypographyData } from './scraper';
import { cleanFontFamily, parseNumericValue } from '../utils/validators';

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSize: number;
  scaleRatio: number;
  weights: number[];
  lineHeights: Record<string, number>;
  letterSpacing: Record<string, string>;
  scale: Record<string, { size: number; weight: number; lineHeight: number }>;
}

export function analyzeTypography(data: TypographyData[]): TypographyTokens {
  // Group by element type
  const groups: Record<string, TypographyData[]> = {};
  for (const item of data) {
    if (!groups[item.element]) groups[item.element] = [];
    groups[item.element].push(item);
  }

  // Extract unique font families
  const fontFrequency: Record<string, number> = {};
  for (const item of data) {
    const family = cleanFontFamily(item.fontFamily);
    if (family && family !== 'serif' && family !== 'sans-serif') {
      fontFrequency[family] = (fontFrequency[family] || 0) + 1;
    }
  }

  // Heading font = font most used in h1-h6
  const headingElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headingFonts: Record<string, number> = {};
  for (const tag of headingElements) {
    if (groups[tag]) {
      for (const item of groups[tag]) {
        const family = cleanFontFamily(item.fontFamily);
        headingFonts[family] = (headingFonts[family] || 0) + 1;
      }
    }
  }

  // Body font = font most used in p, span, a, li
  const bodyElements = ['p', 'span', 'a', 'li', 'label'];
  const bodyFonts: Record<string, number> = {};
  for (const tag of bodyElements) {
    if (groups[tag]) {
      for (const item of groups[tag]) {
        const family = cleanFontFamily(item.fontFamily);
        bodyFonts[family] = (bodyFonts[family] || 0) + 1;
      }
    }
  }

  const sortedHeadingFonts = Object.entries(headingFonts).sort((a, b) => b[1] - a[1]);
  const sortedBodyFonts = Object.entries(bodyFonts).sort((a, b) => b[1] - a[1]);
  const sortedAllFonts = Object.entries(fontFrequency).sort((a, b) => b[1] - a[1]);

  const headingFont =
    sortedHeadingFonts[0]?.[0] || sortedAllFonts[0]?.[0] || 'Inter';
  const bodyFont =
    sortedBodyFonts[0]?.[0] || sortedAllFonts[1]?.[0] || sortedAllFonts[0]?.[0] || 'Inter';

  // Extract sizes
  const sizesByElement: Record<string, number[]> = {};
  for (const item of data) {
    const size = parseNumericValue(item.fontSize);
    if (size) {
      if (!sizesByElement[item.element]) sizesByElement[item.element] = [];
      sizesByElement[item.element].push(size);
    }
  }

  // Calculate base font size (most common body text size)
  const bodySizes = [
    ...(sizesByElement['p'] || []),
    ...(sizesByElement['span'] || []),
    ...(sizesByElement['a'] || []),
  ];
  const baseSize = bodySizes.length > 0 ? median(bodySizes) : 16;

  // Calculate scale ratio from heading hierarchy
  const headingSizes: Record<string, number> = {};
  for (const tag of headingElements) {
    if (sizesByElement[tag]) {
      headingSizes[tag] = median(sizesByElement[tag]);
    }
  }

  // Estimate scale ratio
  let scaleRatio = 1.25; // default: Major Third
  if (headingSizes['h1'] && baseSize) {
    const ratio = headingSizes['h1'] / baseSize;
    // Find the closest ratio step (assume h1 is ~4 steps above base)
    scaleRatio = Math.pow(ratio, 1 / 4);
    scaleRatio = Math.max(1.1, Math.min(1.5, scaleRatio)); // clamp
  }

  // Extract unique weights
  const weightSet = new Set<number>();
  for (const item of data) {
    const w = parseInt(item.fontWeight);
    if (!isNaN(w)) weightSet.add(w);
  }
  const weights = Array.from(weightSet).sort((a, b) => a - b);
  if (weights.length === 0) weights.push(400, 500, 600, 700);

  // Line heights
  const lineHeights: Record<string, number> = {};
  for (const item of data) {
    const lh = parseNumericValue(item.lineHeight);
    const fs = parseNumericValue(item.fontSize);
    if (lh && fs) {
      const ratio = lh / fs;
      if (ratio > 0.8 && ratio < 3) {
        lineHeights[item.element] = Math.round(ratio * 100) / 100;
      }
    }
  }

  // Build type scale
  const scale: Record<string, { size: number; weight: number; lineHeight: number }> = {
    h1: {
      size: headingSizes['h1'] || Math.round(baseSize * Math.pow(scaleRatio, 4)),
      weight: extractPreferredWeight(groups['h1']) || 700,
      lineHeight: lineHeights['h1'] || 1.2,
    },
    h2: {
      size: headingSizes['h2'] || Math.round(baseSize * Math.pow(scaleRatio, 3)),
      weight: extractPreferredWeight(groups['h2']) || 700,
      lineHeight: lineHeights['h2'] || 1.25,
    },
    h3: {
      size: headingSizes['h3'] || Math.round(baseSize * Math.pow(scaleRatio, 2)),
      weight: extractPreferredWeight(groups['h3']) || 600,
      lineHeight: lineHeights['h3'] || 1.3,
    },
    h4: {
      size: headingSizes['h4'] || Math.round(baseSize * Math.pow(scaleRatio, 1)),
      weight: extractPreferredWeight(groups['h4']) || 600,
      lineHeight: lineHeights['h4'] || 1.35,
    },
    h5: {
      size: headingSizes['h5'] || Math.round(baseSize * Math.pow(scaleRatio, 0.5)),
      weight: extractPreferredWeight(groups['h5']) || 600,
      lineHeight: lineHeights['h5'] || 1.4,
    },
    h6: {
      size: headingSizes['h6'] || baseSize,
      weight: extractPreferredWeight(groups['h6']) || 600,
      lineHeight: lineHeights['h6'] || 1.4,
    },
    body: {
      size: baseSize,
      weight: 400,
      lineHeight: lineHeights['p'] || 1.6,
    },
    caption: {
      size: Math.round(baseSize * 0.85),
      weight: 400,
      lineHeight: 1.4,
    },
  };

  return {
    headingFont,
    bodyFont,
    monoFont: 'JetBrains Mono',
    baseSize,
    scaleRatio: Math.round(scaleRatio * 1000) / 1000,
    weights,
    lineHeights,
    letterSpacing: {
      tight: '-0.02em',
      normal: '0em',
      wide: '0.05em',
    },
    scale,
  };
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function extractPreferredWeight(items?: TypographyData[]): number | null {
  if (!items || items.length === 0) return null;
  const weights = items.map((i) => parseInt(i.fontWeight)).filter((w) => !isNaN(w));
  return weights.length > 0 ? median(weights) : null;
}
