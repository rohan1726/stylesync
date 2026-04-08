import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { scrapeWithFallback } from '../services/scraper';
import { analyzeColors } from '../services/colorAnalyzer';
import { analyzeTypography } from '../services/typographyAnalyzer';
import {
  analyzeSpacing,
  analyzeShadows,
  analyzeBorderRadius,
} from '../services/spacingAnalyzer';
import {
  mergeWithLockedTokens,
  NormalizedTokens,
  LockedTokenMap,
} from '../services/tokenNormalizer';
import { isValidUrl, normalizeUrl } from '../utils/validators';

const router = Router();
const prisma = new PrismaClient();

// POST /api/scrape — Submit a URL for analysis
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    url = normalizeUrl(url);

    if (!isValidUrl(url)) {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    // Create site record
    const site = await prisma.scrapedSite.create({
      data: {
        url,
        extractionStatus: 'processing',
      },
    });

    // Start extraction (non-blocking response)
    res.status(202).json({
      siteId: site.id,
      status: 'processing',
      message: 'Extraction started. Poll /api/scrape/:siteId/status for updates.',
    });

    // Run extraction in background
    performExtraction(site.id, url).catch((err) => {
      console.error(`Extraction failed for ${url}:`, err);
    });
  } catch (error: any) {
    console.error('Scrape endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function performExtraction(siteId: string, url: string): Promise<void> {
  try {
    // Scrape the website
    const scrapedData = await scrapeWithFallback(url);

    // Analyze colors
    const colors = await analyzeColors(scrapedData.colors, scrapedData.imageUrls);

    // Analyze typography
    const typography = analyzeTypography(scrapedData.typography);

    // Analyze spacing
    const spacing = analyzeSpacing(scrapedData.spacing);
    const shadows = analyzeShadows(scrapedData.shadows);
    const borderRadius = analyzeBorderRadius(scrapedData.borderRadii);

    const tokens: NormalizedTokens = {
      colors,
      typography,
      spacing,
      shadows,
      borderRadius,
    };

    // Check for existing locked tokens
    const existingToken = await prisma.designToken.findFirst({
      where: { siteId, isActive: true },
      include: { lockedTokens: true },
    });

    let finalTokens = tokens;
    if (existingToken && existingToken.lockedTokens.length > 0) {
      const lockedMap: LockedTokenMap = {};
      for (const lt of existingToken.lockedTokens) {
        lockedMap[lt.tokenPath] = lt.lockedValue;
      }
      finalTokens = mergeWithLockedTokens(tokens, lockedMap);

      // Deactivate old token
      await prisma.designToken.update({
        where: { id: existingToken.id },
        data: { isActive: false },
      });
    }

    // Save tokens
    await prisma.designToken.create({
      data: {
        siteId,
        colors: JSON.stringify(finalTokens.colors),
        typography: JSON.stringify(finalTokens.typography),
        spacing: JSON.stringify(finalTokens.spacing),
        shadows: JSON.stringify(finalTokens.shadows),
        borderRadius: JSON.stringify(finalTokens.borderRadius),
        isActive: true,
      },
    });

    // Update site status
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: {
        extractionStatus: 'completed',
        rawHtml: scrapedData.title, // Store title instead of full HTML for space
      },
    });
  } catch (error: any) {
    console.error(`Extraction error for site ${siteId}:`, error);
    await prisma.scrapedSite.update({
      where: { id: siteId },
      data: {
        extractionStatus: 'failed',
        errorMessage: error.message || 'Unknown error during extraction',
      },
    });
  }
}

// GET /api/scrape/:siteId/status
router.get('/:siteId/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;

    const site = await prisma.scrapedSite.findUnique({
      where: { id: siteId as string },
      include: {
        designTokens: {
          where: { isActive: true },
          include: { lockedTokens: true },
        },
      },
    });

    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const activeToken = site.designTokens[0];

    res.json({
      siteId: site.id,
      url: site.url,
      status: site.extractionStatus,
      errorMessage: site.errorMessage,
      title: site.rawHtml || '',
      tokens: activeToken
        ? {
            id: activeToken.id,
            colors: JSON.parse(activeToken.colors),
            typography: JSON.parse(activeToken.typography),
            spacing: JSON.parse(activeToken.spacing),
            shadows: JSON.parse(activeToken.shadows),
            borderRadius: JSON.parse(activeToken.borderRadius),
            lockedPaths: activeToken.lockedTokens.map((lt) => lt.tokenPath),
          }
        : null,
      createdAt: site.createdAt,
    });
  } catch (error: any) {
    console.error('Status endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
