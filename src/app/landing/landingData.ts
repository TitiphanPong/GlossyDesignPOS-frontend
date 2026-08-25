export type LandingHref = `/${string}` | `#${string}`;

export type LandingLink = Readonly<{
  label: string;
  href: LandingHref;
}>;

export type PopularService = Readonly<{
  id: string;
  title: string;
  description: string;
  href: LandingHref;
}>;

export type MainService = Readonly<{
  id: string;
  title: string;
  description: string;
  layout: 'featured' | 'wide' | 'standard';
  href: LandingHref;
}>;

export type ProcessStep = Readonly<{
  step: `0${1 | 2 | 3 | 4 | 5}`;
  title: string;
  description: string;
}>;

export type Advantage = Readonly<{
  title: string;
  description: string;
}>;

export type ShowcaseItem = Readonly<{
  id: string;
  title: string;
  description: string;
  href: LandingHref;
  image: Readonly<{
    src: `/covers/${string}.png`;
    alt: string;
    width: 1254;
    height: 1254;
  }>;
}>;

export const landingNavItems = [
  { label: 'หน้าแรก', href: '#top' },
  { label: 'บริการ', href: '#services' },
  { label: 'งานพิมพ์ยอดนิยม', href: '#popular' },
  { label: 'ตัวอย่างงาน', href: '#showcase' },
  { label: 'ขั้นตอน', href: '#process' },
  { label: 'ทำไมต้องเรา', href: '#why' },
  { label: 'ติดต่อ', href: '#contact' },
] as const satisfies readonly LandingLink[];

export const landingFooterLinks = {
  navigation: landingNavItems,
  actions: [
    { label: 'ส่งไฟล์งาน', href: '/upload' },
    { label: 'ดูบริการทั้งหมด', href: '#services' },
    { label: 'สำหรับพนักงาน', href: '/login' },
  ],
  legal: [
    { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy-policy' },
    { label: 'ข้อกำหนดการใช้งาน', href: '/terms' },
  ],
} as const satisfies Readonly<{
  navigation: readonly LandingLink[];
  actions: readonly LandingLink[];
  legal: readonly LandingLink[];
}>;

export const landingContact = {
  phoneDisplay: '081-555-2929',
  phoneHref: 'tel:0815552929',
  email: 'glossy2929@gmail.com',
  emailHref: 'mailto:glossy2929@gmail.com',
  address: 'ซีคอนสแควร์ ชั้น B1 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพฯ 10250',
} as const;

export const popularServices = [
  {
    id: 'print-a4',
    title: 'Print A4',
    description: 'งานพิมพ์เอกสารขนาด A4 สำหรับงานทั่วไป รายงาน และเอกสารประกอบ',
    href: '/upload',
  },
  {
    id: 'print-a3',
    title: 'Print A3',
    description: 'งานพิมพ์เอกสารขนาด A3 ที่ต้องการพื้นที่สำหรับแบบ ภาพ หรือตาราง',
    href: '/upload',
  },
  {
    id: 'name-card',
    title: 'นามบัตร',
    description: 'งานนามบัตรสำหรับบุคคล ธุรกิจ และทีมงาน',
    href: '/upload',
  },
  {
    id: 'sticker',
    title: 'สติกเกอร์',
    description: 'งานสติกเกอร์สำหรับฉลาก บรรจุภัณฑ์ ป้าย และงานตกแต่ง',
    href: '/upload',
  },
  {
    id: 'poster',
    title: 'โปสเตอร์',
    description: 'งานโปสเตอร์สำหรับประชาสัมพันธ์ นิทรรศการ และสื่อหน้าร้าน',
    href: '/upload',
  },
  {
    id: 'photo',
    title: 'รูปถ่าย',
    description: 'งานพิมพ์ภาพถ่ายสำหรับใช้งาน จัดแสดง หรือเก็บเป็นที่ระลึก',
    href: '/upload',
  },
  {
    id: 'inkjet',
    title: 'Inkjet',
    description: 'งานพิมพ์อิงค์เจ็ทสำหรับภาพ ป้าย และสื่อขนาดใหญ่',
    href: '/upload',
  },
] as const satisfies readonly PopularService[];

export const mainServices = [
  {
    id: 'document-printing',
    title: 'เอกสาร / ถ่ายเอกสาร',
    description: 'พิมพ์และถ่ายเอกสารสำหรับงานทั่วไป รายงาน และชุดเอกสาร',
    layout: 'featured',
    href: '/upload',
  },
  {
    id: 'name-card',
    title: 'นามบัตร',
    description: 'นามบัตรสำหรับบุคคลและทีมงาน พร้อมรายละเอียดที่สื่อสารตัวตนได้ชัดเจน',
    layout: 'standard',
    href: '/upload',
  },
  {
    id: 'sticker',
    title: 'สติกเกอร์',
    description: 'สติกเกอร์สำหรับแบรนด์ สินค้า บรรจุภัณฑ์ และงานตกแต่ง',
    layout: 'wide',
    href: '/upload',
  },
  {
    id: 'inkjet-poster',
    title: 'Inkjet / โปสเตอร์',
    description: 'สื่อพิมพ์สำหรับป้าย ภาพประกอบ โปสเตอร์ และงานนำเสนอขนาดใหญ่',
    layout: 'wide',
    href: '/upload',
  },
  {
    id: 'binding',
    title: 'เข้าเล่ม',
    description: 'จัดชุดเอกสารและเข้าเล่มให้เหมาะกับรายงาน คู่มือ และเอกสารนำเสนอ',
    layout: 'standard',
    href: '/upload',
  },
  {
    id: 'stamp',
    title: 'ตรายาง',
    description: 'ตรายางสำหรับธุรกิจ สำนักงาน และงานเอกสาร',
    layout: 'standard',
    href: '/upload',
  },
  {
    id: 'premium-product',
    title: 'Premium Product',
    description: 'งานพรีเมียมสำหรับแบรนด์ กิจกรรม และของที่ระลึก',
    layout: 'standard',
    href: '/upload',
  },
  {
    id: 'design',
    title: 'งานออกแบบ',
    description: 'จัดวางเนื้อหาและภาพสำหรับสื่อสิ่งพิมพ์ก่อนส่งผลิต',
    layout: 'featured',
    href: '/upload',
  },
] as const satisfies readonly MainService[];

export const processSteps = [
  {
    step: '01',
    title: 'ส่งไฟล์',
    description: 'อัปโหลดไฟล์งานผ่านระบบ',
  },
  {
    step: '02',
    title: 'แจ้งรายละเอียด',
    description: 'ระบุขนาด วัสดุ จำนวน และรายละเอียดที่ต้องการ',
  },
  {
    step: '03',
    title: 'เช็กราคา',
    description: 'ตรวจรายการและราคาก่อนเริ่มงาน',
  },
  {
    step: '04',
    title: 'ผลิต',
    description: 'ตรวจไฟล์และดำเนินการผลิตตามรายละเอียดงาน',
  },
  {
    step: '05',
    title: 'รับงาน',
    description: 'รับชิ้นงานเมื่อผลิตเสร็จ',
  },
] as const satisfies readonly ProcessStep[];

export const advantages = [
  {
    title: 'รองรับงานด่วน',
    description: 'พูดคุยความต้องการและกำหนดเวลาก่อนเริ่มผลิต',
  },
  {
    title: 'รองรับไฟล์หลากหลาย',
    description: 'ส่งไฟล์งานผ่านระบบเพื่อให้ทีมงานตรวจรายละเอียด',
  },
  {
    title: 'ตรวจไฟล์ก่อนผลิต',
    description: 'เช็กไฟล์และรายละเอียดสำคัญก่อนเริ่มงานจริง',
  },
  {
    title: 'งานพิมพ์หลายประเภท',
    description: 'ครอบคลุมเอกสาร นามบัตร สติกเกอร์ อิงค์เจ็ท และงานพรีเมียม',
  },
  {
    title: 'รับทั้งงานชิ้นเดียวและจำนวนมาก',
    description: 'แจ้งจำนวนที่ต้องการเพื่อสรุปรายละเอียดงานให้เหมาะสม',
  },
  {
    title: 'ดูแลตั้งแต่ไฟล์ถึงงานเสร็จ',
    description: 'สรุปไฟล์ รายละเอียด การผลิต และการรับงานให้เป็นขั้นตอน',
  },
] as const satisfies readonly Advantage[];

export const showcaseItems = [
  {
    id: 'document',
    title: 'งานเอกสาร',
    description: 'เอกสารสำหรับงานประจำวันและงานนำเสนอ',
    href: '/upload',
    image: {
      src: '/covers/document.png',
      alt: 'ตัวอย่างงานพิมพ์เอกสาร',
      width: 1254,
      height: 1254,
    },
  },
  {
    id: 'name-card',
    title: 'นามบัตร',
    description: 'สื่อแนะนำตัวสำหรับบุคคลและธุรกิจ',
    href: '/upload',
    image: {
      src: '/covers/namecard.png',
      alt: 'ตัวอย่างงานพิมพ์นามบัตร',
      width: 1254,
      height: 1254,
    },
  },
  {
    id: 'sticker',
    title: 'สติกเกอร์',
    description: 'ฉลากและสื่อตกแต่งสำหรับสินค้าและแบรนด์',
    href: '/upload',
    image: {
      src: '/covers/sticker.png',
      alt: 'ตัวอย่างงานพิมพ์สติกเกอร์',
      width: 1254,
      height: 1254,
    },
  },
  {
    id: 'inkjet',
    title: 'งาน Inkjet',
    description: 'งานภาพและสื่อพิมพ์ขนาดใหญ่',
    href: '/upload',
    image: {
      src: '/covers/inkjet.png',
      alt: 'ตัวอย่างงานพิมพ์อิงค์เจ็ท',
      width: 1254,
      height: 1254,
    },
  },
  {
    id: 'premium-product',
    title: 'สินค้าพรีเมียม',
    description: 'สินค้าสำหรับแบรนด์ กิจกรรม และของที่ระลึก',
    href: '/upload',
    image: {
      src: '/covers/productpremium.png',
      alt: 'ตัวอย่างสินค้าพรีเมียม',
      width: 1254,
      height: 1254,
    },
  },
  {
    id: 'stamp',
    title: 'ตรายาง',
    description: 'ตรายางสำหรับงานเอกสารและธุรกิจ',
    href: '/upload',
    image: {
      src: '/covers/stamp.png',
      alt: 'ตัวอย่างตรายาง',
      width: 1254,
      height: 1254,
    },
  },
] as const satisfies readonly ShowcaseItem[];
