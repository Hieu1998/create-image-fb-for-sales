import {
  FacebookRatio,
  ImageAdjustments,
  RatioOption,
  TemplateId,
  TextAlignOption,
  TextFontFamily,
} from '../types';

export const RATIO_OPTIONS: RatioOption[] = [
  {
    id: '1:1',
    label: 'Vuông (1:1)',
    sublabel: '1080 x 1080 · Post Facebook Chuẩn',
    width: 1080,
    height: 1080,
    iconName: 'Square',
  },
  {
    id: '4:5',
    label: 'Dọc (4:5)',
    sublabel: '1080 x 1350 · Tối ưu Newsfeed Mobile',
    width: 1080,
    height: 1350,
    iconName: 'RectangleVertical',
  },
  {
    id: '9:16',
    label: 'Story/Reels (9:16)',
    sublabel: '1080 x 1920 · Facebook & IG Story',
    width: 1080,
    height: 1920,
    iconName: 'Smartphone',
  },
  {
    id: '16:9',
    label: 'Ngang (16:9)',
    sublabel: '1920 x 1080 · Banner & Video Cover',
    width: 1920,
    height: 1080,
    iconName: 'RectangleHorizontal',
  },
  {
    id: '1.91:1',
    label: 'Link/Banner (1.91:1)',
    sublabel: '1200 x 630 · Facebook Post Chia Sẻ',
    width: 1200,
    height: 630,
    iconName: 'Image',
  },
];

export function getDimensionsForRatio(ratio: FacebookRatio): { width: number; height: number } {
  const match = RATIO_OPTIONS.find((r) => r.id === ratio);
  return match ? { width: match.width, height: match.height } : { width: 1080, height: 1080 };
}

export interface RectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SplitLayoutBounds {
  headerRect: RectBounds;
  footerRect: RectBounds;
  beforeRect: RectBounds;
  afterRect: RectBounds;
  dividerPos?: { x1: number; y1: number; x2: number; y2: number };
}

/**
 * Calculates responsive bounding boxes for side-by-side comparison layout
 */
export function calculateSideBySideBounds(
  canvasWidth: number,
  canvasHeight: number,
  headerHeight: number = 160,
  footerHeight: number = 140,
  gap: number = 8
): SplitLayoutBounds {
  const safeHeaderH = Math.min(headerHeight, canvasHeight * 0.22);
  const safeFooterH = Math.min(footerHeight, canvasHeight * 0.2);
  const contentHeight = canvasHeight - safeHeaderH - safeFooterH;
  const contentWidth = canvasWidth;

  const halfWidth = (contentWidth - gap) / 2;

  return {
    headerRect: { x: 0, y: 0, width: canvasWidth, height: safeHeaderH },
    footerRect: { x: 0, y: canvasHeight - safeFooterH, width: canvasWidth, height: safeFooterH },
    beforeRect: { x: 0, y: safeHeaderH, width: halfWidth, height: contentHeight },
    afterRect: { x: halfWidth + gap, y: safeHeaderH, width: halfWidth, height: contentHeight },
    dividerPos: {
      x1: halfWidth + gap / 2,
      y1: safeHeaderH,
      x2: halfWidth + gap / 2,
      y2: safeHeaderH + contentHeight,
    },
  };
}

/**
 * Calculates responsive bounding boxes for top-bottom comparison layout (e.g., nose / jawline)
 */
export function calculateTopBottomBounds(
  canvasWidth: number,
  canvasHeight: number,
  headerHeight: number = 150,
  footerHeight: number = 130,
  gap: number = 8
): SplitLayoutBounds {
  const safeHeaderH = Math.min(headerHeight, canvasHeight * 0.2);
  const safeFooterH = Math.min(footerHeight, canvasHeight * 0.18);
  const contentHeight = canvasHeight - safeHeaderH - safeFooterH;
  const halfHeight = (contentHeight - gap) / 2;

  return {
    headerRect: { x: 0, y: 0, width: canvasWidth, height: safeHeaderH },
    footerRect: { x: 0, y: canvasHeight - safeFooterH, width: canvasWidth, height: safeFooterH },
    beforeRect: { x: 0, y: safeHeaderH, width: canvasWidth, height: halfHeight },
    afterRect: { x: 0, y: safeHeaderH + halfHeight + gap, width: canvasWidth, height: halfHeight },
    dividerPos: {
      x1: 0,
      y1: safeHeaderH + halfHeight + gap / 2,
      x2: canvasWidth,
      y2: safeHeaderH + halfHeight + gap / 2,
    },
  };
}

/**
 * Format hotline for display (e.g. 0988123456 -> 0988.123.456)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 7)}.${cleaned.slice(7)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 7)}.${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Truncate text cleanly with ellipsis if too long
 */
export function truncateText(text: string, maxChars: number): string {
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trim() + '…';
}

/**
 * Identifies headerless minimal "Ảnh + Zalo" templates
 */
export function isMinimalOnlyTemplate(templateId: TemplateId): boolean {
  return (
    templateId === 'minimal_consult' ||
    templateId === 'minimal_luxe_gold' ||
    templateId === 'minimal_silk_ivory' ||
    templateId === 'minimal_diagonal_prism' ||
    templateId === 'minimal_arch_editorial'
  );
}

/**
 * Returns responsive header/footer heights tailored per template & Facebook aspect ratio
 */
export function getTemplateLayoutConfig(
  templateId: TemplateId,
  ratio: FacebookRatio
): { headerHeight: number; footerHeight: number; fullBleedMedia: boolean } {
  const isStory = ratio === '9:16';
  const isBanner = ratio === '16:9' || ratio === '1.91:1';

  if (templateId === 'minimal_diagonal_prism') {
    return {
      headerHeight: 0,
      footerHeight: 0,
      fullBleedMedia: true,
    };
  }

  if (isMinimalOnlyTemplate(templateId)) {
    return {
      headerHeight: 0,
      footerHeight: isStory ? 132 : isBanner ? 92 : 112,
      fullBleedMedia: false,
    };
  }

  return {
    headerHeight: isStory ? 230 : isBanner ? 135 : 160,
    footerHeight: isStory ? 270 : isBanner ? 165 : 205,
    fullBleedMedia: false,
  };
}

/**
 * Validates template layout safety
 */
export function isHorizontalLayout(ratio: FacebookRatio, _templateId: TemplateId): boolean {
  return ratio === '16:9' || ratio === '1.91:1' || ratio === '1:1' || ratio === '4:5' || ratio === '9:16';
}

/**
 * Computes canvas X coordinate based on desired horizontal text alignment
 */
export function getAlignedTextX(
  align: TextAlignOption | undefined,
  canvasWidth: number,
  paddingX: number
): number {
  if (align === 'center') return canvasWidth / 2;
  if (align === 'right') return canvasWidth - paddingX;
  return paddingX;
}

/**
 * Maps font selection to offline-safe serif / sans-serif font stacks
 */
export function resolveFontFamily(
  font: TextFontFamily | undefined,
  fallback: TextFontFamily = 'sans'
): string {
  const chosen = font ?? fallback;
  if (chosen === 'serif') {
    return '"Playfair Display", "Times New Roman", Georgia, serif';
  }
  return 'Montserrat, "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

/**
 * Clamps scale and offsetX/offsetY adjustments safely within bounds
 */
export function clampImageAdjustments(
  patch: Partial<ImageAdjustments>,
  current: ImageAdjustments
): ImageAdjustments {
  const nextScale = patch.scale ?? current.scale;
  const nextOffsetX = patch.offsetX ?? current.offsetX;
  const nextOffsetY = patch.offsetY ?? current.offsetY;

  return {
    ...current,
    ...patch,
    scale: Math.min(2.5, Math.max(0.5, Number(nextScale.toFixed(2)))),
    offsetX: Math.round(Math.min(400, Math.max(-400, nextOffsetX))),
    offsetY: Math.round(Math.min(400, Math.max(-400, nextOffsetY))),
  };
}
