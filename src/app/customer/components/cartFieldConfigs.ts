// src/components/cartFieldConfigs.ts
type FieldConfig = {
  key: string;
  label: string;
  format?: (val: any) => string;
};

export const cartFieldConfigs: Record<string, FieldConfig[]> = {
  นามบัตร: [
    { key: 'variant', label: '📦 ขนาด', format: v => v?.name || '' },
    { key: 'material', label: '📄 วัสดุ' },
    { key: 'sides', label: '📑 พิมพ์', format: v => (v === '2' ? '2 ด้าน' : '1 ด้าน') },
    { key: 'colorMode', label: '🎨 โหมดสี', format: v => (v === 'bw' ? 'ขาวดำ' : 'สี') },
    { key: 'productNote', label: '📝 รายละเอียด' },
  ],
  ตรายาง: [
    { key: 'type', label: '🪧 ประเภท', format: v => (v === 'inked' ? 'หมึกในตัว' : 'ธรรมดา') },
    { key: 'shape', label: '🔲 รูปทรง', format: v => (v === 'circle' ? 'วงกลม' : 'สี่เหลี่ยม') },
    { key: 'size', label: '📏 ขนาด' },
    { key: 'productNote', label: '📝 รายละเอียด' },
  ],
  ปริ้นท์เอกสาร: [
    { key: 'variant', label: '📦 ขนาด', format: v => v?.name || '' },
    { key: 'material', label: '📄 วัสดุ' },
    { key: 'sides', label: '📑 พิมพ์', format: v => (v === '2' ? '2 ด้าน' : '1 ด้าน') },
    { key: 'colorMode', label: '🎨 โหมดสี', format: v => (v === 'bw' ? 'ขาวดำ' : 'สี') },
    { key: 'productNote', label: '📝 รายละเอียด' },
  ],
  โพสการ์ด: [
    { key: 'variant', label: '📦 ขนาด', format: v => (v?.custom ? `${v.width} × ${v.height} นิ้ว` : v?.name || '') },
    { key: 'material', label: '📄 วัสดุ' },
    { key: 'laminate', label: '✨ เคลือบ' },
    { key: 'setCount', label: '🗂️ จำนวนชุด', format: v => `${v} ชุด` }, // ✅ เพิ่มจำนวนชุด
  ],
  โปสเตอร์: [
    { key: 'dimension', label: '📐 ขนาด' },
    { key: 'paperType', label: '📄 กระดาษ' },
  ],
};
