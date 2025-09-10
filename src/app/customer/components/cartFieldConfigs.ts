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
  สติ๊กเกอร์: [
    { key: 'size', label: '📏 ขนาด' },
    { key: 'material', label: '📄 วัสดุ' },
    { key: 'laminate', label: '✨ เคลือบ' },
  ],
  โปสเตอร์: [
    { key: 'dimension', label: '📐 ขนาด' },
    { key: 'paperType', label: '📄 กระดาษ' },
  ],
};
