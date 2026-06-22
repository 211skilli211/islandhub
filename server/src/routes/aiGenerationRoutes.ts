import { Router, Request, Response } from 'express';
import { getHiggsfieldClient } from '../services/higgsfieldService';

const router = Router();

/**
 * POST /api/admin/ai/generate-image
 * Generate an image using Higgsfield AI.
 * Body: { prompt: string, aspect_ratio?: string, style?: string, context?: string }
 * Returns: { image_url: string }
 */
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspect_ratio = '16:9', style = 'professional', context = 'general' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "prompt"' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ error: 'Prompt too long (max 2000 chars)' });
    }

    const stylePrefix = {
      professional: 'Professional marketing advertisement, clean design, high quality, ',
      tropical: 'Tropical Caribbean style, vibrant colors, island aesthetic, warm lighting, ',
      luxury: 'Premium luxury aesthetic, elegant, sophisticated, gold accents, ',
      minimalist: 'Minimalist design, clean lines, white space, modern, ',
      vibrant: 'Vivid saturated colors, energetic, eye-catching, dynamic composition, ',
      cinematic: 'Cinematic lighting, dramatic composition, film quality, 4K, ',
    }[style] || '';

    const contextSuffix = context === 'advertisement_banner'
      ? ', advertisement banner format, marketing creative, commercial quality'
      : ', high quality, detailed';

    const fullPrompt = `${stylePrefix}${prompt}${contextSuffix}`;

    const client = getHiggsfieldClient();
    const result = await client.generateImage({ prompt: fullPrompt, aspect_ratio });

    res.json({ image_url: result.image_url, prompt: fullPrompt });
  } catch (err: any) {
    console.error('[AI Generate Image] Error:', err.message);

    // Check if Higgsfield client is not configured
    if (err.code === 'HIGGSFIELD_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'Higgsfield AI is not configured',
        message: 'Set HIGGSFIELD_API_KEY in server environment to enable AI generation.',
        code: 'HIGGSFIELD_NOT_CONFIGURED',
      });
    }

    res.status(500).json({
      error: 'Image generation failed',
      message: err.message || 'Unknown error during AI generation',
    });
  }
});

export default router;
