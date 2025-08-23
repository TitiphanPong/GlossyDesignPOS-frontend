'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack, Card, CardContent } from '@mui/material';

type Product = {
  _id: string;
  name: string;
  category?: string;
  variants: { name: string; price: number }[];
};

export default function TaskPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <CircularProgress sx={{ m: 5 }} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        รายการสินค้า (Task)
      </Typography>

      <Stack spacing={2}>
        {products.map((p) => (
          <Card key={p._id}>
            <CardContent>
              <Typography variant="h6">{p.name}</Typography>
              <Typography color="text.secondary">{p.category}</Typography>
              <ul>
                {p.variants.map((v, i) => (
                  <li key={i}>{v.name} - {v.price}฿</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
