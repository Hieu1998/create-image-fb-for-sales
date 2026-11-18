import { BrandingData, FacebookRatio, ImageAdjustments, TemplateDefinition } from '../types';
import {
  calculateSideBySideBounds,
  formatPhoneNumber,
  getAlignedTextX,
  getDimensionsForRatio,
  getTemplateLayoutConfig,
  isMinimalOnlyTemplate,
  resolveFontFamily,
} from './templateHelpers';

export interface RenderCanvasOptions {
  canvas: HTMLCanvasElement;
  ratio: FacebookRatio;
  template: TemplateDefinition;
  beforeImg: HTMLImageElement | null;
  afterImg: HTMLImageElement | null;
  logoImg: HTMLImageElement | null;
  beforeAdj: ImageAdjustments;
  afterAdj: ImageAdjustments;
  branding: BrandingData;
  scaleMultiplier?: number;
}

/**
 * Draw image with zoom, pan, rotate, flip, and privacy bar
 */
function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetRect: { x: number; y: number; width: number; height: number },
  adj: ImageAdjustments
) {
  ctx.save();

  ctx.beginPath();
  ctx.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight;
  const targetAspect = targetRect.width / targetRect.height;
  let baseW: number;
  let baseH: number;

  if (imgAspect > targetAspect) {
    baseH = targetRect.height;
    baseW = targetRect.height * imgAspect;
  } else {
    baseW = targetRect.width;
    baseH = targetRect.width / imgAspect;
  }

  const centerX = targetRect.x + targetRect.width / 2 + adj.offsetX;
  const centerY = targetRect.y + targetRect.height / 2 + adj.offsetY;

  ctx.translate(centerX, centerY);

  if (adj.rotation !== 0) {
    ctx.rotate((adj.rotation * Math.PI) / 180);
  }

  const scaleX = (adj.flipH ? -1 : 1) * adj.scale;
  const scaleY = (adj.flipV ? -1 : 1) * adj.scale;
  ctx.scale(scaleX, scaleY);

  const filters: string[] = [];
  if (adj.brightness !== 100) filters.push(`brightness(${adj.brightness}%)`);
  if (adj.contrast !== 100) filters.push(`contrast(${adj.contrast}%)`);
  if (adj.saturation !== 100) filters.push(`saturate(${adj.saturation}%)`);
  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  const drawW = baseW;
  const drawH = baseH;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.filter = 'none';

  if (adj.smoothSkin > 0) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = adj.smoothSkin / 150;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }

  if (adj.privacyBar.enabled) {
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height);
    ctx.clip();

    const barY = targetRect.y + (targetRect.height * adj.privacyBar.yPercent) / 100;
    const barHeight = Math.max(34, (targetRect.height * adj.privacyBar.heightPercent) / 100);
    const barWidth = targetRect.width * 0.74;
    const barX = targetRect.x + (targetRect.width - barWidth) / 2;

    if (adj.privacyBar.type === 'black_bar') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(barX, barY - barHeight / 2, barWidth, barHeight, 8);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 13px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BẢO MẬT HÌNH ẢNH KHÁCH HÀNG', barX + barWidth / 2, barY);
    } else {
      ctx.fillStyle = 'rgba(200, 215, 235, 0.65)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(barX, barY - barHeight / 2, barWidth, barHeight, 6);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  ctx.restore();
}

/**
 * Draw distinctive Before / After badges tailored per template style
 */
function drawStylizedBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  isAfter: boolean,
  template: TemplateDefinition
) {
  if (!text.trim()) return;

  ctx.save();

  ctx.font = 'bold 22px Montserrat, "Plus Jakarta Sans", sans-serif';
  const textMetrics = ctx.measureText(text);
  const paddingX = 26;
  const badgeWidth = Math.max(textMetrics.width + paddingX * 2, 210);
  const badgeHeight = 48;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  if (template.id === 'luxury_gold' || template.id === 'minimal_luxe_gold') {
    const slant = template.id === 'minimal_luxe_gold' ? 10 : 14;
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, '#AA771C');
      bgGrad.addColorStop(0.3, '#F9E79F');
      bgGrad.addColorStop(0.7, '#D4AF37');
      bgGrad.addColorStop(1, '#8A5D10');
    } else {
      bgGrad.addColorStop(0, '#0C0B0E');
      bgGrad.addColorStop(1, '#1C1922');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.moveTo(x - badgeWidth / 2 - slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2 + slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2, y + badgeHeight / 2);
    ctx.lineTo(x - badgeWidth / 2, y + badgeHeight / 2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isAfter ? '#FFFBEB' : '#D4AF37';
    ctx.stroke();

    ctx.fillStyle = isAfter ? '#090D16' : '#F7E7CE';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else if (template.id === 'minimal_silk_ivory') {
    ctx.shadowColor = 'rgba(30, 24, 26, 0.16)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    if (isAfter) {
      const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
      bgGrad.addColorStop(0, '#B76E79');
      bgGrad.addColorStop(1, '#D38C96');
      ctx.fillStyle = bgGrad;
    } else {
      ctx.fillStyle = 'rgba(255, 253, 250, 0.94)';
    }

    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 24);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isAfter ? 'rgba(255, 255, 255, 0.6)' : '#DFD3C8';
    ctx.stroke();

    ctx.fillStyle = isAfter ? '#FFFFFF' : '#3E3330';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else if (template.id === 'minimal_diagonal_prism') {
    const slant = 16;
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, '#BE185D');
      bgGrad.addColorStop(0.55, '#DB2777');
      bgGrad.addColorStop(1, '#9333EA');
    } else {
      bgGrad.addColorStop(0, 'rgba(9, 12, 24, 0.88)');
      bgGrad.addColorStop(1, 'rgba(24, 29, 52, 0.9)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.moveTo(x - badgeWidth / 2 + slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2 + slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2 - slant, y + badgeHeight / 2);
    ctx.lineTo(x - badgeWidth / 2 - slant, y + badgeHeight / 2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isAfter ? 'rgba(248, 250, 252, 0.7)' : 'rgba(226, 232, 240, 0.35)';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else if (template.id === 'minimal_arch_editorial') {
    const smallW = Math.max(textMetrics.width + 42, 190);
    const smallH = 44;
    const bgGrad = ctx.createLinearGradient(x - smallW / 2, y, x + smallW / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, '#B5844A');
      bgGrad.addColorStop(0.5, '#F3DFC1');
      bgGrad.addColorStop(1, '#C89D66');
    } else {
      bgGrad.addColorStop(0, 'rgba(6, 18, 16, 0.92)');
      bgGrad.addColorStop(1, 'rgba(13, 35, 30, 0.95)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(x - smallW / 2, y - smallH / 2, smallW, smallH, 22);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isAfter ? '#FFF8EB' : '#C89D66';
    ctx.stroke();

    ctx.fillStyle = isAfter ? '#061210' : '#F3DFC1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else if (template.id === 'diagonal_split') {
    const slant = 18;
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, '#EC4899');
      bgGrad.addColorStop(1, '#8B5CF6');
    } else {
      bgGrad.addColorStop(0, '#1E1B4B');
      bgGrad.addColorStop(1, '#312E81');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.moveTo(x - badgeWidth / 2 + slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2 + slant, y - badgeHeight / 2);
    ctx.lineTo(x + badgeWidth / 2 - slant, y + badgeHeight / 2);
    ctx.lineTo(x - badgeWidth / 2 - slant, y + badgeHeight / 2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else {
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, template.primaryColor);
      bgGrad.addColorStop(1, template.secondaryColor);
    } else {
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      bgGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 26);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isAfter ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();

    ctx.fillStyle = isAfter ? '#05070D' : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  }

  ctx.restore();
}

/**
 * Draw diamond VS emblem for luxury seams
 */
function drawDiamondVsMedallion(
  ctx: CanvasRenderingContext2D,
  vsText: string,
  cx: number,
  cy: number,
  fillBg: string,
  borderColor: string,
  textColor: string,
  size: number = 22
) {
  if (!vsText) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = fillBg;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-size, -size, size * 2, size * 2, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.stroke();

  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = textColor;
  ctx.font = 'bold 13px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(vsText, 0, 1, size * 1.8);
  ctx.restore();
}

/**
 * Draw crisp vector telephone handset icon on Canvas 2D
 */
function drawVectorPhoneIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = radius / 12;
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-6.5, -8.5);
  ctx.quadraticCurveTo(-8.5, -8.5, -8.5, -6.2);
  ctx.bezierCurveTo(-8.5, 2.2, -2.2, 8.5, 6.2, 8.5);
  ctx.quadraticCurveTo(8.5, 8.5, 8.5, 6.5);
  ctx.lineTo(8.5, 3.8);
  ctx.quadraticCurveTo(8.5, 2.3, 7.0, 2.0);
  ctx.lineTo(4.0, 1.5);
  ctx.quadraticCurveTo(2.8, 1.3, 2.1, 2.3);
  ctx.lineTo(1.2, 3.5);
  ctx.bezierCurveTo(-1.3, 2.3, -2.3, 1.3, -3.5, -1.2);
  ctx.lineTo(-2.3, -2.1);
  ctx.quadraticCurveTo(-1.3, -2.8, -1.5, -4.0);
  ctx.lineTo(-2.0, -7.0);
  ctx.quadraticCurveTo(-2.3, -8.5, -3.8, -8.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw refined luxury Zalo CTA button tailored to minimal cosmetic surgery templates
 */
function drawLuxuryZaloCTA(
  ctx: CanvasRenderingContext2D,
  fullHotline: string,
  centerX: number,
  centerY: number,
  maxWidth: number,
  template: TemplateDefinition
) {
  if (!fullHotline) return;

  ctx.save();
  ctx.font = 'bold 25px Montserrat, "Plus Jakarta Sans", sans-serif';
  ctx.textBaseline = 'middle';
  const measuredW = ctx.measureText(fullHotline).width;
  const iconGap = 32;
  const ctaW = Math.min(maxWidth, Math.max(measuredW + iconGap + 72, 370));
  const ctaH = 60;
  const ctaX = centerX - ctaW / 2;
  const ctaY = centerY - ctaH / 2;

  const drawIconAndLabel = (iconBg: string, iconColor: string, textColor: string) => {
    const contentW = Math.min(ctaW - 38, measuredW + iconGap);
    const startX = centerX - contentW / 2;

    // Subtle circular icon badge
    ctx.fillStyle = iconBg;
    ctx.beginPath();
    ctx.arc(startX + 12, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    drawVectorPhoneIcon(ctx, startX + 12, centerY, 9.5, iconColor);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText(fullHotline, startX + iconGap, centerY + 1, ctaW - 44 - iconGap);
  };

  if (template.id === 'minimal_luxe_gold') {
    const borderGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY + ctaH);
    borderGrad.addColorStop(0, '#B8860B');
    borderGrad.addColorStop(0.5, '#F9E79F');
    borderGrad.addColorStop(1, '#D4AF37');

    const fillGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
    fillGrad.addColorStop(0, '#141118');
    fillGrad.addColorStop(0.5, '#1F1B24');
    fillGrad.addColorStop(1, '#141118');

    ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 10);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderGrad;
    ctx.stroke();

    drawIconAndLabel('rgba(212, 175, 55, 0.22)', '#F9E79F', '#F9E79F');
  } else if (template.id === 'minimal_silk_ivory') {
    ctx.shadowColor = 'rgba(30, 24, 26, 0.25)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 5;

    const fillGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
    fillGrad.addColorStop(0, '#1E181A');
    fillGrad.addColorStop(0.5, '#2E2326');
    fillGrad.addColorStop(1, '#1E181A');

    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 30);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#D8A39D';
    ctx.stroke();

    drawIconAndLabel('rgba(216, 163, 157, 0.22)', '#F2C6C2', '#FAF7F2');
  } else if (template.id === 'minimal_diagonal_prism') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 22;

    ctx.fillStyle = 'rgba(10, 12, 24, 0.86)';
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 30);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    const rimGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
    rimGrad.addColorStop(0, '#E2E8F0');
    rimGrad.addColorStop(0.5, '#F472B6');
    rimGrad.addColorStop(1, '#C084FC');
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = rimGrad;
    ctx.stroke();

    drawIconAndLabel('rgba(244, 114, 182, 0.26)', '#FBCFE8', '#FFFFFF');
  } else if (template.id === 'minimal_arch_editorial') {
    ctx.shadowColor = 'rgba(200, 157, 102, 0.35)';
    ctx.shadowBlur = 18;

    const goldGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
    goldGrad.addColorStop(0, '#B5844A');
    goldGrad.addColorStop(0.35, '#F3DFC1');
    goldGrad.addColorStop(0.65, '#DFBA88');
    goldGrad.addColorStop(1, '#A6783F');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 30);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 248, 235, 0.65)';
    ctx.stroke();

    drawIconAndLabel('rgba(6, 18, 16, 0.14)', '#061210', '#061210');
  } else {
    const phoneGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY + ctaH);
    phoneGrad.addColorStop(0, '#E11D48');
    phoneGrad.addColorStop(1, '#BE123C');
    ctx.fillStyle = phoneGrad;
    ctx.shadowColor = 'rgba(225, 29, 72, 0.55)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 30);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    drawIconAndLabel('rgba(255, 255, 255, 0.2)', '#FFFFFF', '#FFFFFF');
  }

  ctx.restore();
}

/**
 * Main render function with distinct, customized styles per template
 */
export function renderSurgeryComparisonCanvas({
  canvas,
  ratio,
  template,
  beforeImg,
  afterImg,
  logoImg,
  beforeAdj,
  afterAdj,
  branding,
  scaleMultiplier = 1,
}: RenderCanvasOptions) {
  const baseDim = getDimensionsForRatio(ratio);
  const width = baseDim.width * scaleMultiplier;
  const height = baseDim.height * scaleMultiplier;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  ctx.save();
  ctx.scale(scaleMultiplier, scaleMultiplier);

  const logicalW = baseDim.width;
  const logicalH = baseDim.height;
  const isBanner = ratio === '16:9' || ratio === '1.91:1';
  const isLightTheme = template.id === 'minimal_silk_ivory';

  // 1. Fill base canvas background
  const bgGrad = ctx.createLinearGradient(0, 0, logicalW, logicalH);
  if (template.id === 'minimal_silk_ivory') {
    bgGrad.addColorStop(0, '#FAF7F2');
    bgGrad.addColorStop(1, '#EFE7DC');
  } else if (template.id === 'minimal_arch_editorial') {
    bgGrad.addColorStop(0, '#071411');
    bgGrad.addColorStop(0.5, '#0B1F1B');
    bgGrad.addColorStop(1, '#040B0A');
  } else if (template.id === 'minimal_luxe_gold') {
    bgGrad.addColorStop(0, '#0B0A0E');
    bgGrad.addColorStop(0.5, '#131016');
    bgGrad.addColorStop(1, '#08070A');
  } else {
    bgGrad.addColorStop(0, template.bgColor);
    bgGrad.addColorStop(1, '#05070E');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, logicalW, logicalH);

  // Formatted Hotline / Zalo text
  const formattedPhone = formatPhoneNumber((branding.hotline ?? '').trim());
  const hotPrefix = (branding.hotlineLabel ?? '').trim().toUpperCase();
  const fullHotline =
    hotPrefix && formattedPhone
      ? `${hotPrefix}: ${formattedPhone}`
      : hotPrefix
      ? `${hotPrefix}`
      : formattedPhone
      ? `${formattedPhone}`
      : '';
  const beforeText = branding.beforeLabel ?? 'TRƯỚC PHẪU THUẬT';
  const afterText = branding.afterLabel ?? 'SAU PHẪU THUẬT';
  const vsText = (branding.vsLabel ?? 'VS').trim();

  // =========================================================================
  // SPECIAL LUXURY MINIMAL RENDERERS (ONLY IMAGES + ZALO CTA)
  // =========================================================================
  if (template.id === 'minimal_luxe_gold') {
    const outerPad = isBanner ? 18 : 24;
    const footerBandH = isBanner ? 90 : ratio === '9:16' ? 128 : 108;
    const innerPad = 14;
    const frameX = outerPad;
    const frameY = outerPad;
    const frameW = logicalW - outerPad * 2;
    const frameH = logicalH - outerPad * 2;

    const mediaX = frameX + innerPad;
    const mediaY = frameY + innerPad;
    const mediaW = frameW - innerPad * 2;
    const mediaH = frameH - innerPad - footerBandH;
    const gap = 10;
    const colW = (mediaW - gap) / 2;

    const beforeRect = { x: mediaX, y: mediaY, width: colW, height: mediaH };
    const afterRect = { x: mediaX + colW + gap, y: mediaY, width: colW, height: mediaH };

    if (beforeImg) drawTransformedImage(ctx, beforeImg, beforeRect, beforeAdj);
    if (afterImg) drawTransformedImage(ctx, afterImg, afterRect, afterAdj);

    // Subtle hairline gold rim around each photo
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.strokeRect(beforeRect.x, beforeRect.y, beforeRect.width, beforeRect.height);
    ctx.strokeStyle = 'rgba(249, 231, 159, 0.55)';
    ctx.strokeRect(afterRect.x, afterRect.y, afterRect.width, afterRect.height);
    ctx.restore();

    // Vertical gold seam & Diamond VS medallion
    const seamX = mediaX + colW + gap / 2;
    ctx.save();
    const seamGrad = ctx.createLinearGradient(seamX, mediaY, seamX, mediaY + mediaH);
    seamGrad.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
    seamGrad.addColorStop(0.5, '#F3E5AB');
    seamGrad.addColorStop(1, 'rgba(212, 175, 55, 0.2)');
    ctx.strokeStyle = seamGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(seamX, mediaY);
    ctx.lineTo(seamX, mediaY + mediaH);
    ctx.stroke();
    ctx.restore();

    if (vsText) {
      drawDiamondVsMedallion(ctx, vsText, seamX, mediaY + mediaH / 2, '#0C0B0E', '#D4AF37', '#F9E79F', 23);
    }

    // Outer double luxury gold frame + corner brackets
    ctx.save();
    const goldFrameGrad = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
    goldFrameGrad.addColorStop(0, '#B8860B');
    goldFrameGrad.addColorStop(0.5, '#F9E79F');
    goldFrameGrad.addColorStop(1, '#D4AF37');
    ctx.strokeStyle = goldFrameGrad;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(frameX, frameY, frameW, frameH);

    // Mitered L-corner flourishes
    const cornerLen = 20;
    ctx.lineWidth = 3;
    const drawCorner = (cx: number, cy: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * cornerLen);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * cornerLen, cy);
      ctx.stroke();
    };
    drawCorner(frameX, frameY, 1, 1);
    drawCorner(frameX + frameW, frameY, -1, 1);
    drawCorner(frameX, frameY + frameH, 1, -1);
    drawCorner(frameX + frameW, frameY + frameH, -1, -1);
    ctx.restore();

    drawStylizedBadge(ctx, beforeText, beforeRect.x + beforeRect.width / 2, beforeRect.y + 44, false, template);
    drawStylizedBadge(ctx, afterText, afterRect.x + afterRect.width / 2, afterRect.y + 44, true, template);

    drawLuxuryZaloCTA(
      ctx,
      fullHotline,
      logicalW / 2,
      mediaY + mediaH + footerBandH / 2,
      frameW - 48,
      template
    );
  } else if (template.id === 'minimal_silk_ivory') {
    const outerPad = isBanner ? 20 : 28;
    const footerBandH = isBanner ? 86 : ratio === '9:16' ? 126 : 106;
    const gap = isBanner ? 14 : 18;
    const mediaW = logicalW - outerPad * 2;
    const mediaH = logicalH - outerPad - footerBandH;
    const colW = (mediaW - gap) / 2;
    const cardRadius = 22;

    const beforeRect = { x: outerPad, y: outerPad, width: colW, height: mediaH };
    const afterRect = { x: outerPad + colW + gap, y: outerPad, width: colW, height: mediaH };

    // Subtle hairline border around the entire ivory canvas
    ctx.save();
    ctx.strokeStyle = 'rgba(183, 110, 121, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, 12, logicalW - 24, logicalH - 24);
    ctx.restore();

    const drawIvoryPhotoCard = (
      rect: { x: number; y: number; width: number; height: number },
      img: HTMLImageElement | null,
      adj: ImageAdjustments,
      borderStroke: string
    ) => {
      // Drop shadow base
      ctx.save();
      ctx.shadowColor = 'rgba(42, 30, 26, 0.16)';
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = '#E8DFD5';
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, cardRadius);
      ctx.fill();
      ctx.restore();

      // Clipped photo
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, cardRadius);
      ctx.clip();
      if (img) drawTransformedImage(ctx, img, rect, adj);
      ctx.restore();

      // Delicate rose-taupe rim
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = borderStroke;
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, cardRadius);
      ctx.stroke();
      ctx.restore();
    };

    drawIvoryPhotoCard(beforeRect, beforeImg, beforeAdj, '#D8CDC1');
    drawIvoryPhotoCard(afterRect, afterImg, afterAdj, '#C98992');

    // Delicate center circular VS medallion
    if (vsText) {
      const midX = outerPad + colW + gap / 2;
      const midY = outerPad + mediaH / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(42, 30, 26, 0.18)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#FAF7F2';
      ctx.strokeStyle = '#B76E79';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, midY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();

      ctx.fillStyle = '#B76E79';
      ctx.font = 'bold 13px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(vsText, midX, midY + 1, 36);
      ctx.restore();
    }

    drawStylizedBadge(ctx, beforeText, beforeRect.x + beforeRect.width / 2, beforeRect.y + 44, false, template);
    drawStylizedBadge(ctx, afterText, afterRect.x + afterRect.width / 2, afterRect.y + 44, true, template);

    drawLuxuryZaloCTA(
      ctx,
      fullHotline,
      logicalW / 2,
      outerPad + mediaH + footerBandH / 2,
      logicalW - outerPad * 2,
      template
    );
  } else if (template.id === 'minimal_diagonal_prism') {
    const slantX = Math.round(logicalW * 0.068);
    const midX = logicalW / 2;

    // Left (Before) full-bleed diagonal clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(midX + slantX, 0);
    ctx.lineTo(midX - slantX, logicalH);
    ctx.lineTo(0, logicalH);
    ctx.closePath();
    ctx.clip();
    if (beforeImg) {
      drawTransformedImage(ctx, beforeImg, { x: 0, y: 0, width: midX + slantX, height: logicalH }, beforeAdj);
    }
    ctx.restore();

    // Right (After) full-bleed diagonal clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(midX + slantX, 0);
    ctx.lineTo(logicalW, 0);
    ctx.lineTo(logicalW, logicalH);
    ctx.lineTo(midX - slantX, logicalH);
    ctx.closePath();
    ctx.clip();
    if (afterImg) {
      drawTransformedImage(
        ctx,
        afterImg,
        { x: midX - slantX, y: 0, width: logicalW - (midX - slantX), height: logicalH },
        afterAdj
      );
    }
    ctx.restore();

    // Iridescent Platinum-Rose Crystal Diagonal Seam
    ctx.save();
    ctx.lineWidth = 5;
    const seamGrad = ctx.createLinearGradient(midX + slantX, 0, midX - slantX, logicalH);
    seamGrad.addColorStop(0, '#F8FAFC');
    seamGrad.addColorStop(0.5, '#F472B6');
    seamGrad.addColorStop(1, '#C084FC');
    ctx.strokeStyle = seamGrad;
    ctx.shadowColor = 'rgba(244, 114, 182, 0.75)';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(midX + slantX, 0);
    ctx.lineTo(midX - slantX, logicalH);
    ctx.stroke();

    // Fine white specular center highlight inside seam
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(midX + slantX, 0);
    ctx.lineTo(midX - slantX, logicalH);
    ctx.stroke();
    ctx.restore();

    // Subtle bottom contrast scrim so floating Zalo glass bar stays razor readable
    ctx.save();
    const scrimH = Math.min(200, logicalH * 0.22);
    const scrimGrad = ctx.createLinearGradient(0, logicalH - scrimH, 0, logicalH);
    scrimGrad.addColorStop(0, 'rgba(7, 9, 19, 0)');
    scrimGrad.addColorStop(0.55, 'rgba(7, 9, 19, 0.55)');
    scrimGrad.addColorStop(1, 'rgba(7, 9, 19, 0.88)');
    ctx.fillStyle = scrimGrad;
    ctx.fillRect(0, logicalH - scrimH, logicalW, scrimH);
    ctx.restore();

    // Diamond Prism VS emblem positioned slightly above center (keeps bottom open for faces + CTA)
    if (vsText) {
      const t = 0.44;
      const vsX = (midX + slantX) * (1 - t) + (midX - slantX) * t;
      const vsY = logicalH * t;
      drawDiamondVsMedallion(ctx, vsText, vsX, vsY, '#0B0E1D', '#F472B6', '#F8FAFC', 22);
    }

    drawStylizedBadge(ctx, beforeText, logicalW * 0.24, 48, false, template);
    drawStylizedBadge(ctx, afterText, logicalW * 0.76, 48, true, template);

    drawLuxuryZaloCTA(
      ctx,
      fullHotline,
      logicalW / 2,
      logicalH - (isBanner ? 48 : 58),
      logicalW - 80,
      template
    );
  } else if (template.id === 'minimal_arch_editorial') {
    const outerPad = isBanner ? 20 : 28;
    const footerBandH = isBanner ? 88 : ratio === '9:16' ? 128 : 108;
    const gap = isBanner ? 16 : 22;
    const mediaW = logicalW - outerPad * 2;
    const mediaH = logicalH - outerPad - footerBandH;
    const colW = (mediaW - gap) / 2;

    const beforeRect = { x: outerPad, y: outerPad, width: colW, height: mediaH };
    const afterRect = { x: outerPad + colW + gap, y: outerPad, width: colW, height: mediaH };
    const archTopR = Math.min(colW / 2, mediaH * 0.45);
    const archBotR = 16;

    const drawArchFrame = (
      rect: { x: number; y: number; width: number; height: number },
      img: HTMLImageElement | null,
      adj: ImageAdjustments,
      isAfterArch: boolean
    ) => {
      // Soft radial aura behind AFTER arch
      if (isAfterArch) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 157, 102, 0.26)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(rect.x - 6, rect.y - 6, rect.width + 12, rect.height + 12, [
          archTopR + 6,
          archTopR + 6,
          archBotR + 4,
          archBotR + 4,
        ]);
        ctx.stroke();
        ctx.restore();
      }

      // Clipped arched image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, [archTopR, archTopR, archBotR, archBotR]);
      ctx.clip();
      if (img) drawTransformedImage(ctx, img, rect, adj);
      ctx.restore();

      // Antique gold arch outline
      ctx.save();
      if (isAfterArch) {
        const gGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
        gGrad.addColorStop(0, '#B5844A');
        gGrad.addColorStop(0.5, '#F3DFC1');
        gGrad.addColorStop(1, '#C89D66');
        ctx.strokeStyle = gGrad;
        ctx.lineWidth = 2.6;
      } else {
        ctx.strokeStyle = 'rgba(200, 157, 102, 0.48)';
        ctx.lineWidth = 1.5;
      }
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.width, rect.height, [archTopR, archTopR, archBotR, archBotR]);
      ctx.stroke();
      ctx.restore();
    };

    drawArchFrame(beforeRect, beforeImg, beforeAdj, false);
    drawArchFrame(afterRect, afterImg, afterAdj, true);

    // Filigree vertical gold divider between the two arches
    const midX = outerPad + colW + gap / 2;
    ctx.save();
    const filGrad = ctx.createLinearGradient(midX, outerPad + 40, midX, outerPad + mediaH - 20);
    filGrad.addColorStop(0, 'rgba(200, 157, 102, 0)');
    filGrad.addColorStop(0.5, 'rgba(243, 223, 193, 0.65)');
    filGrad.addColorStop(1, 'rgba(200, 157, 102, 0)');
    ctx.strokeStyle = filGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, outerPad + 40);
    ctx.lineTo(midX, outerPad + mediaH - 20);
    ctx.stroke();
    ctx.restore();

    if (vsText) {
      drawDiamondVsMedallion(ctx, vsText, midX, outerPad + mediaH * 0.52, '#061210', '#C89D66', '#F3DFC1', 20);
    }

    // Place clean brass nameplates along the bottom edge inside each arch so curved tops breathe
    const badgeY = outerPad + mediaH - 34;
    drawStylizedBadge(ctx, beforeText, beforeRect.x + beforeRect.width / 2, badgeY, false, template);
    drawStylizedBadge(ctx, afterText, afterRect.x + afterRect.width / 2, badgeY, true, template);

    drawLuxuryZaloCTA(
      ctx,
      fullHotline,
      logicalW / 2,
      outerPad + mediaH + footerBandH / 2,
      mediaW,
      template
    );
  } else {
    // =========================================================================
    // STANDARD / KEPT TEMPLATES: luxury_gold, diagonal_split, minimal_consult
    // =========================================================================
    const { headerHeight, footerHeight } = getTemplateLayoutConfig(template.id, ratio);
    const isMinimalConsult = isMinimalOnlyTemplate(template.id);
    const bounds = calculateSideBySideBounds(logicalW, logicalH, headerHeight, footerHeight, 6);

    if (template.id === 'diagonal_split') {
      const slantX = 70;
      const midX = logicalW / 2;
      const topY = bounds.beforeRect.y;
      const botY = bounds.beforeRect.y + bounds.beforeRect.height;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.lineTo(midX + slantX, topY);
      ctx.lineTo(midX - slantX, botY);
      ctx.lineTo(0, botY);
      ctx.closePath();
      ctx.clip();
      if (beforeImg) {
        drawTransformedImage(ctx, beforeImg, { x: 0, y: topY, width: midX + slantX, height: botY - topY }, beforeAdj);
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(midX + slantX, topY);
      ctx.lineTo(logicalW, topY);
      ctx.lineTo(logicalW, botY);
      ctx.lineTo(midX - slantX, botY);
      ctx.closePath();
      ctx.clip();
      if (afterImg) {
        drawTransformedImage(
          ctx,
          afterImg,
          { x: midX - slantX, y: topY, width: logicalW - (midX - slantX), height: botY - topY },
          afterAdj
        );
      }
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 5;
      const seamGrad = ctx.createLinearGradient(midX + slantX, topY, midX - slantX, botY);
      seamGrad.addColorStop(0, '#EC4899');
      seamGrad.addColorStop(1, '#8B5CF6');
      ctx.strokeStyle = seamGrad;
      ctx.shadowColor = '#EC4899';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(midX + slantX, topY);
      ctx.lineTo(midX - slantX, botY);
      ctx.stroke();
      ctx.restore();
    } else {
      if (beforeImg) drawTransformedImage(ctx, beforeImg, bounds.beforeRect, beforeAdj);
      if (afterImg) drawTransformedImage(ctx, afterImg, bounds.afterRect, afterAdj);

      if (bounds.dividerPos) {
        ctx.save();
        ctx.lineWidth = 3;
        const divGrad = ctx.createLinearGradient(
          bounds.dividerPos.x1,
          bounds.dividerPos.y1,
          bounds.dividerPos.x2,
          bounds.dividerPos.y2
        );
        divGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        divGrad.addColorStop(0.5, template.accentGold ? '#D4AF37' : template.primaryColor);
        divGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.strokeStyle = divGrad;
        ctx.beginPath();
        ctx.moveTo(bounds.dividerPos.x1, bounds.dividerPos.y1);
        ctx.lineTo(bounds.dividerPos.x2, bounds.dividerPos.y2);
        ctx.stroke();

        if (vsText) {
          const midX = (bounds.dividerPos.x1 + bounds.dividerPos.x2) / 2;
          const midY = (bounds.dividerPos.y1 + bounds.dividerPos.y2) / 2;
          ctx.fillStyle = template.bgColor;
          ctx.strokeStyle = template.primaryColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(midX, midY, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.shadowColor = 'transparent';
          ctx.fillStyle = template.primaryColor;
          ctx.font = 'bold 14px Montserrat, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(vsText, midX, midY + 1, 42);
        }
        ctx.restore();
      }
    }

    // Badges
    drawStylizedBadge(
      ctx,
      beforeText,
      bounds.beforeRect.x + bounds.beforeRect.width / 2,
      bounds.beforeRect.y + 44,
      false,
      template
    );
    drawStylizedBadge(
      ctx,
      afterText,
      bounds.afterRect.x + bounds.afterRect.width / 2,
      bounds.afterRect.y + 44,
      true,
      template
    );

    // Header (Skipped for minimal_consult)
    const headerH = bounds.headerRect.height;
    if (!isMinimalConsult && headerH > 0) {
      ctx.save();

      const goldGrad = ctx.createLinearGradient(0, 0, 0, headerH);
      goldGrad.addColorStop(0, 'rgba(5, 7, 13, 0.98)');
      goldGrad.addColorStop(1, 'rgba(15, 20, 32, 0.94)');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, logicalW, headerH);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = template.accentGold ? '#D4AF37' : template.primaryColor;
      ctx.beginPath();
      ctx.moveTo(0, headerH);
      ctx.lineTo(logicalW, headerH);
      ctx.stroke();

      const logoSize = 74;
      const logoX = 45;
      const logoY = (headerH - logoSize) / 2;

      if (logoImg) {
        const cx = logoX + logoSize / 2;
        const cy = logoY + logoSize / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.clip();

        const innerPad = logoSize * 0.14;
        const avail = logoSize - innerPad * 2;
        const imgAspect = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
        let drawW = avail;
        let drawH = avail;
        if (imgAspect > 1) {
          drawH = avail / imgAspect;
        } else {
          drawW = avail * imgAspect;
        }
        ctx.drawImage(logoImg, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
        ctx.restore();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = template.accentGold ? '#D4AF37' : template.primaryColor;
        ctx.beginPath();
        ctx.arc(cx, cy, logoSize / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      let badgeRightEdge = logicalW - 45;
      const badgeText = (branding.trustBadge ?? '').trim();
      if (badgeText) {
        const bText = badgeText.toUpperCase();
        ctx.font = 'bold 12px Montserrat, sans-serif';
        const bW = ctx.measureText(bText).width + 30;
        const bH = 36;
        const bX = logicalW - bW - 45;
        const bY = headerH / 2 - bH / 2;
        badgeRightEdge = bX - 20;

        ctx.fillStyle = template.accentGold ? 'rgba(212, 175, 55, 0.15)' : 'rgba(236, 72, 153, 0.15)';
        ctx.strokeStyle = template.accentGold ? '#D4AF37' : template.primaryColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = template.accentGold ? '#F3E5AB' : '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bText, bX + bW / 2, headerH / 2);
      }

      const textStartX = logoImg ? logoX + logoSize + 24 : 45;
      const maxTextW = Math.max(240, badgeRightEdge - textStartX);
      const mainFont =
        template.fontHeading === 'serif'
          ? 'bold 27px "Playfair Display", Georgia, serif'
          : 'bold 26px Montserrat, "Plus Jakarta Sans", sans-serif';

      const cleanName = (branding.brandName ?? '').trim().toUpperCase();
      const dashSplit = cleanName.split(/\s+-\s+/);
      const primaryLine = dashSplit.length >= 2 ? dashSplit[0].trim() : cleanName;
      const secondaryRaw =
        dashSplit.length >= 2
          ? dashSplit.slice(1).join(' - ').trim()
          : (branding.subTitle ?? '').trim();
      const secondaryLine = secondaryRaw.toUpperCase();
      const subColor = template.accentGold ? '#D4AF37' : template.secondaryColor;

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      if (primaryLine && secondaryLine) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = mainFont;
        ctx.fillText(primaryLine, textStartX, headerH / 2 - 14, maxTextW);

        ctx.fillStyle = subColor;
        ctx.font = 'bold 16px Montserrat, "Plus Jakarta Sans", sans-serif';
        ctx.fillText(secondaryLine, textStartX, headerH / 2 + 18, maxTextW);
      } else if (primaryLine) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = mainFont;
        ctx.fillText(primaryLine, textStartX, headerH / 2, maxTextW);
      } else if (secondaryLine) {
        ctx.fillStyle = subColor;
        ctx.font = 'bold 16px Montserrat, "Plus Jakarta Sans", sans-serif';
        ctx.fillText(secondaryLine, textStartX, headerH / 2, maxTextW);
      }

      ctx.restore();
    }

    // Footer
    ctx.save();
    const footerY = bounds.footerRect.y;
    const footerH = bounds.footerRect.height;
    const paddingX = 45;

    const footerGrad = ctx.createLinearGradient(0, footerY, 0, logicalH);
    footerGrad.addColorStop(0, 'rgba(8, 12, 22, 0.98)');
    footerGrad.addColorStop(1, 'rgba(3, 5, 12, 0.99)');
    ctx.fillStyle = footerGrad;
    ctx.fillRect(0, footerY, logicalW, footerH);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = template.accentGold ? '#D4AF37' : template.primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, footerY);
    ctx.lineTo(logicalW, footerY);
    ctx.stroke();

    if (isMinimalConsult) {
      drawLuxuryZaloCTA(ctx, fullHotline, logicalW / 2, footerY + footerH / 2, logicalW - paddingX * 2, template);
    } else {
      // ROW 1: PROMINENT PROCEDURE / SERVICE NAME
      const row1Y = footerY + (isBanner ? 30 : 38);
      const serviceAlign = branding.serviceAlign ?? 'left';
      const serviceX = getAlignedTextX(serviceAlign, logicalW, paddingX);
      ctx.textAlign = serviceAlign;
      ctx.textBaseline = 'middle';

      const rawService = (branding.serviceName ?? 'NÂNG MŨI CẤU TRÚC SURGIFORM S-LINE').toUpperCase();
      ctx.font = `bold 28px ${resolveFontFamily(branding.serviceFont, 'sans')}`;
      ctx.fillStyle = template.accentGold ? '#F9E79F' : template.primaryColor;
      ctx.fillText(rawService, serviceX, row1Y, logicalW - paddingX * 2);

      // ROW 2: EDITABLE SUBTITLE BELOW SERVICE NAME
      const row2Y = footerY + (isBanner ? 68 : 82);
      const fallbackSubtitle =
        branding.showDoctor !== false && branding.doctorName
          ? `👨‍⚕️ Bác sĩ thực hiện: ${branding.doctorName}${branding.doctorTitle ? ` · ${branding.doctorTitle}` : ''}`
          : '';
      const row2Text =
        branding.serviceSubtitle !== undefined ? branding.serviceSubtitle.trim() : fallbackSubtitle;

      if (row2Text) {
        const doctorAlign = branding.doctorAlign ?? 'left';
        const row2X = getAlignedTextX(doctorAlign, logicalW, paddingX);
        const chosenDocFont = branding.doctorFont ?? 'sans';
        ctx.textAlign = doctorAlign;
        ctx.font = `600 16px ${resolveFontFamily(chosenDocFont, 'sans')}`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(row2Text, row2X, row2Y, logicalW - paddingX * 2);
      }

      // ROW 3: HOTLINE BUTTON + PROMO TEXT
      const row3Y = footerY + (isBanner ? 116 : 142);
      ctx.textAlign = 'left';

      let phoneW = 0;
      if (fullHotline) {
        ctx.font = 'bold 26px Montserrat, sans-serif';
        const phoneMetrics = ctx.measureText(fullHotline);
        const iconGap = 30;
        phoneW = phoneMetrics.width + iconGap + 46;
        const phoneH = 56;

        const phoneGrad = ctx.createLinearGradient(paddingX, row3Y - phoneH / 2, paddingX + phoneW, row3Y + phoneH / 2);
        phoneGrad.addColorStop(0, '#E11D48');
        phoneGrad.addColorStop(1, '#BE123C');
        ctx.fillStyle = phoneGrad;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.55)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.roundRect(paddingX, row3Y - phoneH / 2, phoneW, phoneH, 28);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(paddingX + 31, row3Y, 14, 0, Math.PI * 2);
        ctx.fill();
        drawVectorPhoneIcon(ctx, paddingX + 31, row3Y, 9, '#FFFFFF');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(fullHotline, paddingX + 23 + iconGap, row3Y + 1);
      }

      const hasExtra = (branding.showAddress && branding.address) || (branding.showSocial && (branding.fanpage || branding.website));
      if (hasExtra) {
        const extraX = phoneW > 0 ? paddingX + phoneW + 30 : paddingX;
        ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        if (branding.showAddress && branding.address) {
          ctx.fillText(`📍 ${branding.address}`, extraX, row3Y - 11);
        }
        if (branding.showSocial && (branding.fanpage || branding.website)) {
          const social = [branding.fanpage ? `FB: ${branding.fanpage}` : '', branding.website ? `Web: ${branding.website}` : '']
            .filter(Boolean)
            .join(' · ');
          ctx.fillText(`🌐 ${social}`, extraX, row3Y + 11);
        }
      } else {
        const promoLine = (branding.promoText ?? '⚡ TƯ VẤN 24/7 · NHẬN ƯU ĐÃI THÁNG NÀY').trim();
        if (promoLine) {
          ctx.textAlign = 'right';
          ctx.font = '600 16px Montserrat, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          const maxPromoW = Math.max(120, logicalW - paddingX * 2 - (phoneW > 0 ? phoneW + 24 : 0));
          ctx.fillText(promoLine, logicalW - paddingX, row3Y, maxPromoW);
        }
      }
    }

    ctx.restore();
  }

  // 7. Security Watermark (adaptive contrast for dark vs ivory light templates)
  if (branding.showWatermark && branding.watermarkText.trim()) {
    ctx.save();
    ctx.translate(logicalW / 2, logicalH / 2);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.font = 'bold 28px Montserrat, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isLightTheme ? 'rgba(30, 24, 26, 0.16)' : 'rgba(255, 255, 255, 0.2)';
    ctx.shadowColor = isLightTheme ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(branding.watermarkText.trim(), 0, 0, logicalW * 0.9);
    ctx.restore();
  }

  ctx.restore();
}
