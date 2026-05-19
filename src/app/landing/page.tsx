'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import FilterNoneRoundedIcon from '@mui/icons-material/FilterNoneRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

type NavItem = {
  id: string;
  label: string;
};

type ServiceItem = {
  title: string;
  description: string;
  image: string;
};

type WorkflowStep = {
  title: string;
  icon: React.ReactNode;
};

type ShowcaseItem = {
  title: string;
  image: string;
};

const headingFont = { className: '' };
const bodyFont = { className: '' };

const navItems: NavItem[] = [
  { id: 'services', label: 'บริการของเรา' },
  { id: 'workflow', label: 'ขั้นตอนการสั่งงาน' },
  { id: 'showcase', label: 'ตัวอย่างงาน' },
  { id: 'reviews', label: 'รีวิวลูกค้า' },
  { id: 'faq', label: 'คำถามที่พบบ่อย' },
  { id: 'contact', label: 'ติดต่อเรา' },
];

const heroGallery = ['/banners/Banner1.png', '/banners/Banner5.png', '/covers/document.png', '/covers/namecard.png', '/covers/sticker.png', '/covers/plotplan.png'];

const services: ServiceItem[] = [
  {
    title: 'ปริ้นท์เอกสาร / ถ่ายเอกสาร',
    description: 'ขาวดำและสี ทั้ง A4-A3 คมชัด พร้อมเข้าแฟ้มทันที',
    image: '/covers/document.png',
  },
  {
    title: 'เข้าเล่มรายงาน',
    description: 'เข้าเล่มสันกาว สันห่วง และปกใสสำหรับรายงานหรือโปรเจกต์',
    image: '/covers/postcard.png',
  },
  {
    title: 'เคลือบบัตร / เคลือบเอกสาร',
    description: 'เคลือบด้านและเงา ป้องกันน้ำและรอยขีดข่วน',
    image: '/banners/Banner2.png',
  },
  {
    title: 'นามบัตร',
    description: 'พิมพ์นามบัตรหลายแบบ ทั้งกระดาษอาร์ตการ์ดและกระดาษพรีเมียม',
    image: '/covers/namecard.png',
  },
  {
    title: 'สติ๊กเกอร์ PVC / PP',
    description: 'สติ๊กเกอร์กันน้ำ ติดแน่น เหมาะกับสินค้าและบรรจุภัณฑ์',
    image: '/covers/stickerpplaser.png',
  },
  {
    title: 'โปสเตอร์ / อิงค์เจ็ท',
    description: 'งานโปสเตอร์ขนาดใหญ่ สีสด คมชัด สำหรับหน้าร้านและงานอีเวนต์',
    image: '/covers/inkjet.png',
  },
  {
    title: 'พล็อตแบบแปลน',
    description: 'พล็อตแบบก่อสร้างและแบบวิศวกรรม เส้นคม อ่านง่าย',
    image: '/covers/plotplan.png',
  },
  {
    title: 'ตรายาง',
    description: 'ตรายางบริษัท ตรายางชื่อ พร้อมหมึกในตัวและแบบด้ามจับ',
    image: '/covers/stamp.png',
  },
  {
    title: 'สินค้าพรีเมียม',
    description: 'งานของชำร่วยและสินค้าสั่งทำสำหรับองค์กรและกิจกรรม',
    image: '/covers/productpremium.png',
  },
  {
    title: 'งานอื่น ๆ',
    description: 'รับผลิตงานพิมพ์เฉพาะทางตามงบและความต้องการของลูกค้า',
    image: '/covers/other.png',
  },
];

const workflowSteps: WorkflowStep[] = [
  { title: 'ส่งไฟล์หรือแจ้งรายละเอียดงาน', icon: <FileUploadRoundedIcon /> },
  { title: 'ทีมงานตรวจไฟล์', icon: <FactCheckRoundedIcon /> },
  { title: 'แจ้งราคาและระยะเวลาผลิต', icon: <RequestQuoteRoundedIcon /> },
  { title: 'ยืนยันออเดอร์', icon: <TaskAltRoundedIcon /> },
  { title: 'เริ่มผลิตงาน', icon: <PrecisionManufacturingRoundedIcon /> },
  { title: 'รับงานหรือจัดส่ง', icon: <LocalShippingRoundedIcon /> },
];

const trustBadges = ['รับงานด่วน', 'ตรวจไฟล์ก่อนผลิต', 'ไม่มีขั้นต่ำ', 'รองรับไฟล์ PDF / AI / PSD / JPG', 'มีบริการจัดส่ง', 'รับทั้งงานชิ้นเดียวและจำนวนมาก'];

const showcaseItems: ShowcaseItem[] = [
  { title: 'เอกสารและรายงาน', image: '/covers/document.png' },
  { title: 'นามบัตร', image: '/covers/namecard.png' },
  { title: 'สติ๊กเกอร์', image: '/covers/sticker.png' },
  { title: 'โปสเตอร์', image: '/covers/inkjet.png' },
  { title: 'ป้ายและไวนิล', image: '/banners/Banner9.png' },
  { title: 'แปลนก่อสร้าง', image: '/covers/plotplan.png' },
  { title: 'ตรายาง', image: '/assets/stamp_normal.png' },
  { title: 'สินค้าพรีเมียม', image: '/covers/productpremium.png' },
];

const reviews = [
  {
    name: 'คุณเมย์ - นักศึกษา',
    review: 'ส่งไฟล์ทาง LINE แล้วรอรับงานได้เลย รวดเร็วมาก เอกสารคมชัดทุกหน้า',
  },
  {
    name: 'บริษัท S.K. Design',
    review: 'สติ๊กเกอร์และนามบัตรคุณภาพดี สีตรงตามไฟล์ งานส่งตรงเวลา',
  },
  {
    name: 'คุณปกรณ์ - วิศวกร',
    review: 'พล็อตแบบแปลนละเอียด เส้นคมมาก เหมาะกับงานไซต์จริง ทีมงานแนะนำดี',
  },
];

const faqs = [
  {
    question: 'ส่งไฟล์ทางไหนได้บ้าง?',
    answer: 'สามารถส่งได้ทาง LINE, Facebook, อีเมล หรืออัปโหลดผ่านหน้าเว็บไซต์ของร้าน',
  },
  {
    question: 'รับงานด่วนไหม?',
    answer: 'รับงานด่วนในหลายประเภทงาน โดยทีมงานจะแจ้งคิวและเวลารับงานให้ชัดเจนก่อนผลิต',
  },
  {
    question: 'มีขั้นต่ำหรือไม่?',
    answer: 'ไม่มีขั้นต่ำ สามารถสั่งพิมพ์ได้ตั้งแต่ 1 ชิ้นขึ้นไป',
  },
  {
    question: 'ใช้ไฟล์แบบไหนดีที่สุด?',
    answer: 'ไฟล์ที่แนะนำคือ PDF ความละเอียดสูง หากเป็นงานออกแบบรองรับ AI, PSD, JPG และ PNG',
  },
  {
    question: 'รับออกแบบไหม?',
    answer: 'มีบริการออกแบบเบื้องต้นและออกแบบเต็มรูปแบบตามประเภทงานพิมพ์',
  },
  {
    question: 'มีบริการจัดส่งหรือไม่?',
    answer: 'มีบริการจัดส่งในพื้นที่และส่งขนส่งเอกชนทั่วประเทศ',
  },
  {
    question: 'ใช้เวลากี่วัน?',
    answer: 'ขึ้นอยู่กับประเภทงานและจำนวนชิ้น โดยงานทั่วไปใช้เวลาประมาณ 1-3 วันทำการ',
  },
];

const lineUrl = 'https://line.me/';
const facebookUrl = 'https://facebook.com/';
const mapsUrl = 'https://maps.google.com/?q=Glossy+Copy+%26+Print+Shop';
const phoneHref = 'tel:021234567';

function SectionHeading({ title, subtitle }: Readonly<{ title: string; subtitle: string }>) {
  return (
    <Stack spacing={1} sx={{ mb: 4 }}>
      <Typography className={headingFont.className} sx={{ fontSize: { xs: '1.7rem', md: '2rem' }, color: '#0f2f57', lineHeight: 1.25 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#5f7086', maxWidth: 760 }}>{subtitle}</Typography>
    </Stack>
  );
}

function getTrustBadgeIcon(badge: string) {
  if (badge.includes('ด่วน')) return <BoltRoundedIcon fontSize="small" />;
  if (badge.includes('ตรวจไฟล์')) return <FactCheckRoundedIcon fontSize="small" />;
  if (badge.includes('ขั้นต่ำ')) return <FilterNoneRoundedIcon fontSize="small" />;
  if (badge.includes('ไฟล์')) return <InsertDriveFileRoundedIcon fontSize="small" />;
  if (badge.includes('จัดส่ง')) return <LocalShippingRoundedIcon fontSize="small" />;
  return <CollectionsBookmarkRoundedIcon fontSize="small" />;
}

export default function LandingPage() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(globalThis.scrollY > 16);
    onScroll();
    globalThis.addEventListener('scroll', onScroll);

    return () => globalThis.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = React.useCallback((id: string) => {
    const section = globalThis.document.getElementById(id);
    if (!section) return;
    const top = section.getBoundingClientRect().top + globalThis.scrollY - 88;
    globalThis.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const openChat = React.useCallback(() => {
    globalThis.open(lineUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const openFacebook = React.useCallback(() => {
    globalThis.open(facebookUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const openMaps = React.useCallback(() => {
    globalThis.open(mapsUrl, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <Box
      className={bodyFont.className}
      sx={{
        minHeight: '100dvh',
        color: '#1c2b3a',
        bgcolor: '#f7f9fc',
        backgroundImage: 'radial-gradient(circle at 10% 5%, #f1f8ff 0%, rgba(241,248,255,0) 36%), radial-gradient(circle at 88% 8%, #eef6ff 0%, rgba(238,246,255,0) 34%)',
      }}>
      <AppBar
        elevation={0}
        position="sticky"
        sx={{
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.72)',
          borderBottom: '1px solid rgba(31, 65, 102, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 74 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: '#0f5ea6',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 8px 20px rgba(15, 94, 166, 0.2)',
                  }}>
                  <PrintRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography className={headingFont.className} sx={{ color: '#103560', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    Glossy Copy & Print
                  </Typography>
                  <Typography sx={{ color: '#6b7a90', fontSize: '0.76rem' }}>งานพิมพ์ครบวงจรในพื้นที่ของคุณ</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2.2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                {navItems.map(item => (
                  <Button key={item.id} onClick={() => scrollToSection(item.id)} sx={{ color: '#20456e', fontWeight: 600, px: 1.2, minWidth: 'auto' }}>
                    {item.label}
                  </Button>
                ))}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  onClick={() => scrollToSection('services')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    bgcolor: '#1267b0',
                    px: 2,
                    borderRadius: '999px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#0f578f', boxShadow: 'none' },
                  }}>
                  ดูบริการทั้งหมด
                </Button>
                <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#1f446d' }} onClick={() => setDrawerOpen(true)}>
                  <MenuRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 290, p: 2.5, bgcolor: '#ffffff', height: '100%' }}>
          <Stack spacing={1.5}>
            {navItems.map(item => (
              <Button
                key={item.id}
                onClick={() => {
                  setDrawerOpen(false);
                  scrollToSection(item.id);
                }}
                sx={{ justifyContent: 'flex-start', color: '#1f446d', py: 1.2 }}>
                {item.label}
              </Button>
            ))}
            <Button variant="contained" onClick={openChat} sx={{ bgcolor: '#1267b0', borderRadius: '10px', mt: 1 }}>
              ส่งไฟล์งาน / สอบถามราคา
            </Button>
            <Button variant="outlined" onClick={openChat} sx={{ borderRadius: '10px', borderColor: '#9ec7eb', color: '#1f568a' }}>
              อัปโหลดไฟล์งาน
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ pb: { xs: 12, md: 4 } }}>
        <Box component="section" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="ร้านถ่ายเอกสารและสิ่งพิมพ์สำหรับนักเรียน ออฟฟิศ และธุรกิจ"
                icon={<VerifiedRoundedIcon sx={{ color: '#0f5ea6 !important' }} />}
                sx={{
                  mb: 2,
                  px: 1,
                  borderRadius: '999px',
                  bgcolor: '#e9f4ff',
                  color: '#184a77',
                  border: '1px solid #c9e3fb',
                }}
              />
              <Typography
                className={headingFont.className}
                sx={{
                  color: '#0f2f57',
                  fontSize: { xs: '2rem', sm: '2.4rem', md: '2.9rem' },
                  lineHeight: { xs: 1.25, md: 1.2 },
                }}>
                ร้านถ่ายเอกสารและสื่อสิ่งพิมพ์ครบวงจร
              </Typography>
              <Typography sx={{ mt: 2, color: '#5a6d84', fontSize: { xs: '1rem', md: '1.08rem' }, maxWidth: 640, lineHeight: 1.8 }}>
                รับปริ้นท์ ถ่ายเอกสาร เข้าเล่ม เคลือบบัตร นามบัตร สติ๊กเกอร์ ป้าย โปสเตอร์ พล็อตแบบ และงานพิมพ์ตามสั่ง พร้อมบริการรวดเร็วสำหรับนักเรียน นักศึกษา ออฟฟิศ และธุรกิจทุกขนาด
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => scrollToSection('services')}
                  sx={{
                    bgcolor: '#1267b0',
                    py: 1.2,
                    px: 2.4,
                    borderRadius: '12px',
                    boxShadow: '0 12px 24px rgba(18, 103, 176, 0.18)',
                    '&:hover': { bgcolor: '#0f578f', boxShadow: '0 14px 24px rgba(15, 87, 143, 0.22)' },
                  }}>
                  ดูบริการทั้งหมด
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileRoundedIcon />}
                  onClick={openChat}
                  sx={{
                    borderColor: '#9ec7eb',
                    color: '#1f568a',
                    py: 1.2,
                    px: 2.4,
                    borderRadius: '12px',
                    bgcolor: '#fff',
                    '&:hover': { borderColor: '#78aedf', bgcolor: '#f3f9ff' },
                  }}>
                  ส่งไฟล์งาน / สอบถามราคา
                </Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} sx={{ mt: 2.2 }}>
                <Chip size="small" icon={<AccessTimeRoundedIcon />} label="เปิดทุกวัน 08:00 - 20:00" sx={{ bgcolor: '#f2f8ff', color: '#2a5b89', border: '1px solid #d2e6f9' }} />
                <Chip size="small" icon={<LocalPhoneRoundedIcon />} label="02-123-4567" sx={{ bgcolor: '#f2f8ff', color: '#2a5b89', border: '1px solid #d2e6f9' }} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: '24px',
                  bgcolor: '#ffffff',
                  border: '1px solid #d5e7f8',
                  boxShadow: '0 20px 40px rgba(40, 77, 114, 0.12)',
                }}>
                <Grid container spacing={1.2}>
                  {heroGallery.map((image, idx) => (
                    <Grid key={image} size={{ xs: 6 }}>
                      <Box
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '14px',
                          minHeight: idx < 2 ? 130 : 110,
                          border: '1px solid #dcebfa',
                        }}>
                        <Image src={image} alt="ตัวอย่างงานพิมพ์" fill sizes="(max-width: 768px) 46vw, 220px" style={{ objectFit: 'cover' }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.6 }}>
                  {['เครื่องปริ้นท์/ถ่ายเอกสาร', 'กระดาษ A4', 'นามบัตร', 'สติ๊กเกอร์', 'เคลือบบัตร', 'พล็อตแบบ', 'แพ็กเกจจิ้ง'].map(label => (
                    <Chip key={label} label={label} size="small" sx={{ bgcolor: '#f2f8ff', color: '#225785', border: '1px solid #d7e8f8' }} />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box component="section" id="services" sx={{ py: { xs: 4, md: 6 } }}>
          <SectionHeading title="บริการของเรา" subtitle="บริการงานพิมพ์และถ่ายเอกสารครบหมวด พร้อมวัสดุและเครื่องจักรที่รองรับทั้งงานด่วนและงานจำนวนมาก" />
          <Grid container spacing={2}>
            {services.map(service => (
              <Grid key={service.title} size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #dbe9f7',
                    boxShadow: '0 10px 24px rgba(44, 79, 112, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <CardMedia sx={{ position: 'relative', height: { xs: 108, md: 140 } }}>
                    <Image src={service.image} alt={service.title} fill sizes="(max-width: 900px) 46vw, 24vw" style={{ objectFit: 'cover' }} />
                  </CardMedia>
                  <CardContent sx={{ px: { xs: 1.2, md: 1.8 }, py: { xs: 1.2, md: 1.8 }, flexGrow: 1 }}>
                    <Typography className={headingFont.className} sx={{ color: '#15426f', fontSize: { xs: '0.95rem', md: '1.04rem' }, lineHeight: 1.35 }}>
                      {service.title}
                    </Typography>
                    <Typography sx={{ color: '#60738b', mt: 0.7, fontSize: { xs: '0.8rem', md: '0.9rem' }, lineHeight: 1.55 }}>{service.description}</Typography>
                  </CardContent>
                  <CardActions sx={{ px: { xs: 1.2, md: 1.8 }, pt: 0, pb: { xs: 1.3, md: 1.8 } }}>
                    <Button variant="contained" size="small" sx={{ bgcolor: '#1267b0', borderRadius: '10px', boxShadow: 'none' }}>
                      ดูรายละเอียด
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" id="workflow" sx={{ py: { xs: 5, md: 7 } }}>
          <SectionHeading title="ขั้นตอนการสั่งงาน" subtitle="กระบวนการทำงานชัดเจน ตรวจไฟล์ก่อนผลิตทุกครั้ง เพื่อให้งานพิมพ์ออกมาตรงตามความต้องการ" />
          <Stack spacing={2}>
            {workflowSteps.map((step, index) => (
              <Card
                key={step.title}
                sx={{
                  borderRadius: '14px',
                  border: '1px solid #d8e7f7',
                  boxShadow: '0 8px 18px rgba(47, 83, 118, 0.07)',
                  bgcolor: '#ffffff',
                }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      bgcolor: '#e8f3ff',
                      color: '#155b98',
                      display: 'grid',
                      placeItems: 'center',
                      border: '1px solid #cfe3f7',
                      flexShrink: 0,
                    }}>
                    {step.icon}
                  </Box>
                  <Typography sx={{ color: '#285177', fontWeight: 700, fontSize: { xs: '0.96rem', md: '1rem' }, minWidth: 28 }}>{index + 1}.</Typography>
                  <Typography className={headingFont.className} sx={{ color: '#1e4468', fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                    {step.title}
                  </Typography>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>

        <Box component="section" sx={{ py: { xs: 4, md: 6 } }}>
          <SectionHeading title="เหตุผลที่ลูกค้าไว้ใจเรา" subtitle="บริการแบบร้านจริงในพื้นที่ ใส่ใจทั้งคุณภาพงานและความรวดเร็วในการส่งมอบ" />
          <Grid container spacing={1.5}>
            {trustBadges.map(badge => (
              <Grid key={badge} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderRadius: '14px', border: '1px solid #d9e8f7', bgcolor: '#fff', boxShadow: '0 8px 18px rgba(43, 79, 115, 0.06)' }}>
                  <Stack direction="row" spacing={1.4} alignItems="center" sx={{ p: 1.8 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        bgcolor: '#e9f4ff',
                        border: '1px solid #cfe3f7',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#145d9e',
                      }}>
                      {getTrustBadgeIcon(badge)}
                    </Box>
                    <Typography className={headingFont.className} sx={{ color: '#21496e', fontSize: '0.97rem' }}>
                      {badge}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" id="showcase" sx={{ py: { xs: 5, md: 7 } }}>
          <SectionHeading title="ตัวอย่างงานจริงจากหน้าร้าน" subtitle="ตัวอย่างงานพิมพ์ในหมวดต่าง ๆ เพื่อช่วยให้ลูกค้าเลือกวัสดุและรูปแบบได้ง่ายขึ้น" />
          <Grid container spacing={2}>
            {showcaseItems.map(item => (
              <Grid key={item.title} size={{ xs: 6, md: 3 }}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid #dbe9f7',
                    boxShadow: '0 10px 24px rgba(44, 79, 112, 0.08)',
                    overflow: 'hidden',
                  }}>
                  <Box sx={{ position: 'relative', height: { xs: 130, md: 170 } }}>
                    <Image src={item.image} alt={item.title} fill sizes="(max-width: 900px) 46vw, 25vw" style={{ objectFit: 'cover' }} />
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: '#fff' }}>
                    <Typography className={headingFont.className} sx={{ color: '#1f456a', fontSize: { xs: '0.92rem', md: '1rem' } }}>
                      {item.title}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" id="reviews" sx={{ py: { xs: 4, md: 6 } }}>
          <SectionHeading title="รีวิวลูกค้า" subtitle="เสียงจากลูกค้าที่ใช้บริการงานพิมพ์และสื่อสิ่งพิมพ์กับทางร้าน" />
          <Grid container spacing={2}>
            {reviews.map(item => (
              <Grid key={item.name} size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #dbe9f7', bgcolor: '#fff', boxShadow: '0 10px 24px rgba(44, 79, 112, 0.07)', height: '100%' }}>
                  <Stack spacing={1.4} sx={{ p: 2 }}>
                    <Typography sx={{ color: '#456788', lineHeight: 1.8, fontSize: '0.95rem' }}>&quot;{item.review}&quot;</Typography>
                    <Typography className={headingFont.className} sx={{ color: '#1d4469', fontSize: '0.95rem' }}>
                      {item.name}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box component="section" id="faq" sx={{ py: { xs: 5, md: 7 } }}>
          <SectionHeading title="คำถามที่พบบ่อย" subtitle="ตอบคำถามสำคัญก่อนสั่งผลิตงานพิมพ์" />
          <Stack spacing={1.3}>
            {faqs.map(item => (
              <Accordion
                key={item.question}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: '12px !important',
                  border: '1px solid #d9e8f7',
                  bgcolor: '#fff',
                  boxShadow: '0 8px 16px rgba(41, 75, 108, 0.06)',
                  '&::before': { display: 'none' },
                }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ color: '#1f5b90' }} />}>
                  <Typography className={headingFont.className} sx={{ color: '#1f456a', fontSize: '1rem' }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: '#5b7088' }}>{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Box>
      </Container>

      <Box component="footer" id="contact" sx={{ bgcolor: '#0f355d', color: '#eef6ff', pt: 5, pb: { xs: 10, md: 4 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography className={headingFont.className} sx={{ fontSize: '1.35rem' }}>
                Glossy Copy & Print
              </Typography>
              <Typography sx={{ opacity: 0.88, mt: 1, lineHeight: 1.8 }}>ร้านถ่ายเอกสารและสื่อสิ่งพิมพ์ครบวงจร บริการงานด่วน งานออฟฟิศ และงานธุรกิจทุกขนาด</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalPhoneRoundedIcon fontSize="small" />
                  <Typography component="a" href={phoneHref} sx={{ color: 'inherit', textDecoration: 'none' }}>
                    โทร: 02-123-4567, 089-123-4567
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ChatRoundedIcon fontSize="small" />
                  <Typography component="a" href={lineUrl} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'none' }}>
                    LINE : @glossydesign
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FacebookRoundedIcon fontSize="small" />
                  <Typography component="a" href={facebookUrl} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'none' }}>
                    Facebook: Glossy Copy & Print
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnRoundedIcon fontSize="small" />
                  <Typography component="a" href={mapsUrl} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'none' }}>
                    Google Maps: Glossy Copy & Print Shop
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeRoundedIcon fontSize="small" />
                  <Typography>เปิดทุกวัน 08:00 - 20:00 น.</Typography>
                </Stack>
                <Typography>ที่อยู่: 99/88 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10200</Typography>
                <Stack direction="row" spacing={1.2} sx={{ mt: 1 }}>
                  <Button variant="outlined" onClick={openFacebook} sx={{ color: '#eef6ff', borderColor: 'rgba(238,246,255,0.5)' }}>
                    Facebook
                  </Button>
                  <Button variant="outlined" onClick={openMaps} sx={{ color: '#eef6ff', borderColor: 'rgba(238,246,255,0.5)' }}>
                    Google Maps
                  </Button>
                  <Button variant="contained" onClick={openChat} sx={{ bgcolor: '#1f8fe0' }}>
                    LINE สอบถามราคา
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Typography sx={{ opacity: 0.78, mt: 3, pt: 2.5, borderTop: '1px solid rgba(238,246,255,0.2)', fontSize: '0.88rem' }}>
            Copyright {new Date().getFullYear()} Glossy Copy & Print. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: 12,
          right: 12,
          bottom: 12,
          display: { xs: 'block', md: 'none' },
          zIndex: 40,
        }}>
        <Card sx={{ borderRadius: '14px', border: '1px solid #cae2f7', boxShadow: '0 14px 28px rgba(32, 71, 106, 0.24)' }}>
          <Stack direction="row" spacing={1} sx={{ p: 1 }}>
            <Button fullWidth startIcon={<LocalPhoneRoundedIcon />} component="a" href={phoneHref} sx={{ borderRadius: '10px', bgcolor: '#eaf4ff', color: '#155e9d' }}>
              โทรหาเรา
            </Button>
            <Button fullWidth variant="contained" startIcon={<UploadFileRoundedIcon />} onClick={openChat} sx={{ borderRadius: '10px', bgcolor: '#1267b0' }}>
              ส่งไฟล์งาน
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
