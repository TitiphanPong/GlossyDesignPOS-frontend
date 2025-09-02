'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Grow,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// --- Animations ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`;

// Reveal on scroll
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold,
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView } as const;
}
function Reveal({ children, delay = 0 }: React.PropsWithChildren<{ delay?: number }>) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref}>
      <Grow in={inView} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
        <div>{children}</div>
      </Grow>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: t => ({
          xs: `radial-gradient(60% 50% at 20% 0%, ${alpha('#90caf9', 0.35)} 0%, ${t.palette.background.default} 60%),
                 radial-gradient(60% 50% at 90% 10%, ${alpha('#ce93d8', 0.35)} 0%, ${t.palette.background.default} 60%),
                 linear-gradient(180deg, ${alpha(t.palette.background.default, 0.65)} 0%, ${t.palette.background.default} 60%)`,
          md: `radial-gradient(40% 40% at 10% 10%, ${alpha('#90caf9', 0.35)} 0%, ${t.palette.background.default} 70%),
                 radial-gradient(50% 50% at 90% 0%, ${alpha('#ce93d8', 0.35)} 0%, ${t.palette.background.default} 70%),
                 linear-gradient(180deg, ${alpha(t.palette.background.default, 0.65)} 0%, ${t.palette.background.default} 60%)`,
        }),
      }}>
      {/* Floating Orbs */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 80,
          left: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          bgcolor: t => alpha(t.palette.primary.main, 0.12),
          filter: 'blur(20px)',
          animation: `${float} 8s ease-in-out infinite`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: 80,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: '50%',
          bgcolor: t =>
            alpha(t.palette.secondary ? t.palette.secondary.main : t.palette.primary.main, 0.12),
          filter: 'blur(24px)',
          animation: `${float} 10s ease-in-out infinite`,
        }}
      />

      <Container sx={{ position: 'relative', py: { xs: 8, md: 12 } }}>
        {/* Hero */}
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 10 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip icon={<PrintIcon />} label="Glossy Design" color="primary" variant="outlined" />
          </Stack>
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, letterSpacing: -0.5, fontSize: { xs: 36, md: 56 } }}>
            ระบบหน้าร้านงานพิมพ์{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              ครบจบในที่เดียว
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 780 }}>
            บริการสื่อสิ่งพิมพ์ทุกชนิด สติกเกอร์ นามบัตรการ์ด ฉลากสินค้า ป้ายไวนิล ฯลฯ
          </Typography>
        </Stack>

        {/* Two Menus */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Store Side */}
          <Box flex={1} id="for-store">
            <Reveal>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)',
                  backgroundColor: t => alpha(t.palette.background.paper, 0.7),
                  boxShadow: t => `0 10px 30px ${alpha(t.palette.primary.main, 0.15)}`,
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: t => `0 18px 38px ${alpha(t.palette.primary.main, 0.25)}`,
                  },
                }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                    marginTop={1}
                    marginLeft={2}>
                    <StorefrontIcon color="primary" />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      สำหรับที่ร้าน
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mb: 2 }} marginTop={1} marginLeft={2}>
                    จัดการงานหน้าร้าน ขายไว รายงานครบ
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <List>
                    <ListItemButton
                      component={Link}
                      href="/pos"
                      sx={{
                        borderRadius: 2,
                        '&:hover': { bgcolor: t => alpha(t.palette.primary.light, 0.08) },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '0ms',
                      }}>
                      <ListItemIcon>
                        <PointOfSaleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="ขายหน้าร้าน (POS)"
                        secondary="คิดราคา / ส่วนลด พร้อมชำระเงิน"
                      />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton>

                    {/* <ListItemButton
                      component={Link}
                      href="/jobs"
                      sx={{
                        borderRadius: 2,
                        '&:hover': { bgcolor: t => alpha(t.palette.primary.light, 0.08) },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '90ms',
                      }}>
                      <ListItemIcon>
                        <PrintIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="คิวงานพิมพ์"
                        secondary="ตรวจไฟล์/กำลังพิมพ์/เสร็จสิ้น"
                      />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton> */}

                    <ListItemButton
                      component={Link}
                      href="/reports"
                      sx={{
                        borderRadius: 2,
                        '&:hover': { bgcolor: t => alpha(t.palette.primary.light, 0.08) },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '180ms',
                      }}>
                      <ListItemIcon>
                        <AssessmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="รายงานยอด/กะ"
                        secondary="สรุปยอดขาย วัสดุ สิ้นเปลือง"
                      />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton>
                  </List>
                </CardContent>
                <CardActions sx={{ px: 4, pb: 4 }}>
                  <Button
                    component={Link}
                    href="/home"
                    variant="contained"
                    startIcon={<PointOfSaleIcon />}>
                    เริ่มขายเลย
                  </Button>
                  <Button
                    component={Link}
                    href="/settings"
                    color="inherit"
                    startIcon={<HelpOutlineIcon />}>
                    ตั้งค่าร้าน
                  </Button>
                </CardActions>
              </Card>
            </Reveal>
          </Box>

          {/* Customer Side */}
          <Box flex={1} id="for-customer">
            <Reveal delay={120}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)',
                  backgroundColor: t => alpha(t.palette.background.paper, 0.7),
                  boxShadow: t =>
                    `0 10px 30px ${alpha(t.palette.secondary ? t.palette.secondary.main : t.palette.primary.main, 0.15)}`,
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: t => `0 18px 38px ${alpha(t.palette.primary.main, 0.25)}`,
                  },
                }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                    marginTop={1}
                    marginLeft={2}>
                    <PeopleAltIcon color="secondary" />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      สำหรับลูกค้า
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mb: 2 }} marginTop={1} marginLeft={2}>
                    ส่งไฟล์ พรีวิว เลือกขาวดำ/สี ชำระเงินออนไลน์ สะดวกปลอดภัย
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <List>
                    <ListItemButton
                      component={Link}
                      href="/upload"
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: t =>
                            alpha(
                              t.palette.secondary
                                ? t.palette.secondary.light
                                : t.palette.primary.light,
                              0.08
                            ),
                        },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '0ms',
                      }}>
                      <ListItemIcon>
                        <UploadFileIcon />
                      </ListItemIcon>
                      <ListItemText primary="อัปโหลดไฟล์งาน" secondary="PDF/JPG/PNG รองรับพรีวิว" />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton>

                    <ListItemButton
                      component={Link}
                      href="/pos"
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: t =>
                            alpha(
                              t.palette.secondary
                                ? t.palette.secondary.light
                                : t.palette.primary.light,
                              0.08
                            ),
                        },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '90ms',
                      }}>
                      <ListItemIcon>
                        <PrintIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="เลือกขาวดำ/สี & คำนวณราคา"
                        secondary="เห็นราคาแบบเรียลไทม์"
                      />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton>

                    <ListItemButton
                      component={Link}
                      href="/pay"
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: t =>
                            alpha(
                              t.palette.secondary
                                ? t.palette.secondary.light
                                : t.palette.primary.light,
                              0.08
                            ),
                        },
                        opacity: 0,
                        animation: `${fadeUp} .45s ease forwards`,
                        animationDelay: '180ms',
                      }}>
                      <ListItemIcon>
                        <QrCodeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="ชำระเงินพร้อมเพย์"
                        secondary="QR พร้อมเพย์ / อัปสลิป (ตัวอย่าง)"
                      />
                      <ArrowForwardIcon fontSize="small" />
                    </ListItemButton>
                  </List>
                </CardContent>
                <CardActions sx={{ px: 4, pb: 4 }}>
                  <Button
                    component={Link}
                    href="/uploadFileGlossyDesign"
                    variant="contained"
                    startIcon={<UploadFileIcon />}>
                    เริ่มส่งไฟล์
                  </Button>
                  <Button component={Link} href="/pay" color="inherit" startIcon={<QrCodeIcon />}>
                    ไปชำระเงิน
                  </Button>
                </CardActions>
              </Card>
            </Reveal>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
