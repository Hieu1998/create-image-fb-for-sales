import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDimensionsForRatio,
  calculateSideBySideBounds,
  calculateTopBottomBounds,
  formatPhoneNumber,
  truncateText,
  isHorizontalLayout,
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

test('isHorizontalLayout detects top_bottom_split properly', () => {
  assert.equal(isHorizontalLayout('1:1', 'top_bottom_split'), false);
  assert.equal(isHorizontalLayout('1:1', 'luxury_gold'), true);
});
