import { BrandingData, FacebookRatio, ImageAdjustments, TemplateDefinition } from '../types';
import {
  calculateSideBySideBounds,
  calculateTopBottomBounds,
  formatPhoneNumber,
  getDimensionsForRatio,
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

  // Create clip path for target rectangle
  ctx.beginPath();
  ctx.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height);
  ctx.clip();

  // Calculate cover dimensions
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

  // Center coordinates of target box
  const centerX = targetRect.x + targetRect.width / 2 + adj.offsetX;
  const centerY = targetRect.y + targetRect.height / 2 + adj.offsetY;

  ctx.translate(centerX, centerY);

  // Rotation
  if (adj.rotation !== 0) {
    ctx.rotate((adj.rotation * Math.PI) / 180);
  }

  // Flip
  const scaleX = (adj.flipH ? -1 : 1) * adj.scale;
  const scaleY = (adj.flipV ? -1 : 1) * adj.scale;
  ctx.scale(scaleX, scaleY);

  // Apply filters
  const filters: string[] = [];
  if (adj.brightness !== 100) filters.push(`brightness(${adj.brightness}%)`);
  if (adj.contrast !== 100) filters.push(`contrast(${adj.contrast}%)`);
  if (adj.saturation !== 100) filters.push(`saturate(${adj.saturation}%)`);
  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }

  // Draw image centered
  const drawW = baseW;
  const drawH = baseH;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.filter = 'none';

  // Apply skin smooth glow if requested
  if (adj.smoothSkin > 0) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = adj.smoothSkin / 150;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
  }

  // Draw eye privacy bar if enabled
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

      // Privacy subtle lock text
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
 * Draw large, distinctive Before / After badges tailored per template style
 */
function drawStylizedBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  isAfter: boolean,
  template: TemplateDefinition
) {
  ctx.save();

  // Very bold 24px font for instant visibility on Facebook feed
  ctx.font = 'bold 24px Montserrat, "Plus Jakarta Sans", sans-serif';
  const textMetrics = ctx.measureText(text);
  const paddingX = 28;
  const badgeWidth = Math.max(textMetrics.width + paddingX * 2, 230);
  const badgeHeight = 52;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  if (template.id === 'luxury_gold') {
    const slant = 14;
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, '#AA771C');
      bgGrad.addColorStop(0.3, '#F9E79F');
      bgGrad.addColorStop(0.7, '#D4AF37');
      bgGrad.addColorStop(1, '#8A5D10');
    } else {
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#1E293B');
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
    ctx.strokeStyle = isAfter ? '#FFFFFF' : '#D4AF37';
    ctx.stroke();

    ctx.fillStyle = isAfter ? '#090D16' : '#F9E79F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  } else if (template.id === 'medical_blue' || template.id === 'clinical_record') {
    ctx.fillStyle = isAfter ? '#0284C7' : '#0F172A';
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 8);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = isAfter ? '#38BDF8' : 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${isAfter ? '✓ ' : '• '}${text}`, x, y + 1);
  } else if (template.id === 'korean_minimal' || template.id === 'soft_rose') {
    const bgGrad = ctx.createLinearGradient(x - badgeWidth / 2, y, x + badgeWidth / 2, y);
    if (isAfter) {
      bgGrad.addColorStop(0, template.primaryColor);
      bgGrad.addColorStop(1, template.secondaryColor);
    } else {
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bgGrad.addColorStop(1, 'rgba(240, 240, 240, 0.95)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 26);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = isAfter ? '#1A0C11' : '#2D3748';
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

  // 1. Fill base canvas background
  const bgGrad = ctx.createLinearGradient(0, 0, logicalW, logicalH);
  bgGrad.addColorStop(0, template.bgColor);
  bgGrad.addColorStop(1, '#05070E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, logicalW, logicalH);

  // 2. Responsive Header & Footer sizing
  const isStory = ratio === '9:16';
  const isBanner = ratio === '16:9' || ratio === '1.91:1';
  const headerHeight = isStory ? 230 : isBanner ? 135 : 160;
  // Dedicated roomy footer to hold large procedure title, doctor info, and massive hotline
  const footerHeight = isStory ? 270 : isBanner ? 165 : 205;

  let bounds;
  if (template.id === 'top_bottom_split') {
    bounds = calculateTopBottomBounds(logicalW, logicalH, headerHeight, footerHeight, 6);
  } else {
    bounds = calculateSideBySideBounds(logicalW, logicalH, headerHeight, footerHeight, 6);
  }

  // 3. Draw Comparison Images
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
      drawTransformedImage(ctx, afterImg, { x: midX - slantX, y: topY, width: logicalW - (midX - slantX), height: botY - topY }, afterAdj);
    }
    ctx.restore();

    // Neon angled dividing line
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
  } else if (template.id === 'dual_circle') {
    const radius = Math.min(bounds.beforeRect.width, bounds.beforeRect.height) * 0.44;
    const beforeCenter = { x: bounds.beforeRect.x + bounds.beforeRect.width / 2, y: bounds.beforeRect.y + bounds.beforeRect.height / 2 };
    const afterCenter = { x: bounds.afterRect.x + bounds.afterRect.width / 2, y: bounds.afterRect.y + bounds.afterRect.height / 2 };

    // Before Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(beforeCenter.x, beforeCenter.y, radius, 0, Math.PI * 2);
    ctx.clip();
    if (beforeImg) {
      drawTransformedImage(ctx, beforeImg, { x: beforeCenter.x - radius, y: beforeCenter.y - radius, width: radius * 2, height: radius * 2 }, beforeAdj);
    }
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(beforeCenter.x, beforeCenter.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // After Circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(afterCenter.x, afterCenter.y, radius, 0, Math.PI * 2);
    ctx.clip();
    if (afterImg) {
      drawTransformedImage(ctx, afterImg, { x: afterCenter.x - radius, y: afterCenter.y - radius, width: radius * 2, height: radius * 2 }, afterAdj);
    }
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 7;
    ctx.strokeStyle = template.primaryColor;
    ctx.shadowColor = template.primaryColor;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(afterCenter.x, afterCenter.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else {
    if (beforeImg) {
      drawTransformedImage(ctx, beforeImg, bounds.beforeRect, beforeAdj);
    }
    if (afterImg) {
      drawTransformedImage(ctx, afterImg, bounds.afterRect, afterAdj);
    }

    // Center seam
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

      ctx.fillStyle = template.primaryColor;
      ctx.font = 'bold 14px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VS', midX, midY + 1);
      ctx.restore();
    }
  }

  // 4. Draw Badges: "TRƯỚC" and "SAU"
  const beforeBadgeX =
    template.id === 'top_bottom_split'
      ? bounds.beforeRect.x + bounds.beforeRect.width / 2
      : bounds.beforeRect.x + bounds.beforeRect.width / 2;
  const beforeBadgeY = bounds.beforeRect.y + 44;

  const afterBadgeX =
    template.id === 'top_bottom_split'
      ? bounds.afterRect.x + bounds.afterRect.width / 2
      : bounds.afterRect.x + bounds.afterRect.width / 2;
  const afterBadgeY = bounds.afterRect.y + 44;

  drawStylizedBadge(ctx, branding.beforeLabel || 'TRƯỚC PHẪU THUẬT', beforeBadgeX, beforeBadgeY, false, template);
  drawStylizedBadge(ctx, branding.afterLabel || 'SAU PHẪU THUẬT', afterBadgeX, afterBadgeY, true, template);

  // ---------------------------------------------------------
  // 5. STYLIZED HEADER ARCHITECTURE (Distinct per Template!)
  // ---------------------------------------------------------
  ctx.save();
  const headerH = bounds.headerRect.height;

  const drawCircularHeaderLogo = (
    img: HTMLImageElement,
    x: number,
    y: number,
    size: number,
    ringColor: string,
    ringWidth: number
  ) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip();

    // Preserve aspect ratio with safe padding so wide/tall logos never distort or clip
    const innerPad = size * 0.14;
    const avail = size - innerPad * 2;
    const imgAspect = img.naturalWidth / (img.naturalHeight || 1);
    let drawW = avail;
    let drawH = avail;
    if (imgAspect > 1) {
      drawH = avail / imgAspect;
    } else {
      drawW = avail * imgAspect;
    }
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    ctx.restore();

    ctx.lineWidth = ringWidth;
    ctx.strokeStyle = ringColor;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawHeaderBrandText = (
    rawName: string,
    defaultSubtitle: string,
    textStartX: number,
    maxTextW: number,
    mainFont: string,
    subFont: string,
    subColor: string,
    useUppercase: boolean = false
  ) => {
    const cleanName = (rawName || 'BỆNH VIỆN ĐA KHOA HẢI VÂN - KHOA PHẪU THUẬT THẨM MỸ').trim();
    const displayText = useUppercase ? cleanName.toUpperCase() : cleanName;
    const dashSplit = displayText.split(/\s+-\s+/);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (dashSplit.length >= 2) {
      const primaryLine = dashSplit[0].trim();
      const secondaryLine = dashSplit.slice(1).join(' - ').trim();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = mainFont;
      ctx.fillText(primaryLine, textStartX, headerH / 2 - 14, maxTextW);

      ctx.fillStyle = subColor;
      ctx.font = subFont;
      ctx.fillText(secondaryLine, textStartX, headerH / 2 + 18, maxTextW);
    } else {
      ctx.fillStyle = subColor;
      ctx.font = subFont;
      ctx.fillText(defaultSubtitle, textStartX, headerH / 2 - 18, maxTextW);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = mainFont;
      ctx.fillText(displayText, textStartX, headerH / 2 + 14, maxTextW);
    }
  };

  if (template.id === 'magazine_cover') {
    // EDITORIAL MAGAZINE MASTHEAD
    const magGrad = ctx.createLinearGradient(0, 0, 0, headerH);
    magGrad.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    magGrad.addColorStop(1, 'rgba(10, 10, 10, 0.92)');
    ctx.fillStyle = magGrad;
    ctx.fillRect(0, 0, logicalW, headerH);

    const rawMag = (branding.brandName || 'BỆNH VIỆN ĐA KHOA HẢI VÂN - KHOA PHẪU THUẬT THẨM MỸ').toUpperCase();
    const magParts = rawMag.split(/\s+-\s+/);

    if (logoImg) {
      drawCircularHeaderLogo(logoImg, 45, (headerH - 64) / 2, 64, template.primaryColor, 2);
    }

    const centerAreaX = logoImg ? (logicalW + 64) / 2 : logicalW / 2;
    const maxMagW = logoImg ? logicalW - 190 : logicalW - 90;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(magParts[0], centerAreaX, headerH / 2 - 14, maxMagW);

    ctx.fillStyle = template.primaryColor;
    ctx.font = 'bold 15px Montserrat, sans-serif';
    ctx.fillText(
      magParts.length >= 2 ? magParts.slice(1).join(' - ') : 'KHOA PHẪU THUẬT THẨM MỸ · CHUẨN Y KHOA',
      centerAreaX,
      headerH / 2 + 22,
      maxMagW
    );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(logicalW * 0.15, headerH);
    ctx.lineTo(logicalW * 0.85, headerH);
    ctx.stroke();
  } else if (template.id === 'korean_minimal' || template.id === 'soft_rose') {
    // KOREAN MINIMALIST AIRY HEADER
    const korGrad = ctx.createLinearGradient(0, 0, 0, headerH);
    korGrad.addColorStop(0, 'rgba(20, 14, 18, 0.95)');
    korGrad.addColorStop(1, 'rgba(30, 20, 24, 0.85)');
    ctx.fillStyle = korGrad;
    ctx.fillRect(0, 0, logicalW, headerH);

    const logoSize = 68;
    const logoX = 45;
    const logoY = (headerH - logoSize) / 2;

    if (logoImg) {
      drawCircularHeaderLogo(logoImg, logoX, logoY, logoSize, template.primaryColor, 2);
    }

    let badgeRightEdge = logicalW - 45;
    if (branding.trustBadge) {
      ctx.font = 'bold 12px Montserrat, sans-serif';
      const bText = branding.trustBadge.toUpperCase();
      const bW = ctx.measureText(bText).width + 30;
      const bH = 34;
      const bX = logicalW - bW - 45;
      const bY = headerH / 2 - bH / 2;
      badgeRightEdge = bX - 20;

      ctx.fillStyle = 'rgba(226, 177, 166, 0.2)';
      ctx.strokeStyle = template.primaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bText, bX + bW / 2, headerH / 2);
    }

    const textStartX = logoImg ? logoX + logoSize + 22 : 45;
    const maxTextW = Math.max(240, badgeRightEdge - textStartX);
    drawHeaderBrandText(
      branding.brandName,
      'Gangnam Aesthetic Surgery & Medical Care',
      textStartX,
      maxTextW,
      'bold 26px "Plus Jakarta Sans", Montserrat, sans-serif',
      'bold 16px "Plus Jakarta Sans", Montserrat, sans-serif',
      template.primaryColor
    );
  } else if (template.id === 'medical_blue' || template.id === 'clinical_record') {
    // HOSPITAL CLINICAL BLUE HEADER
    const medGrad = ctx.createLinearGradient(0, 0, logicalW, headerH);
    medGrad.addColorStop(0, '#06162D');
    medGrad.addColorStop(1, '#0C2B56');
    ctx.fillStyle = medGrad;
    ctx.fillRect(0, 0, logicalW, headerH);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(0, headerH);
    ctx.lineTo(logicalW, headerH);
    ctx.stroke();

    const logoSize = 70;
    const logoX = 45;
    const logoY = (headerH - logoSize) / 2;

    if (logoImg) {
      drawCircularHeaderLogo(logoImg, logoX, logoY, logoSize, '#38BDF8', 2.5);
    }

    let badgeRightEdge = logicalW - 45;
    if (branding.trustBadge) {
      const bText = `🛡️ ${branding.trustBadge.toUpperCase()}`;
      ctx.font = 'bold 13px Montserrat, sans-serif';
      const bW = ctx.measureText(bText).width + 32;
      const bH = 38;
      const bX = logicalW - bW - 45;
      const bY = headerH / 2 - bH / 2;
      badgeRightEdge = bX - 20;

      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bText, bX + bW / 2, headerH / 2);
    }

    const textStartX = logoImg ? logoX + logoSize + 22 : 45;
    const maxTextW = Math.max(240, badgeRightEdge - textStartX);
    drawHeaderBrandText(
      branding.brandName,
      'CHUẨN Y KHOA QUỐC TẾ · AN TOÀN TUYỆT ĐỐI',
      textStartX,
      maxTextW,
      'bold 26px Montserrat, "Plus Jakarta Sans", sans-serif',
      'bold 16px Montserrat, "Plus Jakarta Sans", sans-serif',
      '#38BDF8',
      true
    );
  } else {
    // LUXURY GOLD & NOIR HEADER
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
      drawCircularHeaderLogo(
        logoImg,
        logoX,
        logoY,
        logoSize,
        template.accentGold ? '#D4AF37' : template.primaryColor,
        2.5
      );
    }

    let badgeRightEdge = logicalW - 45;
    if (branding.trustBadge) {
      const bText = branding.trustBadge.toUpperCase();
      ctx.font = 'bold 12px Montserrat, sans-serif';
      const bW = ctx.measureText(bText).width + 30;
      const bH = 36;
      const bX = logicalW - bW - 45;
      const bY = headerH / 2 - bH / 2;
      badgeRightEdge = bX - 20;

      ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
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
    drawHeaderBrandText(
      branding.brandName,
      (branding.subTitle || 'UY TÍN · AN TOÀN · CHUẨN Y KHOA').toUpperCase(),
      textStartX,
      maxTextW,
      mainFont,
      'bold 16px Montserrat, "Plus Jakarta Sans", sans-serif',
      template.accentGold ? '#D4AF37' : template.secondaryColor,
      true
    );
  }
  ctx.restore();

  // ---------------------------------------------------------
  // 6. STYLIZED FOOTER ARCHITECTURE (Spacious, Huge, Zero-Collision)
  // ---------------------------------------------------------
  ctx.save();
  const footerY = bounds.footerRect.y;
  const footerH = bounds.footerRect.height;
  const paddingX = 45;

  // Background
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

  // ROW 1: PROMINENT PROCEDURE / SERVICE NAME (Huge 28px!)
  const row1Y = footerY + (isBanner ? 30 : 38);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const rawService = (branding.serviceName || 'NÂNG MŨI CẤU TRÚC SURGIFORM S-LINE').toUpperCase();
  ctx.font = 'bold 28px Montserrat, "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = template.accentGold ? '#F9E79F' : template.primaryColor;
  ctx.fillText(rawService, paddingX, row1Y);

  // ROW 2: DOCTOR IN CHARGE & CLINIC CREDENTIALS (Clean, dedicated row - no collision!)
  const row2Y = footerY + (isBanner ? 68 : 82);
  if (branding.showDoctor !== false && branding.doctorName) {
    ctx.textAlign = 'left';
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const docTitle = branding.doctorTitle ? ` · ${branding.doctorTitle}` : '';
    ctx.fillText(`👨‍⚕️ Bác sĩ thực hiện: ${branding.doctorName}${docTitle}`, paddingX, row2Y);
  } else if (template.id === 'magazine_cover') {
    ctx.textAlign = 'left';
    ctx.font = 'italic 16px "Playfair Display", Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('"Đẳng cấp vẻ đẹp hoàn mỹ & sự tự tin tỏa sáng"', paddingX, row2Y);
  } else {
    ctx.textAlign = 'left';
    ctx.font = '600 15px Montserrat, sans-serif';
    ctx.fillStyle = template.secondaryColor;
    ctx.fillText('CAM KẾT KẾT QUẢ ĐẸP TỰ NHIÊN · BẢO HÀNH CHÍNH HÃNG', paddingX, row2Y);
  }

  // ROW 3: MASSIVE, HIGH-CONVERTING HOTLINE BUTTON
  const row3Y = footerY + (isBanner ? 116 : 142);
  ctx.textAlign = 'left';

  const formattedPhone = formatPhoneNumber(branding.hotline || '0988.123.456');
  const hotPrefix = (branding.hotlineLabel || 'HOTLINE / ZALO').toUpperCase();
  const fullHotline = `📞 ${hotPrefix}: ${formattedPhone}`;

  // Enlarge font to 26px bold
  ctx.font = 'bold 26px Montserrat, sans-serif';
  const phoneMetrics = ctx.measureText(fullHotline);
  const phoneW = phoneMetrics.width + 46;
  const phoneH = 56;

  // Hotline button gradient
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

  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(fullHotline, paddingX + 23, row3Y + 1);

  // Right side of hotline row: Address / Website if enabled, or high-intent CTA
  const hasExtra = (branding.showAddress && branding.address) || (branding.showSocial && (branding.fanpage || branding.website));
  if (hasExtra) {
    const extraX = paddingX + phoneW + 30;
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
    ctx.textAlign = 'right';
    ctx.font = '600 16px Montserrat, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('⚡ TƯ VẤN 24/7 · NHẬN ƯU ĐÃI THÁNG NÀY', logicalW - paddingX, row3Y);
  }

  ctx.restore();

  // 7. Security Watermark (if enabled)
  if (branding.showWatermark && branding.watermarkText.trim()) {
    ctx.save();
    ctx.translate(logicalW / 2, logicalH / 2);
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.font = 'bold 28px Montserrat, "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(branding.watermarkText.trim(), 0, 0, logicalW * 0.9);
    ctx.restore();
  }

  ctx.restore();
}
