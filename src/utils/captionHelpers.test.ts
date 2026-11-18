import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAPTION_TONE_OPTIONS,
  buildCaptionPrompt,
  parseGeneratedCaptionsResponse,
  formatCaptionForCopy,
} from './captionHelpers';

test('CAPTION_TONE_OPTIONS includes 4 cosmetic surgery caption styles', () => {
  assert.equal(CAPTION_TONE_OPTIONS.length, 4);
  assert.deepEqual(
    CAPTION_TONE_OPTIONS.map((t) => t.id),
    ['medical_expert', 'luxury_trust', 'concise_inbox', 'storytelling']
  );
});

test('buildCaptionPrompt includes service name, extra notes, and clinic info when requested', () => {
  const { systemInstruction, userPrompt } = buildCaptionPrompt({
    serviceName: 'Nâng mũi cấu trúc Surgiform',
    serviceSubtitle: 'BS Nguyễn Văn Hùng',
    tone: 'medical_expert',
    extraNotes: 'Sau 10 ngày cắt chỉ, hết sưng',
    includeClinicInfo: true,
    clinicInfo: {
      brandName: 'BV Đa Khoa Hải Vân',
      doctorName: 'ThS. BS Nguyễn Văn Hùng',
      hotline: '0988.123.456',
      hotlineLabel: 'Zalo Bác sĩ',
      address: '128 Nguyễn Trãi, Q.1',
    },
  });

  assert.ok(systemInstruction.includes('3 mẫu caption Facebook'));
  assert.ok(userPrompt.includes('Nâng mũi cấu trúc Surgiform'));
  assert.ok(userPrompt.includes('Sau 10 ngày cắt chỉ, hết sưng'));
  assert.ok(userPrompt.includes('BV Đa Khoa Hải Vân'));
  assert.ok(userPrompt.includes('0988.123.456'));
});

test('buildCaptionPrompt omits clinic details when includeClinicInfo is false', () => {
  const { userPrompt } = buildCaptionPrompt({
    serviceName: 'Cắt mí Mini Deep',
    tone: 'concise_inbox',
    includeClinicInfo: false,
    clinicInfo: {
      brandName: 'BV Hải Vân',
      hotline: '0909888999',
    },
  });

  assert.ok(!userPrompt.includes('0909888999'));
  assert.ok(!userPrompt.includes('BV Hải Vân'));
});

test('parseGeneratedCaptionsResponse handles clean and markdown-fenced JSON', () => {
  const raw = `\`\`\`json
  [
    {
      "styleLabel": "Mẫu 1 · Chuyên môn",
      "hook": "Thay đổi dáng mũi sau 10 ngày!",
      "body": "Kỹ thuật nâng mũi cấu trúc an toàn.\\nLiên hệ ngay.",
      "hashtags": ["NangMui", "#ThamMyAnToan"]
    }
  ]
  \`\`\``;

  const parsed = parseGeneratedCaptionsResponse(raw);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].styleLabel, 'Mẫu 1 · Chuyên môn');
  assert.deepEqual(parsed[0].hashtags, ['#NangMui', '#ThamMyAnToan']);
});

test('parseGeneratedCaptionsResponse throws descriptive error on invalid input', () => {
  assert.throws(() => parseGeneratedCaptionsResponse(''), /không trả về/);
  assert.throws(() => parseGeneratedCaptionsResponse('not json'), /định dạng/);
  assert.throws(() => parseGeneratedCaptionsResponse('[]'), /chưa tạo được/);
});

test('formatCaptionForCopy combines hook, body, and optional hashtags cleanly', () => {
  const withTags = formatCaptionForCopy(
    {
      hook: 'Mở đầu thu hút',
      body: 'Nội dung chi tiết',
      hashtags: ['#NangMui', '#HaiVan'],
    },
    true
  );
  assert.equal(withTags, 'Mở đầu thu hút\n\nNội dung chi tiết\n\n#NangMui #HaiVan');

  const withoutTags = formatCaptionForCopy(
    {
      hook: 'Mở đầu thu hút',
      body: 'Nội dung chi tiết',
      hashtags: ['#NangMui', '#HaiVan'],
    },
    false
  );
  assert.equal(withoutTags, 'Mở đầu thu hút\n\nNội dung chi tiết');
});
