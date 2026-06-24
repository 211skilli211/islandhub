import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface VideoGenerationRequest {
  type: 'product_showcase' | 'service_explainer' | 'listing_announcement' | 'custom';
  title: string;
  subtitle?: string;
  images: string[]; // URLs or local paths
  durationSec?: number;
  music?: string;
  branding?: {
    primaryColor?: string;
    logo?: string;
    fontFamily?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface VideoGenerationResult {
  success: boolean;
  outputPath?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  renderId?: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  type: VideoGenerationRequest['type'];
  defaults: Partial<VideoGenerationRequest>;
  requiredFields: string[];
}

const REMOTION_PROJECT_PATH = process.env.REMOTION_PROJECT_PATH || '/opt/remotion-studio';
const REMOTION_OUTPUT_PATH = process.env.REMOTION_OUTPUT_PATH || '/tmp/remotion-output';
const REMOTION_RENDER_TIMEOUT = parseInt(process.env.REMOTION_RENDER_TIMEOUT || '120000');

export class RemotionService {
  private templates: Map<string, VideoTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: VideoTemplate[] = [
      {
        id: 'product_showcase',
        name: 'Product Showcase',
        description: 'E-commerce product images with zoom, pan, and text overlay',
        type: 'product_showcase',
        defaults: { durationSec: 15, subtitle: 'Available now' },
        requiredFields: ['title', 'images'],
      },
      {
        id: 'service_explainer',
        name: 'Service Explainer',
        description: 'Animated service description with icon highlights',
        type: 'service_explainer',
        defaults: { durationSec: 30 },
        requiredFields: ['title'],
      },
      {
        id: 'listing_announcement',
        name: 'New Listing Announcement',
        description: 'Eye-catching announcement for new marketplace listings',
        type: 'listing_announcement',
        defaults: { durationSec: 10, subtitle: 'Just listed!' },
        requiredFields: ['title', 'images'],
      },
      {
        id: 'custom',
        name: 'Custom Video',
        description: 'Fully customizable video from Remotion component',
        type: 'custom',
        defaults: { durationSec: 15 },
        requiredFields: ['title'],
      },
    ];

    templates.forEach(t => this.templates.set(t.id, t));
  }

  getTemplates(): VideoTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): VideoTemplate | undefined {
    return this.templates.get(id);
  }

  async ensureRemotionProject(): Promise<boolean> {
    try {
      const projectDir = path.dirname(REMOTION_PROJECT_PATH);
      await fs.mkdir(projectDir, { recursive: true });

      const pkgJsonPath = path.join(REMOTION_PROJECT_PATH, 'package.json');
      try {
        await fs.access(pkgJsonPath);
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const startTime = Date.now();

    try {
      const validationError = this.validateRequest(request);
      if (validationError) {
        return { success: false, error: validationError };
      }

      await fs.mkdir(REMOTION_OUTPUT_PATH, { recursive: true });

      const renderId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const outputPath = path.join(REMOTION_OUTPUT_PATH, `${renderId}.mp4`);

      const componentName = this.getComponentName(request.type);
      const inputProps = JSON.stringify(this.buildInputProps(request));

      const renderCommand = this.buildRenderCommand(
        componentName,
        inputProps,
        outputPath,
        request.durationSec || 15
      );

      const { stdout, stderr } = await execAsync(renderCommand, {
        cwd: REMOTION_PROJECT_PATH,
        timeout: REMOTION_RENDER_TIMEOUT,
        maxBuffer: 10 * 1024 * 1024,
      });

      if (stderr && !stderr.includes('Warning')) {
        console.warn('[RemotionService] Render stderr:', stderr);
      }

      const outputStats = await fs.stat(outputPath);
      const duration = Date.now() - startTime;

      return {
        success: true,
        outputPath,
        duration: duration,
        fileSize: outputStats.size,
        renderId,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message || 'Video generation failed',
        duration,
      };
    }
  }

  async renderVideo(
    componentName: string,
    inputProps: Record<string, unknown>,
    outputPath: string
  ): Promise<VideoGenerationResult> {
    const startTime = Date.now();

    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      const renderCommand = this.buildRenderCommand(
        componentName,
        JSON.stringify(inputProps),
        outputPath,
        15
      );

      await execAsync(renderCommand, {
        cwd: REMOTION_PROJECT_PATH,
        timeout: REMOTION_RENDER_TIMEOUT,
        maxBuffer: 10 * 1024 * 1024,
      });

      const outputStats = await fs.stat(outputPath);

      return {
        success: true,
        outputPath,
        duration: Date.now() - startTime,
        fileSize: outputStats.size,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Render failed',
        duration: Date.now() - startTime,
      };
    }
  }

  async getRenderStatus(renderId: string): Promise<{ status: string; progress?: number }> {
    try {
      const outputPath = path.join(REMOTION_OUTPUT_PATH, `${renderId}.mp4`);
      await fs.access(outputPath);
      return { status: 'complete', progress: 100 };
    } catch {
      return { status: 'rendering', progress: 50 };
    }
  }

  async deleteVideo(renderId: string): Promise<boolean> {
    try {
      const outputPath = path.join(REMOTION_OUTPUT_PATH, `${renderId}.mp4`);
      await fs.unlink(outputPath);
      return true;
    } catch {
      return false;
    }
  }

  async uploadToCDN(renderId: string): Promise<string | null> {
    const outputPath = path.join(REMOTION_OUTPUT_PATH, `${renderId}.mp4`);
    try {
      await fs.access(outputPath);
      return outputPath;
    } catch {
      return null;
    }
  }

  private validateRequest(request: VideoGenerationRequest): string | null {
    if (!request.title || request.title.trim().length === 0) {
      return 'Title is required';
    }

    if (request.type !== 'service_explainer' && (!request.images || request.images.length === 0)) {
      return 'At least one image is required for this video type';
    }

    if (request.durationSec && (request.durationSec < 1 || request.durationSec > 300)) {
      return 'Duration must be between 1 and 300 seconds';
    }

    return null;
  }

  private getComponentName(type: VideoGenerationRequest['type']): string {
    const map: Record<string, string> = {
      product_showcase: 'ProductShowcase',
      service_explainer: 'ServiceExplainer',
      listing_announcement: 'ListingAnnouncement',
      custom: 'CustomVideo',
    };
    return map[type] || 'ProductShowcase';
  }

  private buildInputProps(request: VideoGenerationRequest): Record<string, unknown> {
    return {
      title: request.title,
      subtitle: request.subtitle || '',
      images: request.images,
      durationSec: request.durationSec || 15,
      branding: {
        primaryColor: request.branding?.primaryColor || '#0ea5e9',
        logo: request.branding?.logo || '',
        fontFamily: request.branding?.fontFamily || 'Inter',
      },
      metadata: request.metadata || {},
    };
  }

  private buildRenderCommand(
    componentName: string,
    inputProps: string,
    outputPath: string,
    durationSec: number
  ): string {
    const frames = durationSec * 30;
    return [
      'npx remotion render',
      `--props='${inputProps}'`,
      `--frames=0-${frames}`,
      `--image-format=jpeg`,
      componentName,
      `"${outputPath}"`,
    ].join(' ');
  }

  async generateComponentCode(request: VideoGenerationRequest): Promise<string> {
    const componentName = this.getComponentName(request.type);

    switch (request.type) {
      case 'product_showcase':
        return this.generateProductShowcaseCode(componentName, request);
      case 'service_explainer':
        return this.generateServiceExplainerCode(componentName, request);
      case 'listing_announcement':
        return this.generateListingAnnouncementCode(componentName, request);
      default:
        return this.generateCustomVideoCode(componentName, request);
    }
  }

  private generateProductShowcaseCode(name: string, req: VideoGenerationRequest): string {
    const images = req.images.map(img => `'${img}'`).join(', ');
    const primaryColor = req.branding?.primaryColor || '#0ea5e9';
    const frames = (req.durationSec || 15) * 30;

    return `import { Composition, useCurrentFrame, interpolate, Img } from 'remotion';
import { spring } from 'remotion';

export const ${name} = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, config: { damping: 200 } });

  const images = [${images}];
  const currentImageIndex = Math.floor(frame / 45) % images.length;
  const currentImage = images[currentImageIndex];

  return (
    <Composition
      id="${name}"
      durationInFrames={${frames}}
      fps={30}
      width={1080}
      height={1920}
    >
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a 0%, ${primaryColor}33 100%)', opacity, transform: \`scale(\${scale})\` }}>
        <Img
          src={currentImage}
          style={{ width: '100%', height: '70%', objectFit: 'cover' }}
        />
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px' }}>${req.title}</h1>
          ${req.subtitle ? `<p style={{ fontSize: '28px', opacity: 0.8 }}>${req.subtitle}</p>` : ''}
        </div>
      </div>
    </Composition>
  );
};`;
  }

  private generateServiceExplainerCode(name: string, req: VideoGenerationRequest): string {
    const frames = (req.durationSec || 30) * 30;

    return `import { Composition, useCurrentFrame, interpolate, spring, Sequence } from 'remotion';

export const ${name} = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 30], [50, 0], { extrapolateRight: 'clamp' });

  return (
    <Composition
      id="${name}"
      durationInFrames={${frames}}
      fps={30}
      width={1080}
      height={1920}
    >
      <div style={{ flex: 1, background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <h1
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            opacity: titleOpacity,
            transform: \`translateY(\${titleY}px)\`,
          }}
        >
          ${req.title}
        </h1>
        ${req.subtitle ? `
        <p style={{ fontSize: '32px', color: '#94a3b8', marginTop: '24px', textAlign: 'center' }}>
          ${req.subtitle}
        </p>` : ''}
      </div>
    </Composition>
  );
};`;
  }

  private generateListingAnnouncementCode(name: string, req: VideoGenerationRequest): string {
    const images = req.images.map(img => `'${img}'`).join(', ');
    const frames = (req.durationSec || 10) * 30;

    return `import { Composition, useCurrentFrame, interpolate, Img } from 'remotion';

export const ${name} = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 60], [1.2, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const images = [${images}];
  const imgIndex = Math.min(Math.floor(frame / 30), images.length - 1);

  return (
    <Composition
      id="${name}"
      durationInFrames={${frames}}
      fps={30}
      width={1080}
      height={1920}
    >
      <div style={{ flex: 1, position: 'relative', opacity }}>
        <Img
          src={images[imgIndex]}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: \`scale(\${scale})\` }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 40px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
          <p style={{ fontSize: '24px', color: '#fbbf24', fontWeight: 600 }}>${req.subtitle || 'Just listed!'}</p>
          <h2 style={{ fontSize: '44px', color: 'white', fontWeight: 800, marginTop: '8px' }}>${req.title}</h2>
        </div>
      </div>
    </Composition>
  );
};`;
  }

  private generateCustomVideoCode(name: string, req: VideoGenerationRequest): string {
    const frames = (req.durationSec || 15) * 30;

    return `import { Composition, useCurrentFrame, interpolate } from 'remotion';

export const ${name} = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <Composition
      id="${name}"
      durationInFrames={${frames}}
      fps={30}
      width={1080}
      height={1920}
    >
      <div style={{ flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity }}>
        <h1 style={{ fontSize: '48px', color: 'white', fontWeight: 800, textAlign: 'center' }}>
          ${req.title}
        </h1>
      </div>
    </Composition>
  );
};`;
  }
}

export const remotionService = new RemotionService();
