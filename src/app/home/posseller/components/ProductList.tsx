import * as React from 'react';
import { Box, Card, CardContent, CardActions, Button, Chip, Skeleton, Typography, Stack } from '@mui/material';
import Image from 'next/image';
import type { Product } from '../page';
import { commonButtonSx, interactiveCardSx } from '../../components/adminUi';

type ProductListProps = Readonly<{
  loading: boolean;
  filtered: Product[];
  onAddProduct: (p: Product) => void;
}>;

const skeletonKeys = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6', 'sk-7', 'sk-8'];

export function ProductList({ loading, filtered, onAddProduct }: ProductListProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(140px, 1fr))', sm: 'repeat(3, minmax(180px, 1fr))', xl: 'repeat(4, minmax(180px, 1fr))' } }}>
      {loading && skeletonKeys.map((key) => (
        <Card key={key} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" width="100%" height={120} />
          <CardContent>
            <Skeleton width="80%" />
            <Skeleton width="40%" />
          </CardContent>
          <CardActions sx={{ p: 1.5, pt: 0.5 }}>
            <Skeleton variant="rectangular" width="100%" height={36} />
          </CardActions>
        </Card>
      ))}
      {!loading && filtered.length === 0 && (
        <Box p={4} width="100%" textAlign="center" color="text.secondary">
          <Typography>ไม่พบสินค้าในหมวดหรือคำค้นหานี้</Typography>
        </Box>
      )}
      {!loading && filtered.map((p, index) => (
        <Card key={`${p.id || 'product'}-${index}`} variant="outlined" sx={{ ...interactiveCardSx, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', height: 210, width: '100%', bgcolor: p.tint || '#f5f5f5', overflow: 'hidden' }}>
            <Image src={p.cover || '/covers/4.png'} alt={p.name} fill unoptimized sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
          </Box>
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography fontWeight={700} flex={1} noWrap>{p.name}</Typography>
              {p.badge && <Chip size="small" label={p.badge} color={p.badge === 'NEW' ? 'secondary' : 'primary'} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {p.variants[0].price.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })}
            </Typography>
          </CardContent>
          <CardActions sx={{ p: 1.5, pt: 0 }}>
            <Button fullWidth variant="contained" onClick={() => onAddProduct(p)} sx={commonButtonSx}>เพิ่มรายการ</Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

