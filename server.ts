import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { CaptionGenerateRequest } from './src/types/index.ts';
import {
  buildCaptionPrompt,
  parseGeneratedCaptionsResponse,
} from './src/utils/captionHelpers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_ID = 'gemini-4-hydrogen';

function extractErrorDetails(err: unknown): { status: number; message: string } {
  const errObj = typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : {};
  const rawMsg =
    typeof errObj.message === 'string'
      ? errObj.message
      : typeof err === 'string'
      ? err
      : 'Không thể tạo caption vào lúc này.';
  const rawStatus =
    typeof errObj.status === 'number'
      ? errObj.status
      : typeof errObj.code === 'number'
      ? errObj.code
      : 500;

  if (
    rawStatus === 403 ||
    rawStatus === 400 ||
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('PERMISSION_DENIED') ||
    rawMsg.toLowerCase().includes('api key')
  ) {
    return {
      status: 403,
      message:
        'Khóa GEMINI_API_KEY không hợp lệ hoặc chưa đủ quyền. Vui lòng kiểm tra lại API key trong mục Settings > Secrets.',
    };
  }

  if (rawStatus === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Hệ thống AI đang quá tải tạm thời. Vui lòng chờ vài giây rồi bấm Thử lại.',
    };
  }

  return {
    status: rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500,
    message: rawMsg,
  };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_ID });
  });

  app.post('/api/gemini/captions', async (req, res) => {
    const body = req.body as Partial<CaptionGenerateRequest> | undefined;
    const serviceName = typeof body?.serviceName === 'string' ? body.serviceName.trim() : '';

    if (!serviceName) {
      res.status(400).json({ error: 'Vui lòng nhập Tên dịch vụ phẫu thuật trước khi tạo caption.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Chưa thiết lập GEMINI_API_KEY cho ứng dụng. Vui lòng thêm khóa API trong mục Settings > Secrets để sử dụng Gợi ý Caption AI.',
      });
      return;
    }

    const captionRequest: CaptionGenerateRequest = {
      serviceName,
      serviceSubtitle: typeof body?.serviceSubtitle === 'string' ? body.serviceSubtitle : '',
      tone:
        body?.tone === 'medical_expert' ||
        body?.tone === 'luxury_trust' ||
        body?.tone === 'concise_inbox' ||
        body?.tone === 'storytelling'
          ? body.tone
          : 'medical_expert',
      extraNotes: typeof body?.extraNotes === 'string' ? body.extraNotes : '',
      includeClinicInfo: body?.includeClinicInfo !== false,
      clinicInfo: typeof body?.clinicInfo === 'object' && body.clinicInfo !== null ? body.clinicInfo : {},
    };

    const { systemInstruction, userPrompt } = buildCaptionPrompt(captionRequest);

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    try {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                styleLabel: {
                  type: Type.STRING,
                  description: 'Nhãn ngắn gọn phân loại phong cách mẫu caption',
                },
                hook: {
                  type: Type.STRING,
                  description: 'Câu mở đầu thu hút trên Facebook',
                },
                body: {
                  type: Type.STRING,
                  description: 'Nội dung chi tiết ca phẫu thuật và lời kêu gọi tư vấn',
                },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 đến 6 hashtag phù hợp dịch vụ thẩm mỹ',
                },
              },
              required: ['styleLabel', 'hook', 'body', 'hashtags'],
            },
          },
        },
      });

      const captions = parseGeneratedCaptionsResponse(response.text ?? '');
      res.json({ captions, model: MODEL_ID });
    } catch (err) {
      console.error('Gemini caption generation error:', err);
      const mapped = extractErrorDetails(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraAesthetic server listening on http://localhost:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
