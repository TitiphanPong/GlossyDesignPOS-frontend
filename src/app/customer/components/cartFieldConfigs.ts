import type { CartItem } from './customerDisplayTypes';

type FieldConfig = {
  key: string;
  label: string;
  format?: (val: unknown) => string;
};

export const cartFieldConfigs: Record<string, FieldConfig[]> = {
  'เธเธฒเธกเธเธฑเธ•เธฃ': [
    { key: 'variant', label: '๐“ฆ เธเธเธฒเธ”', format: v => ((v as { name?: string } | undefined)?.name ? (v as { name?: string }).name ?? '' : '') },
    { key: 'material', label: '๐“ เธงเธฑเธชเธ”เธธ' },
    { key: 'sides', label: '๐“‘ เธเธดเธกเธเน', format: v => (v === '2' ? '2 เธ”เนเธฒเธ' : '1 เธ”เนเธฒเธ') },
    { key: 'colorMode', label: '๐จ เนเธซเธกเธ”เธชเธต', format: v => (v === 'bw' ? 'เธเธฒเธงเธ”เธณ' : 'เธชเธต') },
    { key: 'productNote', label: '๐“ เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”' },
  ],
  'เธ•เธฃเธฒเธขเธฒเธ': [
    { key: 'type', label: '๐ชง เธเธฃเธฐเน€เธ เธ—', format: v => (v === 'inked' ? 'เธซเธกเธถเธเนเธเธ•เธฑเธง' : 'เธเธฃเธฃเธกเธ”เธฒ') },
    { key: 'shape', label: '๐”ฒ เธฃเธนเธเธ—เธฃเธ', format: v => (v === 'circle' ? 'เธงเธเธเธฅเธก' : 'เธชเธตเนเน€เธซเธฅเธตเนเธขเธก') },
    { key: 'size', label: '๐“ เธเธเธฒเธ”' },
    { key: 'productNote', label: '๐“ เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”' },
  ],
  'เธเธฃเธดเนเธเธ—เนเน€เธญเธเธชเธฒเธฃ': [
    { key: 'variant', label: '๐“ฆ เธเธเธฒเธ”', format: v => ((v as { name?: string } | undefined)?.name ? (v as { name?: string }).name ?? '' : '') },
    { key: 'material', label: '๐“ เธงเธฑเธชเธ”เธธ' },
    { key: 'sides', label: '๐“‘ เธเธดเธกเธเน', format: v => (v === '2' ? '2 เธ”เนเธฒเธ' : '1 เธ”เนเธฒเธ') },
    { key: 'colorMode', label: '๐จ เนเธซเธกเธ”เธชเธต', format: v => (v === 'bw' ? 'เธเธฒเธงเธ”เธณ' : 'เธชเธต') },
    { key: 'productNote', label: '๐“ เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”' },
  ],
  'เนเธเธชเธเธฒเธฃเนเธ”': [
    {
      key: 'variant',
      label: '๐“ฆ เธเธเธฒเธ”',
      format: v => {
        const variant = v as { custom?: boolean; width?: string | number; height?: string | number; name?: string } | undefined;
        return variant?.custom ? `${variant.width} ร— ${variant.height} เธเธดเนเธง` : variant?.name ?? '';
      },
    },
    { key: 'material', label: '๐“ เธงเธฑเธชเธ”เธธ' },
    { key: 'laminate', label: 'โจ เน€เธเธฅเธทเธญเธ' },
    { key: 'setCount', label: '๐—๏ธ เธเธณเธเธงเธเธเธธเธ”', format: v => `${v} เธเธธเธ”` },
  ],
  'เนเธเธชเน€เธ•เธญเธฃเน': [
    { key: 'dimension', label: '๐“ เธเธเธฒเธ”' },
    { key: 'paperType', label: '๐“ เธเธฃเธฐเธ”เธฒเธฉ' },
  ],
};

function readConfigValue(item: CartItem, config: FieldConfig): string | null {
  const rawValue = item[config.key];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const formatted = config.format ? config.format(rawValue) : String(rawValue);
  return formatted.trim() ? `${config.label}: ${formatted}` : null;
}

export function getCartItemDetailLines(item: CartItem): string[] {
  const fields = cartFieldConfigs[item.category || ''] || [];
  const configuredLines = fields.map(field => readConfigValue(item, field)).filter((line): line is string => Boolean(line));

  if (configuredLines.length > 0) {
    return configuredLines;
  }

  return [item.material, item.variant?.name, item.size, item.category].filter((value): value is string => Boolean(value));
}
