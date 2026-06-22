interface HiggsfieldGenerateParams {
  prompt: string;
  aspect_ratio?: string;
  model?: string;
}

interface HiggsfieldResult {
  image_url: string;
  job_id?: string;
}

let client: HiggsfieldClient | null = null;

class HiggsfieldClient {
  private apiKey: string;
  private baseUrl = 'https://api.higgsfield.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: HiggsfieldGenerateParams): Promise<HiggsfieldResult> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio || '16:9',
        model: params.model || 'gpt_image_2',
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Higgsfield API error: ${response.status} ${body}`);
    }

    const data = await response.json();
    return {
      image_url: data.image_url || data.output?.[0]?.url || data.url,
      job_id: data.job_id || data.id,
    };
  }
}

export function getHiggsfieldClient(): HiggsfieldClient {
  if (!client) {
    const apiKey = process.env.HIGGSFIELD_API_KEY;
    if (!apiKey) {
      const err: any = new Error('HIGGSFIELD_API_KEY not set in environment');
      err.code = 'HIGGSFIELD_NOT_CONFIGURED';
      throw err;
    }
    client = new HiggsfieldClient(apiKey);
  }
  return client;
}
