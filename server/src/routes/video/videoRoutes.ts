import { Router, Request, Response } from 'express';
import { remotionService, VideoGenerationRequest } from '../../services/remotion/remotionService';

const router = Router();

// GET /api/video/templates — list available video templates
router.get('/templates', (req: Request, res: Response) => {
  const templates = remotionService.getTemplates();
  res.json({ success: true, templates });
});

// POST /api/video/generate — generate a video
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const request: VideoGenerationRequest = req.body;

    if (!request.type || !request.title) {
      res.status(400).json({ success: false, error: 'type and title are required' });
      return;
    }

    const result = await remotionService.generateVideo(request);

    if (result.success) {
      res.json({
        success: true,
        renderId: result.renderId,
        outputPath: result.outputPath,
        fileSize: result.fileSize,
        duration: result.duration,
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Video generation failed' });
  }
});

// GET /api/video/status/:renderId — check render status
router.get('/status/:renderId', async (req: Request, res: Response) => {
  try {
    const { renderId } = req.params;
    const status = await remotionService.getRenderStatus(renderId);
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/video/download/:renderId — download rendered video
router.get('/download/:renderId', async (req: Request, res: Response) => {
  try {
    const { renderId } = req.params;
    const outputPath = `/tmp/remotion-output/${renderId}.mp4`;

    res.download(outputPath, `video-${renderId}.mp4`);
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Video not found' });
  }
});

// DELETE /api/video/:renderId — delete rendered video
router.delete('/:renderId', async (req: Request, res: Response) => {
  try {
    const { renderId } = req.params;
    const deleted = await remotionService.deleteVideo(renderId);

    if (deleted) {
      res.json({ success: true, message: 'Video deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Video not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/video/component/generate — generate component code (preview)
router.post('/component/generate', async (req: Request, res: Response) => {
  try {
    const request: VideoGenerationRequest = req.body;

    if (!request.type || !request.title) {
      res.status(400).json({ success: false, error: 'type and title are required' });
      return;
    }

    const code = await remotionService.generateComponentCode(request);
    res.json({ success: true, code });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
