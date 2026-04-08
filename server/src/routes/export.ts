import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  generateCSSVariables,
  generateJSONTokens,
  generateTailwindConfig,
  NormalizedTokens,
} from '../services/tokenNormalizer';

const router = Router();
const prisma = new PrismaClient();

// GET /api/export/:siteId?format=css|json|tailwind
router.get('/:siteId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;
    const format = (req.query.format as string) || 'css';

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
    });

    if (!token) {
      res.status(404).json({ error: 'No active tokens found for this site' });
      return;
    }

    const tokens: NormalizedTokens = {
      colors: JSON.parse(token.colors),
      typography: JSON.parse(token.typography),
      spacing: JSON.parse(token.spacing),
      shadows: JSON.parse(token.shadows),
      borderRadius: JSON.parse(token.borderRadius),
    };

    switch (format) {
      case 'css': {
        const css = generateCSSVariables(tokens);
        res.setHeader('Content-Type', 'text/css');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="design-tokens.css"'
        );
        res.send(css);
        break;
      }
      case 'json': {
        const json = generateJSONTokens(tokens);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="design-tokens.json"'
        );
        res.json(json);
        break;
      }
      case 'tailwind': {
        const config = generateTailwindConfig(tokens);
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="tailwind.config.js"'
        );
        res.send(config);
        break;
      }
      default:
        res.status(400).json({ error: 'Invalid format. Use css, json, or tailwind.' });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
