import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getNestedValue } from '../services/tokenNormalizer';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tokens/:siteId — Get active tokens for a site
router.get('/:siteId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
      include: {
        lockedTokens: true,
        versionHistory: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!token) {
      res.status(404).json({ error: 'No tokens found for this site' });
      return;
    }

    res.json({
      id: token.id,
      siteId: token.siteId,
      colors: JSON.parse(token.colors),
      typography: JSON.parse(token.typography),
      spacing: JSON.parse(token.spacing),
      shadows: JSON.parse(token.shadows),
      borderRadius: JSON.parse(token.borderRadius),
      lockedPaths: token.lockedTokens.map((lt) => lt.tokenPath),
      versionHistory: token.versionHistory,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    });
  } catch (error: any) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tokens/:siteId — Update a token value
router.put('/:siteId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;
    const { path, value } = req.body;

    if (!path || value === undefined) {
      res.status(400).json({ error: 'path and value are required' });
      return;
    }

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
    });

    if (!token) {
      res.status(404).json({ error: 'No active tokens found' });
      return;
    }

    // Determine which JSON field to update
    const [category, ...rest] = path.split('.');
    const tokenPath = rest.join('.');

    const fieldMap: Record<string, string> = {
      colors: 'colors',
      typography: 'typography',
      spacing: 'spacing',
      shadows: 'shadows',
      borderRadius: 'borderRadius',
    };

    const field = fieldMap[category];
    if (!field) {
      res.status(400).json({ error: `Invalid token category: ${category}` });
      return;
    }

    const currentData = JSON.parse((token as any)[field]);
    const previousValue = getNestedValue(currentData, tokenPath);

    // Set the new value
    setDeepValue(currentData, tokenPath, value);

    // Update the database
    await prisma.designToken.update({
      where: { id: token.id },
      data: {
        [field]: JSON.stringify(currentData),
      },
    });

    // Record version history
    await prisma.versionHistory.create({
      data: {
        tokenId: token.id,
        tokenPath: path,
        previousValue: String(previousValue ?? ''),
        newValue: String(value),
        changeType: 'user_edit',
      },
    });

    res.json({
      success: true,
      path,
      previousValue,
      newValue: value,
    });
  } catch (error: any) {
    console.error('Update token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tokens/:siteId/lock — Lock a token
router.post('/:siteId/lock', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;
    const { path } = req.body;

    if (!path) {
      res.status(400).json({ error: 'path is required' });
      return;
    }

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
    });

    if (!token) {
      res.status(404).json({ error: 'No active tokens found' });
      return;
    }

    // Get the current value
    const [category, ...rest] = path.split('.');
    const currentData = JSON.parse((token as any)[category]);
    const currentValue = getNestedValue(currentData, rest.join('.'));

    if (currentValue === undefined) {
      res.status(400).json({ error: `Token path not found: ${path}` });
      return;
    }

    // Create or update locked token
    await prisma.lockedToken.upsert({
      where: {
        tokenId_tokenPath: {
          tokenId: token.id,
          tokenPath: path,
        },
      },
      create: {
        tokenId: token.id,
        tokenPath: path,
        lockedValue: String(currentValue),
      },
      update: {
        lockedValue: String(currentValue),
        lockedAt: new Date(),
      },
    });

    // Record version history
    await prisma.versionHistory.create({
      data: {
        tokenId: token.id,
        tokenPath: path,
        previousValue: '',
        newValue: String(currentValue),
        changeType: 'locked',
      },
    });

    res.json({ success: true, path, lockedValue: currentValue });
  } catch (error: any) {
    console.error('Lock token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tokens/:siteId/lock — Unlock a token
router.delete('/:siteId/lock', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;
    const { path } = req.body;

    if (!path) {
      res.status(400).json({ error: 'path is required' });
      return;
    }

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
    });

    if (!token) {
      res.status(404).json({ error: 'No active tokens found' });
      return;
    }

    await prisma.lockedToken.deleteMany({
      where: {
        tokenId: token.id,
        tokenPath: path,
      },
    });

    // Record version history
    await prisma.versionHistory.create({
      data: {
        tokenId: token.id,
        tokenPath: path,
        previousValue: '',
        newValue: '',
        changeType: 'unlocked',
      },
    });

    res.json({ success: true, path });
  } catch (error: any) {
    console.error('Unlock token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tokens/:siteId/history — Version history
router.get('/:siteId/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId } = req.params;

    const token = await prisma.designToken.findFirst({
      where: { siteId: siteId as string, isActive: true },
    });

    if (!token) {
      res.status(404).json({ error: 'No active tokens found' });
      return;
    }

    const history = await prisma.versionHistory.findMany({
      where: { tokenId: token.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(history);
  } catch (error: any) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function setDeepValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === undefined) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

export default router;
