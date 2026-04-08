export interface SpacingTokens {
  unit: number;
  scale: number[];
  values: Record<string, number>;
}

export function analyzeSpacing(spacingValues: number[]): SpacingTokens {
  if (spacingValues.length === 0) {
    return defaultSpacing();
  }

  // Analyze spacing values to determine base unit
  const frequency: Record<number, number> = {};
  for (const val of spacingValues) {
    frequency[val] = (frequency[val] || 0) + 1;
  }

  // Check if values cluster around multiples of 4 or 8
  const mod4Count = spacingValues.filter((v) => v % 4 === 0).length;
  const mod8Count = spacingValues.filter((v) => v % 8 === 0).length;

  let unit: number;
  if (mod8Count > spacingValues.length * 0.6) {
    unit = 8;
  } else if (mod4Count > spacingValues.length * 0.5) {
    unit = 4;
  } else {
    unit = 4; // default to 4px base
  }

  // Build a scale from the detected unit
  const scale = buildScale(unit, spacingValues);

  // Named spacing values
  const values: Record<string, number> = {
    '2xs': scale[0] || unit * 0.5,
    xs: scale[1] || unit,
    sm: scale[2] || unit * 2,
    md: scale[3] || unit * 4,
    lg: scale[4] || unit * 6,
    xl: scale[5] || unit * 8,
    '2xl': scale[6] || unit * 12,
    '3xl': scale[7] || unit * 16,
  };

  return { unit, scale, values };
}

function buildScale(unit: number, values: number[]): number[] {
  // Standard multipliers
  const idealMultipliers = [0.5, 1, 2, 3, 4, 6, 8, 12, 16];
  const idealScale = idealMultipliers.map((m) => m * unit);

  // Try to match detected values to nearest scale step
  const uniqueValues = [...new Set(values)]
    .filter((v) => v > 0 && v <= 128)
    .sort((a, b) => a - b);

  if (uniqueValues.length < 3) {
    return idealScale;
  }

  // Use a mix: prefer detected values that are close to ideal
  const scale: number[] = [];
  for (const ideal of idealScale) {
    const closest = uniqueValues.find((v) => Math.abs(v - ideal) <= unit);
    scale.push(closest || ideal);
  }

  return [...new Set(scale)].sort((a, b) => a - b);
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export function analyzeShadows(shadows: string[]): ShadowTokens {
  if (shadows.length === 0) {
    return defaultShadows();
  }

  // Deduplicate shadows
  const unique = [...new Set(shadows)];

  // Sort by perceived "size" (rough heuristic based on blur radius)
  const parsed = unique
    .map((s) => ({
      raw: s,
      blurEstimate: estimateBlur(s),
    }))
    .sort((a, b) => a.blurEstimate - b.blurEstimate);

  return {
    sm: parsed[0]?.raw || defaultShadows().sm,
    md: parsed[Math.floor(parsed.length * 0.33)]?.raw || defaultShadows().md,
    lg: parsed[Math.floor(parsed.length * 0.66)]?.raw || defaultShadows().lg,
    xl: parsed[parsed.length - 1]?.raw || defaultShadows().xl,
  };
}

function estimateBlur(shadow: string): number {
  const match = shadow.match(/([\d.]+)px\s+([\d.]+)px\s+([\d.]+)px/);
  return match ? parseFloat(match[3]) : 0;
}

export interface BorderRadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export function analyzeBorderRadius(radii: number[]): BorderRadiusTokens {
  if (radii.length === 0) {
    return { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 };
  }

  const unique = [...new Set(radii)]
    .filter((r) => r < 9999)
    .sort((a, b) => a - b);

  return {
    sm: unique[0] || 4,
    md: unique[Math.floor(unique.length * 0.33)] || 8,
    lg: unique[Math.floor(unique.length * 0.66)] || 12,
    xl: unique[unique.length - 1] || 16,
    full: 9999,
  };
}

function defaultSpacing(): SpacingTokens {
  return {
    unit: 4,
    scale: [2, 4, 8, 12, 16, 24, 32, 48, 64],
    values: {
      '2xs': 2,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
    },
  };
}

function defaultShadows(): ShadowTokens {
  return {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  };
}
