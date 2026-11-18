export type FacebookRatio = '1:1' | '4:5' | '9:16' | '16:9' | '1.91:1';

export interface RatioOption {
  id: FacebookRatio;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  iconName: string;
}

export type TemplateId =
  | 'luxury_gold'
  | 'medical_blue'
  | 'korean_minimal'
  | 'noir_elegance'
  | 'diagonal_split'
  | 'dual_circle'
  | 'magazine_cover'
  | 'clinical_record'
  | 'soft_rose'
  | 'top_bottom_split';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: 'Sang trọng' | 'Chuẩn y khoa' | 'Hàn Quốc' | 'Hiện đại';
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  fontHeading: 'serif' | 'sans';
  accentGold?: boolean;
}

export interface ImageAdjustments {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number; // degrees
  flipH: boolean;
  flipV: boolean;
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  saturation: number; // 0 to 200 %
  smoothSkin: number; // 0 to 100 % (soft focus / glow)
  privacyBar: {
    enabled: boolean;
    type: 'black_bar' | 'blur';
    yPercent: number; // 0 to 100 % from top
    heightPercent: number; // height in percent
  };
}

export interface BrandingData {
  brandName: string;
  subTitle: string;
  logoUrl: string;
  doctorName: string;
  doctorTitle: string;
  serviceName: string;
  beforeLabel: string;
  afterLabel: string;
  hotline: string;
  hotlineLabel?: string;
  address: string;
  website: string;
  fanpage: string;
  showAddress?: boolean;
  showSocial?: boolean;
  showDoctor?: boolean;
  showWatermark: boolean;
  watermarkText: string;
  trustBadge: string;
  accentColor: string;
  badgeStyle: 'modern_pill' | 'gold_ribbon' | 'clinical_stamp' | 'minimal_text';
}

export interface SurgeryCasePreset {
  id: string;
  title: string;
  service: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImg: string;
  afterImg: string;
}
