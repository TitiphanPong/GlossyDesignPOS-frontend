export type ArtworkTone = 'positive' | 'negative';

export type ArtworkInfoCard = {
  title: string;
  emphasis?: string;
  body: string;
  visual: 'files' | 'image' | 'original' | 'screenshot' | 'pixelated' | 'small-file';
};

export type ArtworkColumn = {
  label: string;
  tone: ArtworkTone;
  cards: ArtworkInfoCard[];
};

export type PremiumEditorialArtworkData = {
  width: 1080;
  height: 1350;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  visual: {
    provider: 'local-placeholder' | 'generated-asset';
    alt: string;
  };
  columns: [ArtworkColumn, ArtworkColumn];
  tip: string;
  tipAccent: string;
  footer: {
    services: string[];
    cta: string;
  };
};

export function truncateThaiText(value: string, maxGraphemes: number) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || maxGraphemes <= 0) return '';

  const Segmenter = Intl.Segmenter;
  const segments = Array.from(new Segmenter('th', { granularity: 'grapheme' }).segment(normalized), item => item.segment);
  if (segments.length <= maxGraphemes) return normalized;
  return `${segments.slice(0, maxGraphemes - 1).join('')}…`;
}

export const printFileArtworkSample: PremiumEditorialArtworkData = {
  width: 1080,
  height: 1350,
  eyebrow: 'GLOSSY PRINT GUIDE',
  headline: 'ไฟล์แบบไหน',
  headlineAccent: 'ปริ้นสวย?',
  subheadline: 'ไฟล์ดี งานพิมพ์ออกมาคมชัด สีตรงใจ และลดเวลาตรวจแก้ก่อนผลิต',
  visual: {
    provider: 'local-placeholder',
    alt: 'โฟลเดอร์งานพิมพ์พร้อมไฟล์ PNG PDF และ AI',
  },
  columns: [
    {
      label: 'DO',
      tone: 'positive',
      cards: [
        { title: 'ใช้ไฟล์', emphasis: 'PNG / PDF / AI', body: 'ไฟล์มาตรฐาน คมชัด พร้อมส่งผลิต', visual: 'files' },
        { title: 'ใช้ภาพ', emphasis: 'ความละเอียดสูง', body: 'รายละเอียดครบ งานพิมพ์ยังดูคมเมื่อขยาย', visual: 'image' },
        { title: 'ส่งไฟล์', emphasis: 'Original', body: 'ไฟล์ต้นฉบับไม่ถูกบีบอัด แก้ไขต่อได้ง่าย', visual: 'original' },
      ],
    },
    {
      label: "DON'T",
      tone: 'negative',
      cards: [
        { title: 'แคปภาพจาก', emphasis: 'Facebook', body: 'ความละเอียดต่ำและผ่านการบีบอัด', visual: 'screenshot' },
        { title: 'ภาพแตก / เบลอ', body: 'รายละเอียดหาย ขอบภาพไม่คมเมื่อนำไปพิมพ์', visual: 'pixelated' },
        { title: 'ส่งไฟล์', emphasis: 'เล็กเกินไป', body: 'ไฟล์ถูกบีบอัดจนข้อมูลภาพไม่เพียงพอ', visual: 'small-file' },
      ],
    },
  ],
  tip: 'ไฟล์ดี งานพิมพ์สวย',
  tipAccent: 'เช็กต้นฉบับก่อนส่ง ช่วยลดเวลาตรวจแก้และพิมพ์ซ้ำ',
  footer: {
    services: ['งานพิมพ์', 'สื่อโฆษณา', 'มีเดียโปรดักชัน'],
    cta: 'ส่งไฟล์ให้เราช่วยเช็กได้',
  },
};
