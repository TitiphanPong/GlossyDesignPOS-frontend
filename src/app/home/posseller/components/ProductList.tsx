import * as React from 'react';
import { Box, Card, CardContent, CardActions, Button, Chip, Typography, Stack } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Image from 'next/image';
import type { Product } from '../page';
import { commonButtonSx, interactiveCardSx } from '../../components/adminUi';
import { EmptyState, ProductGridLoadingState } from '../../components/dashboardUi';

type ProductListProps = Readonly<{
  loading: boolean;
  filtered: Product[];
  onAddProduct: (p: Product) => void;
}>;

const skeletonKeys = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7', 'sk-8'];

export function ProductList({ loading, filtered, onAddProduct }: ProductListProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(140px, 1fr))', sm: 'repeat(3, minmax(180px, 1fr))', xl: 'repeat(4, minmax(180px, 1fr))' } }}>
      {loading && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ProductGridLoadingState count={skeletonKeys.length} />
        </Box>
      )}
      {!loading && filtered.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <EmptyState
            compact
            icon={<SearchRoundedIcon fontSize="small" />}
            eyebrow="Products"
            title="ไม่พบสินค้าที่ตรงกับหมวดหรือคำค้นหานี้"
            subtitle="ลองเลือกหมวดอื่นหรือเคลียร์คำค้นหาเพื่อดูรายการสินค้าเพิ่มเติม"
          />
        </Box>
      )}
      {!loading &&
        filtered.map((p, index) => (
          <Card
            key={`${p.id || 'product'}-${index}`}
            variant="outlined"
            sx={{
              ...interactiveCardSx,
              borderRadius: 3.5,
              borderColor: '#E3EAF4',
              boxShadow: '0 10px 24px rgba(14, 38, 74, 0.08)',
              overflow: 'hidden',
              transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 18px 32px rgba(14, 38, 74, 0.16)',
                borderColor: '#CFE0F8',
              },
            }}>
            <Box sx={{ position: 'relative', height: 210, width: '100%', bgcolor: p.tint || '#f5f5f5', overflow: 'hidden' }}>
              <Image src={p.cover || '/covers/4.png'} alt={p.name} fill unoptimized sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
            </Box>
            <CardContent sx={{ pb: 1.1, px: 1.7, pt: 1.6 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography fontWeight={700} flex={1} noWrap>
                  {p.name}
                </Typography>
                {p.badge && <Chip size="small" label={p.badge} color={p.badge === 'NEW' ? 'secondary' : 'primary'} />}
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.35, color: '#5B6980', fontWeight: 500 }}>
                {p.variants[0].price.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 1.5, pt: 0.1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => onAddProduct(p)}
                sx={{
                  ...commonButtonSx,
                  borderRadius: 2.4,
                  height: 38,
                  background: 'linear-gradient(180deg, #3D7BFF 0%, #205DE8 100%)',
                  boxShadow: '0 12px 22px rgba(33, 90, 232, 0.25)',
                }}>
                เพิ่มรายการ
              </Button>
            </CardActions>
          </Card>
        ))}
    </Box>
  );
}
