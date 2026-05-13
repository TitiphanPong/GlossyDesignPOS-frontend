'use client';

import * as React from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import FactoryRoundedIcon from '@mui/icons-material/FactoryRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import { motion } from 'framer-motion';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { useRouter } from 'next/navigation';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '700', '800'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '700', '800'] });

const MotionBox = motion.create(Box);

const navItems = [
  { id: 'features', label: 'ฟีเจอร์' },
  { id: 'workflow', label: 'ขั้นตอนการทำงาน' },
  { id: 'showcase', label: 'ตัวอย่างหน้าจอ' },
  { id: 'faq', label: 'คำถามที่พบบ่อย' },
];

const footerLinks = [
  { key: 'features', label: 'ฟีเจอร์' },
  { key: 'faq', label: 'คำถามที่พบบ่อย' },
  { key: 'contact', label: 'ติดต่อ' },
  { key: 'terms', label: 'เงื่อนไขการใช้งาน' },
  { key: 'privacy', label: 'นโยบายความเป็นส่วนตัว' },
];

const brands = ['Siam Print Lab', 'InkHaus Studio', 'NeonSign Co.', 'CopyMaster 24', 'Sticker Works', 'Urban Offset'];

const stats = [
  { value: '120+', label: 'ร้านพิมพ์ที่ใช้งาน' },
  { value: '1M+', label: 'ออเดอร์ที่จัดการแล้ว' },
  { value: '99.9%', label: 'Uptime' },
  { value: '42%', label: 'ลดเวลาปิดงาน' },
];

const problems = [
  'ไฟล์ลูกค้ากระจัดกระจายในแชตจนหาไม่เจอ',
  'ติดตามสถานะงานยากและอัปเดตไม่ทัน',
  'ออกใบเสนอราคาช้า ทำให้ปิดการขายยาก',
  'ยอดมัดจำ ยอดคงค้าง และหลักฐานชำระเงินไม่เป็นระบบ',
  'การส่งต่องานผลิตระหว่างพนักงานตกหล่นง่าย',
];

const solutions = [
  'รวมไฟล์งานลูกค้าทั้งหมดไว้บนคลาวด์ในที่เดียว',
  'มองเห็น pipeline งานแบบเรียลไทม์พร้อมผู้รับผิดชอบแต่ละขั้น',
  'ตั้งราคาอัตโนมัติและออกใบเสนอราคาได้ทันที',
  'ติดตามการชำระเงินครบ ทั้งถึงกำหนดและชำระแล้ว',
  'กระดานงานผลิตพร้อมสเปก รายละเอียด และกำหนดส่ง',
];

const features = [
  { title: 'รับออเดอร์หน้าร้าน', desc: 'รับงานไว รองรับตัวเลือกงานพิมพ์และมัดจำครบ', icon: <PointOfSaleRoundedIcon /> },
  { title: 'อัปโหลดไฟล์', desc: 'รับไฟล์งานลูกค้าพร้อมตรวจรูปแบบและพรีวิวทันที', icon: <CloudUploadRoundedIcon /> },
  { title: 'ติดตามออเดอร์', desc: 'เห็นสถานะงานตั้งแต่รับงานจนส่งมอบแบบเรียลไทม์', icon: <TrackChangesRoundedIcon /> },
  { title: 'ฐานข้อมูลลูกค้า', desc: 'เก็บประวัติงาน ความชอบ และสั่งซ้ำได้ในหน้าเดียว', icon: <GroupsRoundedIcon /> },
  { title: 'ติดตามการชำระเงิน', desc: 'รองรับชำระบางส่วน PromptPay และแจ้งยอดคงค้าง', icon: <PaymentsRoundedIcon /> },
  { title: 'เวิร์กโฟลว์การผลิต', desc: 'จัดคิวงานแยกสถานี ลดงานตกหล่นระหว่างทีม', icon: <FactoryRoundedIcon /> },
  { title: 'แดชบอร์ดวิเคราะห์', desc: 'ดูยอดขาย สินค้าขายดี และประสิทธิภาพทีมได้ทันที', icon: <QueryStatsRoundedIcon /> },
  { title: 'รองรับหลายอุปกรณ์', desc: 'ใช้งานลื่นทั้งคอม แท็บเล็ต และมือถือ', icon: <DevicesRoundedIcon /> },
  { title: 'ระบบคลาวด์', desc: 'ข้อมูลปลอดภัย สำรองได้ และเข้าถึงได้ทุกที่', icon: <CloudDoneRoundedIcon /> },
  { title: 'แจ้งเตือนอัจฉริยะ', desc: 'แจ้งเตือนงานอนุมัติ ครบกำหนด และงานพร้อมรับอัตโนมัติ', icon: <NotificationsActiveRoundedIcon /> },
];

const workflowSteps = [
  'ลูกค้าอัปโหลดไฟล์งาน',
  'พนักงานตรวจไฟล์อาร์ตเวิร์ก',
  'ระบบคำนวณราคาให้อัตโนมัติ',
  'ลูกค้ายืนยันการชำระเงิน',
  'เริ่มกระบวนการผลิต',
  'ส่งมอบหรือให้ลูกค้ามารับงาน',
];

const faqs = [
  {
    q: 'ลูกค้าสามารถอัปโหลดไฟล์ได้ไหม?',
    a: 'ได้ ลูกค้าสามารถอัปโหลดไฟล์งาน ไฟล์อ้างอิง และหมายเหตุได้ทันที ทีมงานสามารถตรวจและอนุมัติได้ทั้งบนคอมและมือถือ',
  },
  {
    q: 'รองรับการใช้งานบนมือถือหรือไม่?',
    a: 'รองรับเต็มรูปแบบ โดยออกแบบให้ใช้งานได้ดีทั้งมือถือ แท็บเล็ต และเดสก์ท็อป',
  },
  {
    q: 'สามารถจัดการหลายสาขาได้ไหม?',
    a: 'ได้ สามารถติดตามยอดขาย งานผลิต และการทำงานของแต่ละสาขาพร้อมกำหนดสิทธิ์ผู้ใช้งานตามบทบาท',
  },
  {
    q: 'รองรับการชำระเงินออนไลน์ไหม?',
    a: 'รองรับ ทั้งออนไลน์และหน้าร้าน พร้อมติดตามมัดจำ ยอดคงค้าง และหลักฐานการชำระเงินในไทม์ไลน์เดียว',
  },
  {
    q: 'ข้อมูลถูกเก็บอย่างปลอดภัยหรือไม่?',
    a: 'ข้อมูลถูกจัดเก็บบนโครงสร้างคลาวด์ที่ปลอดภัย มีการกำหนดสิทธิ์เข้าถึง การเข้ารหัสระหว่างส่งข้อมูล และระบบสำรองข้อมูลที่เชื่อถือได้',
  },
];

const testimonials = [
  {
    name: 'Napat K.',
    role: 'เจ้าของร้าน Print Avenue',
    quote: 'เราเลิกความวุ่นวายในแชตได้จริง งานเดินเร็วขึ้น และลูกค้าเชื่อมั่นมากขึ้นอย่างชัดเจน',
  },
  {
    name: 'Mina S.',
    role: 'ผู้จัดการร้าน StickerLab',
    quote: 'แค่ระบบมัดจำและยอดคงค้าง ก็ช่วยลดเวลางานทีมเราได้หลายชั่วโมงต่อสัปดาห์',
  },
  {
    name: 'Tee P.',
    role: 'ผู้บริหาร SignForge Studio',
    quote: 'ให้ความรู้สึกเหมือนซอฟต์แวร์ระดับองค์กรที่สร้างมาเพื่อร้านพิมพ์โดยเฉพาะ ทั้งพรีเมียมและใช้งานจริงได้ดี',
  },
];

const particleSeeds = [11, 19, 27, 33, 41, 48, 52, 60, 67, 73, 81, 88, 93, 97, 104, 111];
const contactEmail = process.env.NEXT_PUBLIC_SALES_EMAIL ?? 'sales@glossypos.com';
const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL ?? '/terms';
const privacyPolicyUrl = process.env.NEXT_PUBLIC_PRIVACY_URL ?? '/privacy-policy';

function FloatingParticles() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particleSeeds.map((seed, idx) => (
        <Box
          key={seed}
          sx={{
            position: 'absolute',
            width: 6 + (idx % 4) * 3,
            height: 6 + (idx % 4) * 3,
            borderRadius: '50%',
            bgcolor: 'rgba(121, 240, 255, 0.35)',
            left: `${(seed * 7) % 100}%`,
            top: `${(seed * 13) % 100}%`,
            filter: 'blur(1px)',
            animation: `floatParticle ${7 + (idx % 4)}s ease-in-out ${idx * 0.3}s infinite`,
          }}
        />
      ))}
    </Box>
  );
}

type SectionTitleProps = Readonly<{ eyebrow: string; title: string; desc: string; center?: boolean }>;

function SectionTitle({ eyebrow, title, desc, center = false }: SectionTitleProps) {
  return (
    <Stack spacing={1.5} alignItems={center ? 'center' : 'flex-start'} textAlign={center ? 'center' : 'left'}>
      <Chip
        label={eyebrow}
        size="small"
        sx={{
          borderRadius: 999,
          color: '#9ae7ff',
          border: '1px solid rgba(154, 231, 255, 0.35)',
          bgcolor: 'rgba(154, 231, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <Typography
        className={jakarta.className}
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.7rem', sm: '2rem', md: '2.4rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.12,
        }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'rgba(239, 243, 255, 0.75)', maxWidth: 720, fontSize: { xs: '0.95rem', md: '1rem' } }}>{desc}</Typography>
    </Stack>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [faqIndex, setFaqIndex] = React.useState(0);

  const scrollToSection = React.useCallback((id: string) => {
    const target = globalThis.document.getElementById(id);
    if (!target) return;
    const offsetTop = target.getBoundingClientRect().top + globalThis.scrollY - 84;
    globalThis.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }, []);

  const handleStartTrial = React.useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleWatchDemo = React.useCallback(() => {
    scrollToSection('showcase');
  }, [scrollToSection]);

  const handleBookDemo = React.useCallback(() => {
    const subject = encodeURIComponent('นัดปรึกษางานพิมพ์ - Glossy Design');
    globalThis.location.href = `mailto:${contactEmail}?subject=${subject}`;
  }, []);

  const openUrl = React.useCallback(
    (url: string) => {
      if (url.startsWith('/')) {
        router.push(url);
        return;
      }

      globalThis.open(url, '_blank', 'noopener,noreferrer');
    },
    [router]
  );

  const handleNavToSection = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection]
  );

  const handleFooterLink = React.useCallback(
    (key: string) => {
      if (key === 'features') scrollToSection('features');
      if (key === 'faq') scrollToSection('faq');
      if (key === 'contact') handleBookDemo();
      if (key === 'terms') openUrl(termsUrl);
      if (key === 'privacy') openUrl(privacyPolicyUrl);
    },
    [handleBookDemo, openUrl, scrollToSection]
  );

  return (
    <Box
      className={manrope.className}
      sx={{
        color: '#eff3ff',
        minHeight: '100dvh',
        position: 'relative',
        overflowX: 'clip',
        background:
          'radial-gradient(circle at 18% 12%, rgba(73, 92, 255, 0.32), transparent 40%), radial-gradient(circle at 85% 10%, rgba(255, 97, 210, 0.16), transparent 30%), radial-gradient(circle at 50% 80%, rgba(21, 192, 255, 0.18), transparent 35%), linear-gradient(140deg, #05070f 0%, #0b1030 42%, #140f2f 73%, #090b14 100%)',
        '&::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.17,
          zIndex: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\' viewBox=\'0 0 160 160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'160\' height=\'160\' filter=\'url(%23n)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        },
        '@keyframes floatParticle': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: 0.1 },
          '50%': { transform: 'translateY(-24px) translateX(10px)', opacity: 0.8 },
        },
        '@keyframes pulseGlow': {
          '0%, 100%': { boxShadow: '0 0 0 rgba(58, 225, 255, 0.22)' },
          '50%': { boxShadow: '0 0 24px rgba(58, 225, 255, 0.45)' },
        },
        '@keyframes auroraShift': {
          '0%': { transform: 'translateX(-8%) translateY(-3%) rotate(0deg)' },
          '100%': { transform: 'translateX(8%) translateY(3%) rotate(12deg)' },
        },
      }}>
      <FloatingParticles />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          zIndex: 50,
          bgcolor: 'rgba(10, 14, 32, 0.58)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
        }}>
        <Container maxWidth="xl" sx={{ py: 1.2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #60efff, #7f6bff 55%, #ff70ce)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#05101b',
                  fontWeight: 900,
                }}>
                G
              </Box>
              <Typography className={jakarta.className} sx={{ fontWeight: 800, letterSpacing: '0.01em' }}>
                Glossy Design
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  underline="none"
                  onClick={event => handleNavToSection(event, item.id)}
                  sx={{ color: 'rgba(240,244,255,0.8)', fontSize: 14 }}>
                  {item.label}
                </Link>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="text" sx={{ color: '#d8def8', display: { xs: 'none', sm: 'inline-flex' } }} onClick={handleWatchDemo}>
                ดูเดโม
              </Button>
              <Button
                variant="contained"
                onClick={handleStartTrial}
                sx={{
                  borderRadius: '999px',
                  px: 2.2,
                  background: 'linear-gradient(120deg, #24d2ff, #7d68ff 60%, #ff6cd0)',
                  color: '#fff',
                  fontWeight: 700,
                }}>
                ทดลองใช้ฟรี
              </Button>
              <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#f1f4ff' }} onClick={() => setDrawerOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 3, bgcolor: '#0b0f24', height: '100%' }}>
          <Stack spacing={2}>
            {navItems.map(item => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                underline="none"
                onClick={event => {
                  setDrawerOpen(false);
                  handleNavToSection(event, item.id);
                }}
                sx={{ color: '#edf2ff' }}>
                {item.label}
              </Link>
            ))}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)' }} />
            <Button variant="contained" sx={{ borderRadius: 99 }} onClick={handleStartTrial}>
              ทดลองใช้ฟรี
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <Box component="section" sx={{ pt: { xs: 9, md: 11 }, pb: { xs: 9, md: 12 }, position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: '-12%',
              left: '-15%',
              width: 340,
              height: 340,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(43, 214, 255, 0.28), transparent 62%)',
              filter: 'blur(14px)',
              animation: 'auroraShift 12s ease-in-out infinite alternate',
            }}
          />

          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true, margin: '-20%' }}>
                <Chip
                  icon={<BoltRoundedIcon sx={{ color: '#a5f0ff !important' }} />}
                  label="สร้างมาเพื่อร้านพิมพ์ ร้านสติ๊กเกอร์ และร้านป้ายโดยเฉพาะ"
                  sx={{
                    mb: 2,
                    px: 1,
                    borderRadius: 99,
                    color: '#d9f8ff',
                    bgcolor: 'rgba(57, 199, 255, 0.1)',
                    border: '1px solid rgba(57, 199, 255, 0.35)',
                  }}
                />
                <Typography
                  className={jakarta.className}
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.04,
                    fontSize: { xs: '2.05rem', sm: '2.8rem', md: '3.6rem', lg: '4.2rem' },
                    background: 'linear-gradient(95deg, #ffffff 0%, #9ce9ff 35%, #c7b8ff 70%, #ffb7e6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                  ร้านสื่อสิ่งพิมพ์ครบวงจรสำหรับธุรกิจของคุณ
                </Typography>
                <Typography sx={{ mt: 2.4, maxWidth: 610, color: 'rgba(232, 240, 255, 0.8)', fontSize: { xs: '1rem', md: '1.12rem' } }}>
                  จัดการออเดอร์ ไฟล์ลูกค้า การชำระเงิน เวิร์กโฟลว์การผลิต และงานพิมพ์ทั้งหมดได้ในแพลตฟอร์มเดียวที่ออกแบบมาเพื่อความเร็วจริงของร้านพิมพ์
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} mt={4}>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={handleStartTrial}
                    endIcon={<KeyboardArrowRightRoundedIcon />}
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.25,
                      fontWeight: 700,
                      background: 'linear-gradient(130deg, #22d5ff, #6e6cff 54%, #ff6ad5)',
                      animation: 'pulseGlow 2.8s ease-in-out infinite',
                    }}>
                    ทดลองใช้ฟรี
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={handleWatchDemo}
                    startIcon={<PlayCircleRoundedIcon />}
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.25,
                      color: '#e7edff',
                      borderColor: 'rgba(231, 237, 255, 0.34)',
                      backdropFilter: 'blur(10px)',
                    }}>
                    ดูเดโม
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1.2} mt={3.2} flexWrap="wrap" useFlexGap>
                  {stats.slice(0, 3).map(s => (
                    <Chip
                      key={s.label}
                      label={`${s.value} ${s.label}`}
                      sx={{
                        color: '#e8eeff',
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        borderRadius: 99,
                      }}
                    />
                  ))}
                </Stack>
              </MotionBox>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true }}>
                <Box
                  sx={{
                    borderRadius: '28px',
                    p: { xs: 2, md: 2.4 },
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 26px 80px rgba(5, 8, 19, 0.45)',
                  }}>
                  <Box
                    sx={{
                      borderRadius: '22px',
                      p: 2,
                      border: '1px solid rgba(131, 212, 255, 0.25)',
                      background: 'linear-gradient(180deg, rgba(15, 21, 45, 0.88), rgba(10, 13, 31, 0.9))',
                    }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography sx={{ fontWeight: 700 }}>แดชบอร์ดงานพิมพ์ Glossy Design</Typography>
                      <Chip size="small" label="กำลังใช้งาน" color="info" />
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 7 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)', height: '100%' }}>
                          <Typography sx={{ color: 'rgba(229,236,255,0.72)', fontSize: 13 }}>รายได้วันนี้</Typography>
                          <Typography className={jakarta.className} sx={{ mt: 0.8, fontWeight: 800, fontSize: 24 }}>
                            ฿28,450
                          </Typography>
                          <Typography sx={{ mt: 0.5, fontSize: 12, color: '#8ff2aa' }}>+19.6% จากเมื่อวาน</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 5 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }}>
                          <Typography sx={{ color: 'rgba(229,236,255,0.72)', fontSize: 13 }}>งานรอดำเนินการ</Typography>
                          <Typography className={jakarta.className} sx={{ mt: 0.8, fontWeight: 800, fontSize: 24 }}>
                            37
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }}>
                          <Typography sx={{ mb: 1, color: 'rgba(229,236,255,0.72)', fontSize: 13 }}>ลำดับงาน</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['รับงานใหม่ 18', 'ออกแบบ 9', 'กำลังพิมพ์ 7', 'พร้อมรับ 3'].map(step => (
                              <Chip key={step} label={step} sx={{ bgcolor: 'rgba(57,198,255,0.15)', color: '#d3f6ff' }} />
                            ))}
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Box>

        <MotionBox initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true }}>
          <Box component="section" sx={{ py: { xs: 5, md: 6 } }}>
            <SectionTitle
              center
              eyebrow="ได้รับความไว้วางใจ"
              title="ร้านพิมพ์คุณภาพสูงไว้วางใจใช้งาน"
              desc="ตั้งแต่ร้านถ่ายเอกสารในชุมชนจนถึงธุรกิจป้ายหลายสาขา Glossy Design ช่วยให้งานผลิตรายวันเป็นระบบและมั่นใจได้"
            />
            <Stack direction="row" justifyContent="center" spacing={1.1} mt={4} flexWrap="wrap" useFlexGap>
              {brands.map(brand => (
                <Chip key={brand} label={brand} sx={{ borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.07)', color: '#eff4ff', px: 1.2 }} />
              ))}
            </Stack>
            <Grid container spacing={2} mt={2}>
              {stats.map(item => (
                <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                  <Box sx={{ p: 2.2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <Typography className={jakarta.className} sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ color: 'rgba(236,242,255,0.74)', fontSize: 13 }}>{item.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </MotionBox>

        <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="ปัญหา สู่ ทางออก"
            title="หยุดความวุ่นวายของออเดอร์ในแชต"
            desc="Glossy Design เปลี่ยนงานมือที่กระจัดกระจายให้เป็นกระบวนการเดียวที่ทีมของคุณทำงานต่อได้ทันที"
          />
          <Grid container spacing={2.2} mt={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true }}>
                <Box sx={{ p: 2.3, borderRadius: 4, bgcolor: 'rgba(255, 88, 120, 0.08)', border: '1px solid rgba(255, 115, 145, 0.25)' }}>
                  <Typography className={jakarta.className} sx={{ mb: 1.3, fontWeight: 700 }}>
                    วิธีทำงานแบบเดิม
                  </Typography>
                  <Stack spacing={1.1}>
                    {problems.map(problem => (
                      <Stack key={problem} direction="row" spacing={1} alignItems="flex-start">
                        <CloseRoundedIcon sx={{ color: '#ff8ba8', mt: '3px', fontSize: 17 }} />
                        <Typography sx={{ color: 'rgba(255,231,236,0.88)', fontSize: 14 }}>{problem}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </MotionBox>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionBox initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true }}>
                <Box sx={{ p: 2.3, borderRadius: 4, bgcolor: 'rgba(103, 235, 198, 0.08)', border: '1px solid rgba(103, 235, 198, 0.3)' }}>
                  <Typography className={jakarta.className} sx={{ mb: 1.3, fontWeight: 700 }}>
                    เมื่อทำงานกับ Glossy Design
                  </Typography>
                  <Stack spacing={1.1}>
                    {solutions.map(solution => (
                      <Stack key={solution} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: '#79ffd4', mt: '3px', fontSize: 17 }} />
                        <Typography sx={{ color: 'rgba(228,255,247,0.92)', fontSize: 14 }}>{solution}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Box>

        <Box id="features" component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="ฟีเจอร์"
            title="ระบบปฏิบัติการครบชุดสำหรับร้านพิมพ์ยุคใหม่"
            desc="โมดูลแบบ Bento ที่ครบทั้งข้อมูล การควบคุม และเวิร์กโฟลว์ที่ทีมทำงานได้จริงโดยไม่สับสน"
          />
          <Grid container spacing={1.8} mt={2.5}>
            {features.map(feature => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 3 }}>
                <MotionBox
                  whileHover={{ y: -6 }}
                  sx={{
                    p: 2,
                    height: '100%',
                    borderRadius: 4,
                    background: 'linear-gradient(155deg, rgba(255,255,255,0.11), rgba(255,255,255,0.03))',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(15px)',
                  }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.5,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#e4f7ff',
                      background: 'linear-gradient(145deg, rgba(37, 203, 255, 0.55), rgba(126, 108, 255, 0.55))',
                      boxShadow: '0 0 28px rgba(94, 173, 255, 0.35)',
                    }}>
                    {feature.icon}
                  </Box>
                  <Typography className={jakarta.className} sx={{ mt: 1.5, fontWeight: 700, fontSize: '1.05rem' }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ mt: 0.7, color: 'rgba(235,241,255,0.75)', fontSize: 14 }}>{feature.desc}</Typography>
                  <Box sx={{ mt: 1.8, p: 1.2, borderRadius: 2, bgcolor: 'rgba(11, 18, 38, 0.7)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    <Typography sx={{ color: 'rgba(205, 219, 255, 0.7)', fontSize: 12 }}>ตัวอย่างหน้าจอ</Typography>
                    <Box sx={{ mt: 1, height: 7, borderRadius: 5, background: 'linear-gradient(90deg, rgba(59, 228, 255, 0.7), rgba(122, 116, 255, 0.6), rgba(255, 120, 216, 0.6))' }} />
                  </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box id="workflow" component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="วิธีการทำงาน"
            title="กระบวนการต่อเนื่องตั้งแต่อัปโหลดจนส่งมอบ"
            desc="ทุกขั้นตอนเป็นระบบ ติดตามได้ และมองเห็นร่วมกันทั้งทีมและลูกค้า"
          />
          <Stack mt={4} spacing={1.6} sx={{ position: 'relative', pl: { xs: 0, md: 2 } }}>
            <Box sx={{ position: 'absolute', left: { xs: 12, md: 20 }, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, rgba(122,214,255,0.7), rgba(255,127,219,0.35))' }} />
            {workflowSteps.map((step, idx) => (
              <MotionBox key={step} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 1.3, pl: { xs: 0.4, md: 1.5 } }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid rgba(128, 236, 255, 0.8)',
                      bgcolor: '#0f1736',
                      zIndex: 2,
                    }}
                  />
                  <Box sx={{ p: 1.5, borderRadius: 3, flex: 1, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <Typography sx={{ color: '#9fe8ff', fontSize: 12, mb: 0.4 }}>ขั้นตอนที่ {idx + 1}</Typography>
                    <Typography className={jakarta.className} sx={{ fontWeight: 700 }}>
                      {step}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            ))}
          </Stack>
        </Box>

        <Box id="showcase" component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="ตัวอย่างระบบ"
            title="สวย คม ชัดทุกอุปกรณ์ที่ทีมคุณใช้งาน"
            desc="อินเทอร์เฟซระดับพรีเมียมสำหรับพนักงาน ผู้จัดการ และเจ้าของกิจการ ทั้งคอม แท็บเล็ต และมือถือ"
          />
          <Grid container spacing={2} mt={2.5}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ borderRadius: 5, p: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)' }}>
                <Typography sx={{ color: 'rgba(232,239,255,0.78)', mb: 1 }}>ตัวอย่างหน้าจอคอมพิวเตอร์ - แดชบอร์ด</Typography>
                <Box sx={{ borderRadius: 3, p: 1.8, bgcolor: 'rgba(13,20,42,0.92)' }}>
                  <Box sx={{ height: 220, borderRadius: 2.5, background: 'linear-gradient(155deg, rgba(36, 216, 255, 0.28), rgba(127, 109, 255, 0.3), rgba(255, 108, 209, 0.25))' }} />
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ borderRadius: 5, p: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)', height: '100%' }}>
                <Typography sx={{ color: 'rgba(232,239,255,0.78)', mb: 1 }}>ตัวอย่างหน้าจอแท็บเล็ต</Typography>
                <Box sx={{ height: 220, borderRadius: 3, background: 'linear-gradient(150deg, rgba(104,223,255,0.3), rgba(107,112,255,0.22))' }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
              <Box sx={{ borderRadius: 5, p: 2, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)', height: '100%' }}>
                <Typography sx={{ color: 'rgba(232,239,255,0.78)', mb: 1 }}>ตัวอย่างหน้าจอมือถือ</Typography>
                <Box sx={{ height: 220, borderRadius: 3, background: 'linear-gradient(160deg, rgba(255,128,216,0.3), rgba(49,221,255,0.24))' }} />
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="เปรียบเทียบ"
            title="ระบบเดิม เทียบกับ Glossy Design"
            desc="เห็นความต่างชัดเจนทั้งความเร็ว คุณภาพงาน และความเชื่อมั่นของลูกค้า"
          />
          <Grid container spacing={2} mt={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2.2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography className={jakarta.className} sx={{ mb: 1.1, fontWeight: 700 }}>
                  ระบบเดิม
                </Typography>
                <Stack spacing={0.9}>
                  {['ไฟล์หายในแชต LINE', 'ติดตามงานด้วยกระดาษ/จดมือ', 'ไม่มีเวิร์กโฟลว์การผลิต', 'ค้นหาประวัติลูกค้ายาก'].map(item => (
                    <Typography key={item} sx={{ fontSize: 14, color: 'rgba(255,236,241,0.8)' }}>
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2.2, borderRadius: 4, bgcolor: 'rgba(125, 247, 207, 0.08)', border: '1px solid rgba(125, 247, 207, 0.28)' }}>
                <Typography className={jakarta.className} sx={{ mb: 1.1, fontWeight: 700 }}>
                  Glossy Design
                </Typography>
                <Stack spacing={0.9}>
                  {['ระบบคลาวด์เป็นระเบียบ', 'ติดตามออเดอร์แบบเรียลไทม์', 'เวิร์กโฟลว์การผลิตอัจฉริยะ', 'ฐานข้อมูลประวัติลูกค้า'].map(item => (
                    <Typography key={item} sx={{ fontSize: 14, color: 'rgba(226,255,244,0.9)' }}>
                      • {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle
            eyebrow="เสียงจากผู้ใช้จริง"
            title="เจ้าของร้านที่รับงานจำนวนมากเลือกใช้จริง"
            desc="เสียงตอบรับจากทีมที่เปลี่ยนจากงานมือมาใช้ Glossy Design"
            center
          />
          <Grid container spacing={2} mt={2.5}>
            {testimonials.map(item => (
              <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                <MotionBox
                  whileHover={{ y: -6 }}
                  sx={{
                    p: 2.2,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.13)',
                    height: '100%',
                  }}>
                  <Typography sx={{ color: '#ffb0de', mb: 0.8 }}>★★★★★</Typography>
                  <Typography sx={{ color: 'rgba(238,243,255,0.88)', mb: 2 }}>{item.quote}</Typography>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(123, 110, 255, 0.8)' }}>{item.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography className={jakarta.className} sx={{ fontWeight: 700, fontSize: 14 }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(233,239,255,0.65)' }}>{item.role}</Typography>
                    </Box>
                  </Stack>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box id="faq" component="section" sx={{ py: { xs: 6, md: 9 } }}>
          <SectionTitle eyebrow="คำถามที่พบบ่อย" title="คำถามจากเจ้าของธุรกิจร้านพิมพ์" desc="ข้อมูลสำคัญที่คุณควรรู้ก่อนเริ่มใช้ระบบงานพิมพ์สมัยใหม่" />
          <Grid container spacing={2.5} mt={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Tabs
                orientation="vertical"
                value={faqIndex}
                onChange={(_, v) => setFaqIndex(v)}
                variant="scrollable"
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    color: 'rgba(234,240,255,0.7)',
                    borderRadius: 2.5,
                    mb: 0.8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    minHeight: 50,
                  },
                }}>
                {faqs.map(item => (
                  <Tab key={item.q} label={item.q} />
                ))}
              </Tabs>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Typography className={jakarta.className} sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                  {faqs[faqIndex].q}
                </Typography>
                <Typography sx={{ mt: 1.2, color: 'rgba(233,240,255,0.78)', lineHeight: 1.7 }}>{faqs[faqIndex].a}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box component="section" sx={{ py: { xs: 7, md: 10 } }}>
          <Box
            sx={{
              p: { xs: 2.4, sm: 3.4, md: 4 },
              borderRadius: 6,
              textAlign: 'center',
              background: 'radial-gradient(circle at 20% 10%, rgba(82, 234, 255, 0.42), rgba(82, 234, 255, 0) 38%), radial-gradient(circle at 80% 80%, rgba(255, 117, 216, 0.34), rgba(255, 117, 216, 0) 34%), linear-gradient(145deg, rgba(76, 106, 255, 0.4), rgba(18, 24, 54, 0.94))',
              border: '1px solid rgba(166, 229, 255, 0.35)',
              boxShadow: '0 30px 90px rgba(11, 14, 28, 0.52)',
              position: 'relative',
              overflow: 'hidden',
            }}>
            <FloatingParticles />
            <Typography className={jakarta.className} sx={{ fontSize: { xs: '1.6rem', md: '2.5rem' }, fontWeight: 800, lineHeight: 1.12 }}>
              เปลี่ยนธุรกิจร้านพิมพ์ของคุณให้เป็นเวิร์กโฟลว์อัจฉริยะยุคใหม่
            </Typography>
            <Typography sx={{ mt: 1.3, color: 'rgba(236,242,255,0.84)', maxWidth: 740, mx: 'auto' }}>
              ทำงานเร็วขึ้น ประทับใจลูกค้ามากขึ้น และขยายธุรกิจได้อย่างมั่นใจในมาตรฐานระดับองค์กร
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} justifyContent="center" mt={3}>
              <Button variant="contained" size="large" onClick={handleStartTrial} sx={{ borderRadius: 99, px: 3 }}>
                ทดลองใช้ฟรี
              </Button>
              <Button variant="outlined" size="large" onClick={handleBookDemo} sx={{ borderRadius: 99, px: 3, color: '#e7eeff', borderColor: 'rgba(231,238,255,0.45)' }}>
                จองเดโม
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box component="footer" sx={{ pb: { xs: 10, md: 5 }, pt: 3 }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 2.3 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography className={jakarta.className} sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                Glossy Design
              </Typography>
              <Typography sx={{ color: 'rgba(233,239,255,0.66)', fontSize: 13, mt: 0.5 }}>ร้านสื่อสิ่งพิมพ์ครบวงจร พร้อมรับออกแบบ ผลิต และจัดการออเดอร์</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                {footerLinks.map(link => (
                  <Typography key={link.key} sx={{ color: 'rgba(233,239,255,0.72)', fontSize: 14, cursor: 'pointer' }} onClick={() => handleFooterLink(link.key)}>
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                <IconButton sx={{ color: '#dce4ff' }} component="a" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FacebookRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton sx={{ color: '#dce4ff' }} component="a" href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <YouTubeIcon fontSize="small" />
                </IconButton>
                <IconButton sx={{ color: '#dce4ff' }} component="a" href={`mailto:${contactEmail}`}>
                  <AlternateEmailRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
          <Typography sx={{ mt: 2, color: 'rgba(228,235,255,0.5)', fontSize: 12 }}>© {new Date().getFullYear()} Glossy Design. สงวนลิขสิทธิ์</Typography>
        </Box>
      </Container>

      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          p: 1.2,
          display: { xs: 'block', md: 'none' },
          zIndex: 60,
          background: 'linear-gradient(180deg, rgba(6, 9, 22, 0), rgba(6, 9, 22, 0.95) 32%)',
        }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleStartTrial}
          endIcon={<AutoAwesomeRoundedIcon />}
          sx={{
            borderRadius: 99,
            py: 1.1,
            fontWeight: 700,
            background: 'linear-gradient(130deg, #23d5ff, #7c6bff 56%, #ff72d3)',
          }}>
          ทดลองใช้ฟรี
        </Button>
      </Box>
    </Box>
  );
}
