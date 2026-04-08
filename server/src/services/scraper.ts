import { chromium, Browser, Page } from 'playwright';
import { rgbStringToHex } from '../utils/colorUtils';
import { cleanFontFamily, parseNumericValue } from '../utils/validators';

export interface ScrapedData {
  colors: string[];
  cssVariables: Record<string, string>;
  typography: TypographyData[];
  spacing: number[];
  shadows: string[];
  borderRadii: number[];
  imageUrls: string[];
  title: string;
  favicon: string;
}

export interface TypographyData {
  element: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
}

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for any animations/JS to settle
    await page.waitForTimeout(2000);

    const scrapedData = await page.evaluate(() => {
      const colors: string[] = [];
      const cssVariables: Record<string, string> = {};
      const typography: Array<{
        element: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        lineHeight: string;
        letterSpacing: string;
        color: string;
      }> = [];
      const spacingValues: number[] = [];
      const shadows: string[] = [];
      const borderRadii: number[] = [];
      const imageUrls: string[] = [];

      // Extract CSS custom properties from stylesheets
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
                const style = rule.style;
                for (let i = 0; i < style.length; i++) {
                  const prop = style[i];
                  if (prop.startsWith('--')) {
                    cssVariables[prop] = style.getPropertyValue(prop).trim();
                  }
                }
              }
            }
          } catch {
            // CORS - can't read cross-origin stylesheets
          }
        }
      } catch {
        // stylesheet access error
      }

      // Extract computed styles from key elements
      const selectors = [
        'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a',
        'button', 'input', 'nav', 'header', 'footer', 'main',
        '.btn', '.button', '[class*="btn"]', '[class*="button"]',
        '[class*="card"]', '[class*="hero"]', '[class*="nav"]',
      ];

      const processedElements = new Set<Element>();

      for (const sel of selectors) {
        try {
          const elements = document.querySelectorAll(sel);
          for (const el of Array.from(elements).slice(0, 5)) {
            if (processedElements.has(el)) continue;
            processedElements.add(el);

            const computed = window.getComputedStyle(el);

            // Colors
            const colorProps = [
              'color',
              'backgroundColor',
              'borderColor',
              'borderTopColor',
              'outlineColor',
            ];
            for (const prop of colorProps) {
              const val = computed.getPropertyValue(
                prop.replace(/([A-Z])/g, '-$1').toLowerCase()
              );
              if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
                colors.push(val);
              }
            }

            // Typography (only for text elements)
            const tagName = el.tagName.toLowerCase();
            if (['h1','h2','h3','h4','h5','h6','p','a','span','button','label','li'].includes(tagName)) {
              typography.push({
                element: tagName,
                fontFamily: computed.fontFamily,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight,
                lineHeight: computed.lineHeight,
                letterSpacing: computed.letterSpacing,
                color: computed.color,
              });
            }

            // Spacing
            const spacingProps = [
              'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
              'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
              'gap', 'rowGap', 'columnGap',
            ];
            for (const prop of spacingProps) {
              const val = computed.getPropertyValue(
                prop.replace(/([A-Z])/g, '-$1').toLowerCase()
              );
              const num = parseFloat(val);
              if (!isNaN(num) && num > 0 && num < 200) {
                spacingValues.push(Math.round(num));
              }
            }

            // Shadows
            const shadow = computed.boxShadow;
            if (shadow && shadow !== 'none') {
              shadows.push(shadow);
            }

            // Border radius
            const radius = parseFloat(computed.borderRadius);
            if (!isNaN(radius) && radius > 0) {
              borderRadii.push(Math.round(radius));
            }
          }
        } catch {
          // selector error
        }
      }

      // Extract image URLs
      const imgElements = document.querySelectorAll('img');
      for (const img of Array.from(imgElements).slice(0, 10)) {
        if (img.src && img.naturalWidth > 50 && img.naturalHeight > 50) {
          imageUrls.push(img.src);
        }
      }

      // Also check OG image
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        const content = ogImage.getAttribute('content');
        if (content) imageUrls.unshift(content);
      }

      // Favicon
      const faviconEl =
        document.querySelector('link[rel="icon"]') ||
        document.querySelector('link[rel="shortcut icon"]');
      const favicon = faviconEl?.getAttribute('href') || '/favicon.ico';

      return {
        colors,
        cssVariables,
        typography,
        spacing: spacingValues,
        shadows,
        borderRadii,
        imageUrls,
        title: document.title || '',
        favicon,
      };
    });

    // Resolve relative image URLs
    const resolvedImageUrls = scrapedData.imageUrls.map((imgUrl) => {
      try {
        return new URL(imgUrl, url).href;
      } catch {
        return imgUrl;
      }
    });

    const resolvedFavicon = (() => {
      try {
        return new URL(scrapedData.favicon, url).href;
      } catch {
        return scrapedData.favicon;
      }
    })();

    return {
      ...scrapedData,
      imageUrls: resolvedImageUrls,
      favicon: resolvedFavicon,
    };
  } catch (error: any) {
    throw new Error(`Scraping failed: ${error.message}`);
  } finally {
    await context.close();
  }
}

export async function scrapeWithFallback(url: string): Promise<ScrapedData> {
  try {
    return await scrapeWebsite(url);
  } catch (error: any) {
    console.warn(`Playwright scraping failed for ${url}: ${error.message}`);
    console.warn('Attempting static HTML fallback...');
    return await scrapeStatic(url);
  }
}

async function scrapeStatic(url: string): Promise<ScrapedData> {
  // Fallback: fetch raw HTML and parse with cheerio-like approach
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  // Extract colors from inline styles and style tags
  const colorRegex = /#([0-9a-fA-F]{3,8})\b/g;
  const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
  const colors: string[] = [];

  let match;
  while ((match = colorRegex.exec(html)) !== null) {
    const hex = match[0];
    if (hex.length === 4 || hex.length === 7) {
      colors.push(hex);
    }
  }
  while ((match = rgbRegex.exec(html)) !== null) {
    colors.push(match[0] + ')');
  }

  // Extract image URLs
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const imageUrls: string[] = [];
  while ((match = imgRegex.exec(html)) !== null) {
    try {
      imageUrls.push(new URL(match[1], url).href);
    } catch {}
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  return {
    colors,
    cssVariables: {},
    typography: [],
    spacing: [],
    shadows: [],
    borderRadii: [],
    imageUrls: imageUrls.slice(0, 10),
    title: titleMatch?.[1]?.trim() || '',
    favicon: new URL('/favicon.ico', url).href,
  };
}
