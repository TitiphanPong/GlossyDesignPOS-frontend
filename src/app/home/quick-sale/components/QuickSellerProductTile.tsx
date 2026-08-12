'use client';

import { Box, Chip, Stack, Typography } from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import type { Product } from '@/lib/contracts';

type Props = {
  product: Pick<Product, 'name' | 'category' | 'emoji' | 'tint' | 'isHotMenu' | 'unitLabel' | 'variants'>;
  disabled?: boolean;
  onClick?: () => void;
};

export default function QuickSellerProductTile({ product, disabled, onClick }: Readonly<Props>) {
  const price = product.variants[0]?.price ?? 0;
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        width: '100%', minWidth: 0, minHeight: 150, p: 1.75, textAlign: 'left', font: 'inherit',
        border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper',
        cursor: onClick ? 'pointer' : 'default', opacity: disabled ? 0.55 : 1,
        boxShadow: '0 8px 26px rgba(15, 23, 42, 0.06)', transition: '160ms ease',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 16px 34px rgba(15, 23, 42, 0.12)', borderColor: 'primary.light' } : undefined,
      }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
        <Box sx={{ width: 54, height: 54, flexShrink: 0, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: product.tint || '#E2E8F0', color: '#52657C', fontSize: 30 }}>
          {product.emoji || <ArticleRoundedIcon sx={{ fontSize: 34 }} />}
        </Box>
        {product.isHotMenu && <Chip size="small" icon={<LocalFireDepartmentRoundedIcon />} label="เมนูแนะนำ" color="warning" sx={{ fontWeight: 700 }} />}
      </Stack>
      <Typography fontWeight={800} noWrap sx={{ mt: 1.5 }}>{product.name || 'ชื่อรายการ'}</Typography>
      <Typography variant="caption" color="text.secondary" noWrap>{product.category || 'หมวดหมู่'}</Typography>
      <Typography sx={{ mt: 0.8, color: 'primary.main', fontWeight: 900, fontSize: 20 }}>
        ฿{price.toLocaleString('th-TH')} <Typography component="span" variant="caption" color="text.secondary">/ {product.unitLabel || 'ชิ้น'}</Typography>
      </Typography>
    </Box>
  );
}
