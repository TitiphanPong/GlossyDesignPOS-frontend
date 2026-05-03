'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grow,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';

import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PrintIcon from '@mui/icons-material/Print';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StorefrontIcon from '@mui/icons-material/Storefront';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
`;

const revealLine = keyframes`
  0% { transform: scaleX(0); transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
`;

const heroShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Reveal({ children, delay = 0 }: React.PropsWithChildren<{ delay?: number }>) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      <Grow in={inView} timeout={700} style={{ transformOrigin: '0 0 0', transitionDelay: `${delay}ms` }}>
        <div style={{ transform: inView ? 'translateY(0px)' : 'translateY(18px)', transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)' }}>{children}</div>
      </Grow>
    </div>
  );
}

const features = [
  {
    icon: <PointOfSaleIcon />,
    title: 'POS System',
    desc: 'ขายหน้าร้าน คิดราคา ใส่ส่วนลด และสรุปยอดได้ในหน้าเดียว',
  },
  {
    icon: <UploadFileIcon />,
    title: 'File Upload',
    desc: 'ลูกค้าส่งไฟล์งาน พร้อมข้อมูลติดต่อและสถานะงานได้ทันที',
  },
  {
    icon: <PrintIcon />,
    title: 'Print Management',
    desc: 'จัดการคิวงานพิมพ์ ตรวจไฟล์ ผลิต และส่งมอบเป็นระบบ',
  },
  {
    icon: <AssessmentIcon />,
    title: 'Analytics Dashboard',
    desc: 'ดูยอดขาย รายการยอดนิยม และภาพรวมธุรกิจแบบเรียลไทม์',
  },
];

const products = [
  { title: 'Business Cards', price: 'เริ่ม 300.-', icon: <CreditCardIcon />, image: '/covers/4.png' },
  { title: 'PVC Cards', price: 'เริ่ม 500.-', icon: <InventoryIcon />, image: '/covers/5.png' },
  { title: 'Stickers', price: 'ราคาตามขนาด', icon: <LocalOfferIcon />, image: '/covers/6.png' },
  { title: 'Posters', price: 'A2 / A1 / Custom', icon: <PrintIcon />, image: '/covers/7.png' },
];

const pricing = [
  { qty: 100, discount: 0, highlight: false },
  { qty: 500, discount: 7, highlight: true },
  { qty: 1000, discount: 10, highlight: false },
  { qty: 2000, discount: 12, highlight: false },
];

const NOISE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.09'/%3E%3C/svg%3E\")";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LandingPage() {
  const [pricingMode, setPricingMode] = React.useState<'bulk' | 'piece'>('bulk');
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const baseUnitPrice = 3.2;
  const posPreviewItems = [
    { name: 'Business Card', qty: 500, multiplier: 1 },
    { name: 'PVC Card', qty: 100, multiplier: 1.6 },
    { name: 'Sticker', qty: 20, multiplier: 2.1, unitLabel: 'A4 x' },
  ];

  const subTotal = posPreviewItems.reduce((acc, item) => {
    const qtyValue = item.unitLabel ? item.qty * 10 : item.qty;
    return acc + qtyValue * baseUnitPrice * item.multiplier;
  }, 0);
  const selectedTier = pricing.find(tier => tier.qty === 500) ?? pricing[0];
  const discountAmount = (subTotal * selectedTier.discount) / 100;
  const grandTotal = subTotal - discountAmount;

  const pricingRows = pricing.map(tier => {
    const base = tier.qty * baseUnitPrice;
    const tierDiscount = (base * tier.discount) / 100;
    const finalBulk = base - tierDiscount;
    const perPiece = finalBulk / tier.qty;

    return {
      ...tier,
      finalBulk,
      perPiece,
    };
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: '#f8faff',
        color: '#0f172a',
      }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 12% 12%, ${alpha('#60a5fa', 0.32)}, transparent 34%),
            radial-gradient(circle at 88% 8%, ${alpha('#a78bfa', 0.35)}, transparent 34%),
            radial-gradient(circle at 50% 58%, ${alpha('#f472b6', 0.18)}, transparent 36%),
            linear-gradient(180deg, #fcfdff 0%, #f6f9ff 45%, #f2f5ff 100%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 250% 250%',
          animation: `${heroShift} 22s ease infinite`,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 110,
          left: -70,
          width: 250,
          height: 250,
          borderRadius: '50%',
          bgcolor: alpha('#6366f1', 0.18),
          filter: 'blur(30px)',
          animation: `${float} 8s ease-in-out infinite`,
          transform: `translateY(${scrollY * 0.06}px)`,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: -80,
          top: 320,
          width: 280,
          height: 280,
          borderRadius: '50%',
          bgcolor: alpha('#ec4899', 0.16),
          filter: 'blur(32px)',
          animation: `${float} 10s ease-in-out infinite`,
          transform: `translateY(${scrollY * -0.05}px)`,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: NOISE_TEXTURE,
          opacity: 0.35,
          pointerEvents: 'none',
          mixBlendMode: 'soft-light',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            mx: { xs: -1.5, md: -2 },
            rowGap: { xs: 6, md: 7 },
          }}>
          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              px: { xs: 1.5, md: 2 },
            }}>
            <Reveal>
              <Stack spacing={3.5}>
                

                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 44, md: 74 },
                    lineHeight: { xs: 1.02, md: 0.96 },
                    fontWeight: 900,
                    letterSpacing: -2.4,
                  }}>
                  Smart POS{'\n'}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(90deg, #2563eb, #9333ea, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    Glossy Design
                  </Box>
                </Typography>

                <Typography sx={{ fontSize: { xs: 18, md: 20 }, color: alpha('#0f172a', 0.74), maxWidth: 560 }}>
                  Manage orders, print faster, and scale your shop effortlessly. ระบบหน้าร้านสำหรับร้านสิ่งพิมพ์ที่อยากจัดการงานแบบมืออาชีพในหน้าจอเดียว
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={Link}
                    href="/uploadfile"
                    size="large"
                    variant="contained"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg, #2563eb, #9333ea)',
                      boxShadow: `0 14px 34px ${alpha('#6366f1', 0.34)}`,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1d4ed8, #7e22ce)',
                        boxShadow: `0 16px 38px ${alpha('#7c3aed', 0.36)}`,
                      },
                    }}>
                    Upload Files
                  </Button>

                  <Button
                    component={Link}
                    href="/home"
                    size="large"
                    variant="outlined"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 999,
                      borderColor: alpha('#64748b', 0.2),
                      bgcolor: alpha('#ffffff', 0.66),
                      backdropFilter: 'blur(12px)',
                      '&:hover': {
                        borderColor: alpha('#6366f1', 0.4),
                        bgcolor: alpha('#ffffff', 0.88),
                      },
                    }}>
                    View Demo
                  </Button>
                </Stack>

                
              </Stack>
            </Reveal>
          </Box>

          <Box
            sx={{
              width: { xs: '100%', md: '50%' },
              px: { xs: 1.5, md: 2 },
            }}>
            <Reveal delay={120}>
              <Card
                sx={{
                  borderRadius: 7,
                  p: 2,
                  bgcolor: alpha('#ffffff', 0.67),
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha('#ffffff', 0.85)}`,
                  boxShadow: `0 24px 70px ${alpha('#6366f1', 0.2)}`,
                  transform: `translateY(${Math.min(scrollY * -0.02, 12)}px)`,
                }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                      <Typography fontWeight={900}>POS Dashboard</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today’s printing orders
                      </Typography>
                    </Box>
                    <Chip label="Live" color="success" size="small" />
                  </Stack>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {posPreviewItems.map(item => {
                      const qtyValue = item.unitLabel ? item.qty * 10 : item.qty;
                      const rowPrice = qtyValue * baseUnitPrice * item.multiplier;

                      return (
                      <Box key={item.name}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 4,
                            bgcolor: alpha('#f8fafc', 0.92),
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <Box>
                            <Typography fontWeight={800}>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.unitLabel ? `${item.unitLabel} ${item.qty}` : `${item.qty.toLocaleString('th-TH')} ใบ`}
                            </Typography>
                          </Box>
                          <Typography fontWeight={900}>{formatCurrency(rowPrice)}</Typography>
                        </Box>
                      </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography fontWeight={800}>{formatCurrency(subTotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography color="text.secondary">Discount ({selectedTier.discount}%)</Typography>
                    <Typography fontWeight={800} color="success.main">
                      -{formatCurrency(discountAmount)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography fontWeight={900}>Total</Typography>
                    <Typography fontWeight={900} color="primary.main">
                      {formatCurrency(grandTotal)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Reveal>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 11, md: 16 } }}>
          <SectionTitle label="Features" title="Everything your print shop needs" desc="ออกแบบมาเพื่อร้านงานพิมพ์ที่ต้องการระบบขาย จัดการไฟล์ และดูยอดขายแบบมืออาชีพ" />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
            {features.map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  width: {
                    xs: '100%',
                    sm: '50%',
                    md: index === 4 ? '100%' : '25%',
                  },
                  px: 1.5,
                }}>
                <Reveal delay={index * 80}>
                  <PremiumCard>
                    <IconBubble>{item.icon}</IconBubble>
                    <Typography variant="h6" fontWeight={900} mt={2}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" mt={1} sx={{ maxWidth: 340 }}>
                      {item.desc}
                    </Typography>
                  </PremiumCard>
                </Reveal>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 11, md: 16 } }}>
          <SectionTitle label="Products" title="Popular printing products" desc="โชว์สินค้าให้ดูง่าย เหมาะกับลูกค้าหน้าร้านและลูกค้าออนไลน์" />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
            {products.map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  width: { xs: '100%', sm: '50%', md: '25%' },
                  px: 1.5,
                }}>
                <Reveal delay={index * 80}>
                  <Card
                    sx={{
                      borderRadius: 5,
                      overflow: 'hidden',
                      bgcolor: alpha('#ffffff', 0.74),
                      backdropFilter: 'blur(14px)',
                      border: `1px solid ${alpha('#ffffff', 0.82)}`,
                      boxShadow: `0 14px 35px ${alpha('#6366f1', 0.12)}`,
                      transition: '0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 24px 52px ${alpha('#6366f1', 0.2)}`,
                      },
                    }}>
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.35))',
                        },
                      }}
                    />
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={900}>
                          {item.title}
                        </Typography>
                        <IconBubble small>{item.icon}</IconBubble>
                      </Stack>
                      <Typography color="primary.main" fontWeight={800} mt={1}>
                        {item.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Reveal>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 11, md: 16 } }}>
          <SectionTitle label="Pricing" title="Bulk discount tiers" desc="แสดงเรทราคาแบบชัดเจน ลูกค้าตัดสินใจง่ายขึ้น" />

          <Stack direction="row" justifyContent="center" mb={4}>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={pricingMode}
              onChange={(_, value: 'bulk' | 'piece' | null) => {
                if (value) setPricingMode(value);
              }}
              sx={{
                bgcolor: alpha('#ffffff', 0.66),
                borderRadius: 999,
                border: `1px solid ${alpha('#cbd5e1', 0.6)}`,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '999px !important',
                  px: 2.5,
                  py: 0.8,
                  textTransform: 'none',
                  fontWeight: 700,
                },
              }}>
              <ToggleButton value="bulk">Per Bulk Order</ToggleButton>
              <ToggleButton value="piece">Per Piece</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
            {pricingRows.map((item, index) => (
              <Box
                key={item.qty}
                sx={{
                  width: { xs: '100%', sm: '50%', md: '25%' },
                  px: 1.5,
                }}>
                <Reveal delay={index * 80}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 6,
                      p: 3,
                      position: 'relative',
                      bgcolor: item.highlight ? '#111827' : alpha('#ffffff', 0.72),
                      color: item.highlight ? '#fff' : 'inherit',
                      backdropFilter: 'blur(16px)',
                      boxShadow: item.highlight ? `0 24px 60px ${alpha('#111827', 0.3)}` : `0 16px 44px ${alpha('#6366f1', 0.12)}`,
                      transform: item.highlight ? 'translateY(-8px)' : 'none',
                    }}>
                    {item.highlight && (
                      <Chip
                        label="Most Popular"
                        size="small"
                        sx={{
                          mb: 2,
                          color: '#fff',
                          bgcolor: alpha('#fff', 0.18),
                        }}
                      />
                    )}

                    <Typography variant="h5" fontWeight={900}>
                      {item.qty.toLocaleString('th-TH')} prints
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.8 }}>Discount {item.discount}%</Typography>

                    <Typography sx={{ mt: 2.4, fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>
                      {pricingMode === 'bulk' ? formatCurrency(item.finalBulk) : formatCurrency(item.perPiece)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      {pricingMode === 'bulk' ? 'per order tier' : 'per piece'}
                    </Typography>

                    <Stack spacing={1.2} mt={3}>
                      {['คำนวณราคาอัตโนมัติ', 'รองรับหลายประเภทงานพิมพ์', 'บันทึกออเดอร์ได้'].map(text => (
                        <Stack direction="row" spacing={1} alignItems="center" key={text}>
                          <CheckCircleIcon fontSize="small" />
                          <Typography variant="body2">{text}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Reveal>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 11, md: 16 } }}>
          <SectionTitle label="Workflow" title="How it works" desc="จากลูกค้าส่งไฟล์ จนถึงรับงานพิมพ์ จบใน 4 ขั้นตอน" />

          <Box sx={{ position: 'relative' }}>
            <Box
              aria-hidden
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 32,
                left: '12.5%',
                right: '12.5%',
                height: 2,
                background: 'linear-gradient(90deg, #2563eb, #9333ea, #ec4899)',
                animation: `${revealLine} 1.4s ease-out both`,
              }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
              {[
                { title: 'Upload File', icon: <CloudUploadIcon /> },
                { title: 'Select Product', icon: <StorefrontIcon /> },
                { title: 'Confirm Order', icon: <ShoppingCartCheckoutIcon /> },
                { title: 'Print & Receive', icon: <DoneAllIcon /> },
              ].map((step, index) => (
              <Box
                key={step.title}
                sx={{
                  width: { xs: '100%', sm: '50%', md: '25%' },
                  px: 1.5,
                }}>
                <Reveal delay={index * 90}>
                  <PremiumCard>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        background: 'linear-gradient(135deg, #2563eb, #9333ea)',
                        boxShadow: `0 10px 26px ${alpha('#7c3aed', 0.3)}`,
                        animation: `${glow} 4s ease-in-out infinite`,
                      }}>
                      {step.icon}
                    </Box>
                    <Typography mt={2} color="text.secondary" fontWeight={700}>
                      Step {index + 1}
                    </Typography>
                    <Typography variant="h6" fontWeight={900} mt={2}>
                      {step.title}
                    </Typography>
                  </PremiumCard>
                </Reveal>
              </Box>
            ))}
            </Box>
          </Box>
        </Box>

        <Reveal delay={100}>
          <Box
            sx={{
              mt: { xs: 11, md: 16 },
              p: { xs: 4, md: 8 },
              borderRadius: 7,
              textAlign: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed, #ec4899)',
              backgroundSize: '200% 200%',
              animation: `${heroShift} 10s ease infinite`,
              boxShadow: `0 24px 72px ${alpha('#7c3aed', 0.3)}`,
            }}>
            <Typography sx={{ fontSize: { xs: 34, md: 52 }, fontWeight: 900, lineHeight: 1.05 }}>Start Your Printing Business Today</Typography>
            <Typography sx={{ mt: 2, opacity: 0.86 }}>เปิดระบบขายงานพิมพ์ จัดการไฟล์ และดูยอดขายในที่เดียว</Typography>
            <Button
              component={Link}
              href="/home/posseller"
              size="large"
              variant="contained"
              sx={{
                mt: 4,
                px: 5,
                py: 1.5,
                borderRadius: 999,
                bgcolor: '#fff',
                color: '#4f46e5',
                fontWeight: 900,
                '&:hover': { bgcolor: '#f8fafc' },
              }}>
              Get Started
            </Button>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}

function PremiumCard({ children }: React.PropsWithChildren) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 6,
        p: 3,
        bgcolor: alpha('#ffffff', 0.68),
        backdropFilter: 'blur(16px)',
        border: `1px solid ${alpha('#ffffff', 0.82)}`,
        boxShadow: `0 14px 36px ${alpha('#6366f1', 0.12)}`,
        transition: '0.28s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 24px 58px ${alpha('#6366f1', 0.2)}`,
        },
      }}>
      {children}
    </Card>
  );
}

function IconBubble({ children, small = false }: React.PropsWithChildren<{ small?: boolean }>) {
  return (
    <Box
      sx={{
        width: small ? 42 : 54,
        height: small ? 42 : 54,
        borderRadius: 4,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: 'linear-gradient(135deg, #2563eb, #9333ea, #ec4899)',
        boxShadow: `0 12px 28px ${alpha('#7c3aed', 0.28)}`,
        '& svg': { fontSize: small ? 22 : 28 },
      }}>
      {children}
    </Box>
  );
}

function SectionTitle({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
      <Chip
        label={label}
        sx={{
          fontWeight: 800,
          color: '#4f46e5',
          bgcolor: alpha('#ffffff', 0.64),
          border: `1px solid ${alpha('#6366f1', 0.2)}`,
          borderRadius: 999,
          backdropFilter: 'blur(10px)',
        }}
      />
      <Typography
        sx={{
          fontSize: { xs: 34, md: 50 },
          fontWeight: 900,
          letterSpacing: -1.2,
          background: 'linear-gradient(90deg, #0f172a, #334155)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
        {desc}
      </Typography>
    </Stack>
  );
}
