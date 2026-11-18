import type {
  CaptionGenerateRequest,
  CaptionTone,
  GeneratedCaptionItem,
} from '../types/index.ts';

export interface CaptionToneOption {
  id: CaptionTone;
  label: string;
  shortDesc: string;
  promptGuidance: string;
}

export const CAPTION_TONE_OPTIONS: CaptionToneOption[] = [
  {
    id: 'medical_expert',
    label: 'Chuyên môn Y khoa',
    shortDesc: 'Chuẩn bác sĩ chia sẻ kiến thức & độ an toàn',
    promptGuidance:
      'Giọng văn chuẩn mực bác sĩ phẫu thuật thẩm mỹ, giải thích ngắn gọn kỹ thuật/cơ chế an toàn, tạo sự tin cậy tuyệt đối, tránh từ ngữ giật gân hay cam kết quá đà.',
  },
  {
    id: 'luxury_trust',
    label: 'Sang trọng & Tinh tế',
    shortDesc: 'Đẳng cấp thẩm mỹ viện VIP, thanh lịch',
    promptGuidance:
      'Giọng văn sang trọng, tinh tế, tôn vinh vẻ đẹp hài hòa tự nhiên theo tỷ lệ vàng khuôn mặt, phù hợp bệnh viện/thẩm mỹ viện cao cấp.',
  },
  {
    id: 'concise_inbox',
    label: 'Ngắn gọn Chốt Inbox',
    shortDesc: 'Tối ưu Newsfeed mobile, kêu gọi Zalo nhanh',
    promptGuidance:
      'Ngắn gọn 3-5 dòng dễ đọc lướt trên điện thoại, nhấn thẳng kết quả Trước/Sau và lời mời nhắn tin Zalo/Hotline tư vấn trực tiếp với bác sĩ.',
  },
  {
    id: 'storytelling',
    label: 'Tâm sự Khách hàng',
    shortDesc: 'Gần gũi, đồng cảm hành trình thay đổi nhan sắc',
    promptGuidance:
      'Kể lại câu chuyện thực tế của khách hàng từ khuyết điểm ban đầu đến sự tự tin rạng rỡ sau phẫu thuật, nhẹ nhàng và chân thành.',
  },
];

export function buildCaptionPrompt(req: CaptionGenerateRequest): {
  systemInstruction: string;
  userPrompt: string;
} {
  const toneObj =
    CAPTION_TONE_OPTIONS.find((t) => t.id === req.tone) ?? CAPTION_TONE_OPTIONS[0];
  const serviceName = (req.serviceName || '').trim();
  const serviceSubtitle = (req.serviceSubtitle || '').trim();
  const extraNotes = (req.extraNotes || '').trim();
  const clinic = req.clinicInfo ?? {};

  const clinicLines: string[] = [];
  if (req.includeClinicInfo) {
    if (clinic.brandName?.trim()) clinicLines.push(`- Cơ sở: ${clinic.brandName.trim()}`);
    if (clinic.doctorName?.trim()) {
      const title = clinic.doctorTitle?.trim() ? ` (${clinic.doctorTitle.trim()})` : '';
      clinicLines.push(`- Bác sĩ thực hiện: ${clinic.doctorName.trim()}${title}`);
    }
    if (clinic.hotline?.trim()) {
      const label = clinic.hotlineLabel?.trim() || 'Hotline / Zalo';
      clinicLines.push(`- ${label}: ${clinic.hotline.trim()}`);
    }
    if (clinic.address?.trim()) clinicLines.push(`- Địa chỉ: ${clinic.address.trim()}`);
  }

  const systemInstruction = [
    'Bạn là chuyên gia truyền thông y khoa & sáng tạo nội dung Facebook cho bác sĩ Phẫu thuật Thẩm mỹ tại Việt Nam.',
    'Nhiệm vụ: Tạo đúng 3 mẫu caption Facebook hoàn chỉnh, tự nhiên, giàu tính thuyết phục nhưng văn minh, chuẩn y khoa và tuân thủ quy tắc đăng bài Facebook (tránh từ khóa vi phạm chính sách quảng cáo nhạy cảm như cam kết 100%, chữa dứt điểm, body-shaming).',
    'Mỗi mẫu caption gồm:',
    '- styleLabel: Tên ngắn gọn phân biệt cách tiếp cận của mẫu (ví dụ: "Mẫu 1 · Phân tích chuyên môn", "Mẫu 2 · Hiệu quả thực tế", "Mẫu 3 · Kêu gọi tư vấn").',
    '- hook: Câu mở đầu 1 dòng thật thu hút để giữ chân người lướt Facebook.',
    '- body: Phần thân bài + CTA (chia đoạn rõ ràng bằng xuống dòng \\n, dùng icon tiết chế 2-4 icon tinh tế, không spam emoji).',
    '- hashtags: Mảng 4-6 hashtag tiếng Việt/tiếng Anh phù hợp dịch vụ (không cần dấu # lặp lại quá nhiều, bắt đầu mỗi tag bằng #).',
    'Luôn trả về JSON hợp lệ đúng schema đã định nghĩa.',
  ].join('\n');

  const userPrompt = [
    `Hãy viết 3 mẫu caption Facebook đăng kèm ảnh Trước & Sau cho dịch vụ:`,
    `- Tên dịch vụ: ${serviceName}`,
    serviceSubtitle ? `- Thông tin bổ sung trên ảnh: ${serviceSubtitle}` : '',
    extraNotes ? `- Ghi chú chi tiết ca phẫu thuật từ bác sĩ: ${extraNotes}` : '',
    `- Phong cách chủ đạo: ${toneObj.label} — ${toneObj.promptGuidance}`,
    req.includeClinicInfo && clinicLines.length > 0
      ? `Thông tin liên hệ đính kèm cuối bài (hãy lồng ghép khéo léo vào phần CTA):\n${clinicLines.join('\n')}`
      : 'Không cần chèn tên cơ sở hay số điện thoại cụ thể, chỉ để lời mời nhắn tin nhận tư vấn.',
  ]
    .filter(Boolean)
    .join('\n');

  return { systemInstruction, userPrompt };
}

export function parseGeneratedCaptionsResponse(rawText: string): GeneratedCaptionItem[] {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  if (!cleaned) {
    throw new Error('Máy chủ AI không trả về nội dung caption.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Không thể đọc định dạng phản hồi từ AI. Vui lòng thử tạo lại.');
  }

  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { captions?: unknown }).captions)
    ? (parsed as { captions: unknown[] }).captions
    : null;

  if (!list || list.length === 0) {
    throw new Error('AI chưa tạo được mẫu caption phù hợp. Vui lòng thử lại.');
  }

  return list
    .map((entry, idx): GeneratedCaptionItem | null => {
      if (typeof entry !== 'object' || entry === null) return null;
      const obj = entry as Record<string, unknown>;
      const styleLabel =
        typeof obj.styleLabel === 'string' && obj.styleLabel.trim()
          ? obj.styleLabel.trim()
          : `Mẫu ${idx + 1}`;
      const hook = typeof obj.hook === 'string' ? obj.hook.trim() : '';
      const body = typeof obj.body === 'string' ? obj.body.trim() : '';
      const rawTags = Array.isArray(obj.hashtags) ? obj.hashtags : [];
      const hashtags = rawTags
        .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
        .map((t) => {
          const cleanTag = t.trim().replace(/\s+/g, '');
          return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`;
        });

      if (!hook && !body) return null;

      return {
        id: `caption-${idx + 1}`,
        styleLabel,
        hook,
        body,
        hashtags,
      };
    })
    .filter((item): item is GeneratedCaptionItem => item !== null);
}

export function formatCaptionForCopy(
  item: Pick<GeneratedCaptionItem, 'hook' | 'body' | 'hashtags'>,
  includeHashtags: boolean = true
): string {
  const sections: string[] = [];
  if (item.hook.trim()) sections.push(item.hook.trim());
  if (item.body.trim()) sections.push(item.body.trim());
  if (includeHashtags && item.hashtags.length > 0) {
    sections.push(item.hashtags.join(' '));
  }
  return sections.join('\n\n');
}
