import test from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../data/templates';
import {
  getDimensionsForRatio,
  calculateSideBySideBounds,
  calculateTopBottomBounds,
  formatPhoneNumber,
  truncateText,
  isHorizontalLayout,
  isMinimalOnlyTemplate,
  getTemplateLayoutConfig,
  getAlignedTextX,
  resolveFontFamily,
  clampImageAdjustments,
} from './templateHelpers';

test('getDimensionsForRatio returns standard Facebook dimensions', () => {
  const square = getDimensionsForRatio('1:1');
  assert.equal(square.width, 1080);
  assert.equal(square.height, 1080);

  const portrait = getDimensionsForRatio('4:5');
  assert.equal(portrait.width, 1080);
  assert.equal(portrait.height, 1350);

  const story = getDimensionsForRatio('9:16');
  assert.equal(story.width, 1080);
  assert.equal(story.height, 1920);

  const banner = getDimensionsForRatio('1.91:1');
  assert.equal(banner.width, 1200);
  assert.equal(banner.height, 630);
});

test('calculateSideBySideBounds divides content space symmetrically without overlap', () => {
  const bounds = calculateSideBySideBounds(1080, 1080, 160, 140, 10);
  
  assert.equal(bounds.headerRect.x, 0);
  assert.equal(bounds.headerRect.width, 1080);
  assert.equal(bounds.headerRect.height, 160);

  assert.equal(bounds.beforeRect.x, 0);
  assert.equal(bounds.beforeRect.y, 160);
  assert.equal(bounds.beforeRect.width, (1080 - 10) / 2);

  assert.equal(bounds.afterRect.x, (1080 - 10) / 2 + 10);
  assert.equal(bounds.afterRect.width, (1080 - 10) / 2);

  // Total width matches
  assert.equal(bounds.beforeRect.width + 10 + bounds.afterRect.width, 1080);

  // Heights fit within total height
  const contentHeight = 1080 - 160 - 140;
  assert.equal(bounds.beforeRect.height, contentHeight);
  assert.equal(bounds.afterRect.height, contentHeight);
  assert.equal(bounds.footerRect.height, 140);
  assert.equal(bounds.headerRect.height + contentHeight + bounds.footerRect.height, 1080);
});

test('calculateTopBottomBounds splits vertically with correct heights', () => {
  const bounds = calculateTopBottomBounds(1080, 1350, 150, 130, 8);
  const contentHeight = 1350 - 150 - 130;
  const halfH = (contentHeight - 8) / 2;

  assert.equal(bounds.beforeRect.height, halfH);
  assert.equal(bounds.afterRect.height, halfH);
  assert.equal(bounds.beforeRect.width, 1080);
  assert.equal(bounds.afterRect.width, 1080);
});

test('formatPhoneNumber formats 10 digit Vietnamese numbers nicely', () => {
  assert.equal(formatPhoneNumber('0988123456'), '0988.123.456');
  assert.equal(formatPhoneNumber('0912 345 678'), '0912.345.678');
  assert.equal(formatPhoneNumber(''), '');
});

test('truncateText handles strings correctly', () => {
  assert.equal(truncateText('Bệnh viện thẩm mỹ', 10), 'Bệnh viện…');
  assert.equal(truncateText('Ngắn', 10), 'Ngắn');
});

test('TEMPLATES keeps requested 3 templates plus 4 new luxury minimal templates', () => {
  const ids = TEMPLATES.map((t) => t.id);
  assert.deepEqual(ids, [
    'luxury_gold',
    'diagonal_split',
    'minimal_consult',
    'minimal_luxe_gold',
    'minimal_silk_ivory',
    'minimal_diagonal_prism',
    'minimal_arch_editorial',
  ]);
  assert.equal(TEMPLATES.length, 7);
});

test('isMinimalOnlyTemplate and getTemplateLayoutConfig distinguish full vs Ảnh + Zalo templates', () => {
  assert.equal(isMinimalOnlyTemplate('luxury_gold'), false);
  assert.equal(isMinimalOnlyTemplate('diagonal_split'), false);
  assert.equal(isMinimalOnlyTemplate('minimal_consult'), true);
  assert.equal(isMinimalOnlyTemplate('minimal_luxe_gold'), true);
  assert.equal(isMinimalOnlyTemplate('minimal_silk_ivory'), true);
  assert.equal(isMinimalOnlyTemplate('minimal_diagonal_prism'), true);
  assert.equal(isMinimalOnlyTemplate('minimal_arch_editorial'), true);

  assert.equal(isHorizontalLayout('1:1', 'luxury_gold'), true);

  const goldLayout = getTemplateLayoutConfig('luxury_gold', '1:1');
  assert.equal(goldLayout.headerHeight, 160);
  assert.equal(goldLayout.footerHeight, 205);

  const archLayout = getTemplateLayoutConfig('minimal_arch_editorial', '4:5');
  assert.equal(archLayout.headerHeight, 0);
  assert.equal(archLayout.footerHeight, 112);

  const prismLayout = getTemplateLayoutConfig('minimal_diagonal_prism', '9:16');
  assert.equal(prismLayout.headerHeight, 0);
  assert.equal(prismLayout.footerHeight, 0);
  assert.equal(prismLayout.fullBleedMedia, true);
});

test('calculateSideBySideBounds supports headerless minimal_consult layout', () => {
  const bounds = calculateSideBySideBounds(1080, 1080, 0, 112, 6);
  assert.equal(bounds.headerRect.height, 0);
  assert.equal(bounds.beforeRect.y, 0);
  assert.equal(bounds.afterRect.y, 0);
  assert.equal(bounds.beforeRect.height, 1080 - 112);
  assert.equal(bounds.footerRect.height, 112);
  assert.equal(bounds.footerRect.y, 1080 - 112);
});

test('getAlignedTextX computes X coordinate for left, center, right alignments', () => {
  assert.equal(getAlignedTextX('left', 1080, 45), 45);
  assert.equal(getAlignedTextX(undefined, 1080, 45), 45);
  assert.equal(getAlignedTextX('center', 1080, 45), 540);
  assert.equal(getAlignedTextX('right', 1080, 45), 1035);
});

test('resolveFontFamily selects serif and sans-serif font stacks properly', () => {
  assert.ok(resolveFontFamily('serif').includes('serif'));
  assert.ok(resolveFontFamily('serif').includes('Playfair Display'));
  assert.ok(resolveFontFamily('sans').includes('Montserrat'));
  assert.ok(resolveFontFamily(undefined, 'serif').includes('Playfair Display'));
});

test('clampImageAdjustments enforces zoom and offset bounds safely', () => {
  const base = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    smoothSkin: 0,
    privacyBar: { enabled: false, type: 'black_bar' as const, yPercent: 36, heightPercent: 8 },
  };
  const maxed = clampImageAdjustments({ scale: 5, offsetX: 999, offsetY: -999 }, base);
  assert.equal(maxed.scale, 2.5);
  assert.equal(maxed.offsetX, 400);
  assert.equal(maxed.offsetY, -400);

  const minned = clampImageAdjustments({ scale: 0.1, offsetX: -50.6 }, base);
  assert.equal(minned.scale, 0.5);
  assert.equal(minned.offsetX, -51);
});
