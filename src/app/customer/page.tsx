'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import './customer.css';

type PaymentMethod = 'cash' | 'promptpay' | 'transfer' | 'card';
type OrderStatus = 'pending' | 'paid' | 'partial';

type CartItem = {
  name: string;
  category?: string;
  qty: number;
  totalPrice: number;
  fullPayment?: boolean;
  deposit?: number;
  remaining?: number;
  material?: string;
  variant?: { name?: string };
  size?: string;
  note?: string;
};

type Order = {
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  total: number;
  discount: number;
  grandTotal: number;
  payment: PaymentMethod;
  status: OrderStatus;
  cart: CartItem[];
  taxInvoice?: 'yes' | 'no';
  vatAmount?: number;
  remainingTotal: number;
};

type PaymentSummary = {
  subtotal: number;
  discount: number;
  netTotal: number;
  vat: number;
  grandTotal: number;
  deposit: number;
  remaining: number;
  hasDeposit: boolean;
  amountToPay: number;
};

type StatusMeta = {
  bg: string;
  border: string;
  color: string;
  label: string;
};

type WorkflowStep = {
  id: number;
  label: string;
  sub: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: 'รับไฟล์', sub: 'File Received' },
  { id: 2, label: 'ตรวจงาน', sub: 'Reviewing' },
  { id: 3, label: 'รอชำระเงิน', sub: 'Awaiting Payment' },
  { id: 4, label: 'กำลังผลิต', sub: 'In Production' },
  { id: 5, label: 'พร้อมรับสินค้า', sub: 'Ready for Pickup' },
];

const STATUS_MESSAGES: Record<number, string> = {
  1: 'กำลังรับไฟล์งานของท่าน...',
  2: 'กำลังตรวจสอบไฟล์งาน...',
  3: 'รอการชำระเงิน  Please Proceed to Payment',
  4: 'กำลังผลิตสินค้าของท่าน...',
  5: 'สินค้าพร้อมรับแล้ว!  Ready for Pickup',
};

const BANNERS = [
  { title: 'Glossy Design', sub: 'Premium Printing Services', img: '/banners/Banner1.png' },
  { title: 'งานสติกเกอร์ครบวงจร', sub: 'Sticker & Label Printing', img: '/banners/Banner8.png' },
  { title: 'งานด่วน รอรับได้เลย', sub: 'Express Print Service', img: '/banners/Banner9.png' },
  { title: 'พิมพ์งานคุณภาพสูง', sub: 'Premium Print Production', img: '/banners/Banner10.png' },
];

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('th-TH');
}

function getWorkflowStep(status: OrderStatus): number {
  if (status === 'paid') return 5;
  if (status === 'partial') return 4;
  return 3;
}

function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  if (status === 'pending') {
    return {
      bg: 'rgba(255,152,0,0.15)',
      border: 'rgba(255,152,0,0.45)',
      color: '#FFB74D',
      label: '• รอชำระเงิน',
    };
  }

  if (status === 'partial') {
    return {
      bg: 'rgba(41,121,255,0.15)',
      border: 'rgba(41,121,255,0.45)',
      color: '#64B5F6',
      label: '• มัดจำแล้ว',
    };
  }

  return {
    bg: 'rgba(0,200,100,0.15)',
    border: 'rgba(0,200,100,0.45)',
    color: '#69F0AE',
    label: '• ชำระแล้ว',
  };
}

function computePaymentSummary(order: Order): PaymentSummary {
  const subtotal = order.total ?? 0;
  const discount = order.discount ?? 0;
  const netTotal = subtotal - discount;
  const vat = order.taxInvoice === 'yes' ? (order.vatAmount ?? netTotal * 0.07) : 0;
  const grandTotal = netTotal + vat;
  const deposit = order.cart.reduce((sum, item) => sum + (item.deposit ?? 0), 0);
  const remaining = order.cart.reduce((sum, item) => sum + (item.remaining ?? 0), 0);
  const hasDeposit = order.cart.some(item => !item.fullPayment && (item.deposit ?? 0) > 0);
  const amountToPay = hasDeposit && deposit > 0 ? deposit : grandTotal;

  return {
    subtotal,
    discount,
    netTotal,
    vat,
    grandTotal,
    deposit,
    remaining,
    hasDeposit,
    amountToPay,
  };
}

function getCartKey(item: CartItem): string {
  return [item.name, item.category ?? '', item.material ?? '', item.variant?.name ?? '', item.size ?? '', item.qty, item.totalPrice].join('|');
}

function AmbientBackground() {
  const orbs = [
    { key: 'a', w: 500, h: 500, top: '-12%', left: '-8%', color: 'rgba(124,77,255,0.10)', dur: '22s', delay: '0s' },
    { key: 'b', w: 380, h: 380, top: '55%', right: '-10%', color: 'rgba(0,229,255,0.09)', dur: '28s', delay: '6s' },
    { key: 'c', w: 280, h: 280, top: '18%', left: '42%', color: 'rgba(41,121,255,0.07)', dur: '20s', delay: '3s' },
    { key: 'd', w: 240, h: 240, bottom: '4%', left: '18%', color: 'rgba(0,200,120,0.06)', dur: '24s', delay: '10s' },
    { key: 'e', w: 180, h: 180, top: '40%', left: '70%', color: 'rgba(255,64,129,0.05)', dur: '16s', delay: '7s' },
  ];

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#04040A' }} />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 15% 50%, rgba(124,77,255,0.13) 0%, transparent 70%),' +
            'radial-gradient(ellipse 70% 50% at 85% 15%, rgba(0,140,255,0.12) 0%, transparent 65%),' +
            'radial-gradient(ellipse 60% 40% at 50% 90%, rgba(0,200,150,0.07) 0%, transparent 60%)',
          animation: 'auroraShift 18s ease-in-out infinite',
        }}
      />

      {orbs.map(orb => (
        <Box
          key={orb.key}
          sx={{
            position: 'absolute',
            width: orb.w,
            height: orb.h,
            top: orb.top,
            right: orb.right,
            bottom: orb.bottom,
            left: orb.left,
            borderRadius: '50%',
            background: orb.color,
            filter: 'blur(70px)',
            animation: `floatOrb ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '25%',
          background: 'linear-gradient(to bottom, rgba(4,4,10,0.6) 0%, transparent 100%)',
        }}
      />
    </Box>
  );
}

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('th-TH', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box sx={{ textAlign: 'right' }}>
      <Typography
        sx={{
          fontSize: { xs: '1.4rem', md: '1.7rem' },
          fontWeight: 700,
          color: '#00E5FF',
          fontFamily: '"SF Mono","Fira Code",monospace',
          lineHeight: 1,
          letterSpacing: '0.04em',
        }}
      >
        {time}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', mt: 0.4, letterSpacing: '0.08em' }}>{date}</Typography>
    </Box>
  );
}

function GlassCard({ children, sx = {} }: Readonly<{ children: React.ReactNode; sx?: object }>) {
  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.045)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

function OrderTimeline({ currentStep }: Readonly<{ currentStep: number }>) {
  const lastStepId = WORKFLOW_STEPS.at(-1)?.id;

  return (
    <GlassCard sx={{ p: { xs: 2, md: 2.5 } }}>
      <Typography
        sx={{
          fontSize: '0.62rem',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          mb: { xs: 1.5, md: 2 },
        }}
      >
        Order Progress
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {WORKFLOW_STEPS.map(step => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const hasConnector = step.id !== lastStepId;

          let connectorBackground = 'rgba(255,255,255,0.08)';
          if (done) connectorBackground = 'linear-gradient(90deg,#00E5B0,#00C853)';
          else if (active) connectorBackground = 'linear-gradient(90deg,#7C4DFF,rgba(255,255,255,0.08))';

          let dotBackground = 'rgba(255,255,255,0.06)';
          if (done) dotBackground = 'linear-gradient(135deg,#00C853,#00E5B0)';
          else if (active) dotBackground = 'linear-gradient(135deg,#7C4DFF,#2979FF)';

          let dotBorder = '2px solid rgba(255,255,255,0.1)';
          if (done) dotBorder = '2px solid rgba(0,200,120,0.5)';
          if (active) dotBorder = '2px solid rgba(0,229,255,0.75)';

          let labelColor = 'rgba(255,255,255,0.28)';
          if (done) labelColor = '#00E5B0';
          if (active) labelColor = '#00E5FF';

          return (
            <Box key={step.id} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {hasConnector && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '15px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    background: connectorBackground,
                    transition: 'background 0.6s ease',
                  }}
                />
              )}

              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                  background: dotBackground,
                  border: dotBorder,
                  boxShadow: active ? '0 0 14px rgba(0,229,255,0.5),0 0 28px rgba(124,77,255,0.25)' : 'none',
                  animation: active ? 'statusPulse 2.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.5s ease',
                }}
              >
                {done ? (
                  <Typography sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: active ? '#fff' : 'rgba(255,255,255,0.25)',
                      lineHeight: 1,
                    }}
                  >
                    {step.id}
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: '0.52rem', md: '0.62rem' },
                  mt: 0.8,
                  fontWeight: active ? 700 : 400,
                  color: labelColor,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  px: 0.3,
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </GlassCard>
  );
}

function IdleScreen() {
  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: '#04040A', overflow: 'hidden', position: 'relative' }}>
      <AmbientBackground />
      <Swiper modules={[Autoplay]} autoplay={{ delay: 5500, disableOnInteraction: false }} loop style={{ width: '100%', height: '100vh' }}>
        {BANNERS.map(item => (
          <SwiperSlide key={item.img}>
            <Box
              sx={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                backgroundImage: `url(${item.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'saturate(1.2) contrast(1.08) brightness(1.06)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom,rgba(4,4,10,0.45) 0%,rgba(4,4,10,0.14) 38%,rgba(4,4,10,0.48) 100%)',
                }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(4,4,10,0.08)' }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 28%, transparent 60%)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 3, md: 5 },
                  zIndex: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg,#7C4DFF 0%,#00E5FF 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 24px rgba(124,77,255,0.55)',
                      }}
                    >
                      <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, userSelect: 'none' }}>✦</Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: '#fff',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          lineHeight: 1,
                        }}
                      >
                        Glossy Design
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: 'rgba(255,255,255,0.45)',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          mt: 0.4,
                        }}
                      >
                        Premium Print Studio
                      </Typography>
                    </Box>
                  </Box>
                  <LiveClock />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 3.5,
                      py: 1.2,
                      borderRadius: '100px',
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#00E5B0',
                        animation: 'statusPulse 2s ease-in-out infinite',
                        boxShadow: '0 0 10px #00E5B0',
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: { xs: '0.85rem', md: '1.05rem' },
                        color: 'rgba(255,255,255,0.78)',
                        letterSpacing: '0.07em',
                      }}
                    >
                      ยินดีต้อนรับสู่ Glossy Design
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

function PaidScreen() {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: '#04040A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AmbientBackground />
      <Box
        sx={{
          position: 'absolute',
          width: '70vmin',
          height: '70vmin',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(0,200,100,0.14) 0%,transparent 70%)',
          animation: 'auroraShift 4s ease-in-out infinite',
        }}
      />

      <motion.div initial={{ scale: 0.55, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, type: 'spring', bounce: 0.28 }} style={{ zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, duration: 0.7, type: 'spring', bounce: 0.4 }}>
          <Box
            sx={{
              width: { xs: 90, md: 120 },
              height: { xs: 90, md: 120 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#00C853 0%,#00E5B0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: { xs: 3, md: 5 },
              boxShadow: '0 0 60px rgba(0,200,100,0.45),0 0 120px rgba(0,200,100,0.18)',
            }}
          >
            <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1, fontWeight: 900, color: '#fff' }}>✓</Typography>
          </Box>
        </motion.div>

        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Typography
            sx={{
              fontSize: { xs: '2.2rem', md: '3.8rem', lg: '5rem' },
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            ชำระเงินเรียบร้อย
          </Typography>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.5rem', lg: '2rem' }, fontWeight: 400, color: '#00E5B0', letterSpacing: '0.06em', mt: 1 }}>Payment Successful</Typography>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.3rem', lg: '1.6rem' }, color: 'rgba(255,255,255,0.55)', mt: { xs: 3, md: 4 }, fontWeight: 300 }}>
            ขอบคุณที่ใช้บริการ Glossy Design
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' }, color: 'rgba(255,255,255,0.28)', mt: 1.5, letterSpacing: '0.06em' }}>
            หน้าจอจะกลับสู่หน้าหลักโดยอัตโนมัติ...
          </Typography>
        </motion.div>

        <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 0.9, duration: 0.9, ease: 'easeOut' }} style={{ marginTop: '40px', originX: 0.5 }}>
          <Box
            sx={{
              width: { xs: '60%', md: '40%' },
              height: '2px',
              mx: 'auto',
              background: 'linear-gradient(90deg,transparent,#00E5B0,transparent)',
              borderRadius: '2px',
            }}
          />
        </motion.div>
      </motion.div>
    </Box>
  );
}

function PaymentCard({ payment, promptpayId, amountToPay }: Readonly<{ payment: PaymentMethod; promptpayId: string; amountToPay: number }>) {
  if (payment === 'promptpay') {
    return (
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg,rgba(0,140,200,0.10) 0%,rgba(0,200,150,0.06) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,200,150,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>ชำระด้วย PromptPay</Typography>
        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: '18px',
            background: '#fff',
            boxShadow: '0 0 0 1px rgba(0,229,255,0.15),0 0 40px rgba(0,229,255,0.22),0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <QRCodeCanvas value={generatePayload(promptpayId, { amount: Math.round(amountToPay) })} size={180} />
        </Box>
        <Box
          sx={{
            px: 3,
            py: 1,
            borderRadius: '100px',
            background: 'rgba(0,200,150,0.12)',
            border: '1px solid rgba(0,200,150,0.28)',
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00E5B0' }}>สแกน QR เพื่อชำระเงิน</Typography>
        </Box>
      </Box>
    );
  }

  if (payment === 'transfer') {
    return (
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg,rgba(63,81,181,0.12) 0%,rgba(0,188,212,0.06) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(63,81,181,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '18px',
            background: 'linear-gradient(135deg,rgba(63,81,181,0.35),rgba(0,188,212,0.25))',
            border: '1px solid rgba(63,81,181,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 28px rgba(63,81,181,0.2)',
          }}
        >
          <Typography sx={{ fontSize: '2.2rem' }}>🏦</Typography>
        </Box>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>โอนเงินผ่านธนาคาร</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>กรุณาโอนเงินและแจ้งสลิปที่เคาน์เตอร์</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        background: 'linear-gradient(135deg,rgba(0,200,100,0.10) 0%,rgba(0,229,255,0.05) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,200,100,0.22)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'linear-gradient(135deg,rgba(0,200,100,0.3),rgba(0,229,255,0.2))',
          border: '1px solid rgba(0,200,100,0.38)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0,200,100,0.2)',
        }}
      >
        <Typography sx={{ fontSize: '2.5rem' }}>💵</Typography>
      </Box>
      <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#fff' }}>
        ชำระด้วยเงินสด
      </Typography>
      <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)' }}>
        กรุณาชำระเงินที่เคาน์เตอร์
      </Typography>
    </Box>
  );
}

function ActiveOrderScreen({
  order,
  summary,
  currentStep,
  statusLabel,
  promptpayId,
}: Readonly<{
  order: Order;
  summary: PaymentSummary;
  currentStep: number;
  statusLabel: string;
  promptpayId: string;
}>) {
  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: '#04040A',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Noto Sans Thai","Inter","Plus Jakarta Sans",-apple-system,sans-serif',
      }}
    >
      <AmbientBackground />

      <motion.div initial={{ y: -56, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <Box
          sx={{
            zIndex: 10,
            px: { xs: 2.5, md: 4 },
            py: 1.4,
            background: 'rgba(255,255,255,0.028)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg,#7C4DFF 0%,#00E5FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(124,77,255,0.45)',
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1, userSelect: 'none' }}>✦</Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                Glossy Design
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.16em', textTransform: 'uppercase', mt: 0.25 }}>
                Customer Display
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.2,
              px: 2.5,
              py: 0.7,
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#00E5B0',
                animation: 'statusPulse 2s ease-in-out infinite',
                boxShadow: '0 0 8px #00E5B0',
              }}
            />
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.62)', letterSpacing: '0.04em' }}>{statusLabel}</Typography>
          </Box>

          <LiveClock />
        </Box>
      </motion.div>

      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
          p: { xs: 2, md: 2.5 },
          zIndex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '20px',
                background: 'linear-gradient(135deg,rgba(124,77,255,0.14) 0%,rgba(41,121,255,0.07) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(124,77,255,0.28)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg,transparent,rgba(0,229,255,0.35),transparent)',
                  animation: 'scanLine 6s linear infinite',
                  pointerEvents: 'none',
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase', mb: 0.5 }}>
                    Order Number
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '3.8rem', sm: '5rem', md: '6.5rem', lg: '8rem' },
                      fontWeight: 900,
                      lineHeight: 0.9,
                      letterSpacing: '-0.04em',
                      background: 'linear-gradient(135deg,#FFFFFF 0%,#00E5FF 45%,#7C4DFF 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'breatheText 5s ease-in-out infinite,gradientShift 8s ease infinite',
                    }}
                  >
                    #{order.orderId}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: '100px',
                      background: statusMeta.bg,
                      border: `1px solid ${statusMeta.border}`,
                      animation: 'statusPulse 3s ease-in-out infinite',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: statusMeta.color, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{statusMeta.label}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  gap: { xs: 2, md: 3 },
                  flexWrap: 'wrap',
                }}
              >
                {order.customerName && (
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>ลูกค้า</Typography>
                    <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#fff', mt: 0.3, letterSpacing: '-0.01em' }}>
                      คุณ {order.customerName}
                    </Typography>
                  </Box>
                )}

                {order.phoneNumber && (
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>โทรศัพท์</Typography>
                    <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 600, color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>{order.phoneNumber}</Typography>
                  </Box>
                )}

                {order.note && (
                  <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>หมายเหตุ</Typography>
                    <Typography sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, fontWeight: 400, color: 'rgba(255,255,255,0.55)', mt: 0.3 }}>{order.note}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
            <OrderTimeline currentStep={currentStep} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.35 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <GlassCard sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                รายการสินค้า • {order.cart.length} รายการ
              </Typography>

              <Box className="customer-scroll" sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {order.cart.map(item => (
                  <motion.div key={getCartKey(item)} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                    <Box
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.035)',
                        border: '1px solid rgba(255,255,255,0.065)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'background 0.2s',
                        '&:hover': { background: 'rgba(255,255,255,0.065)' },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: { xs: '0.92rem', md: '1.05rem' }, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</Typography>
                        <Typography
                          sx={{
                            fontSize: '0.68rem',
                            color: 'rgba(255,255,255,0.38)',
                            mt: 0.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {[item.material, item.variant?.name, item.size, item.category].filter(Boolean).join(' • ')}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>× {item.qty}</Typography>
                        <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 700, color: '#00E5FF', mt: 0.15 }}>฿{formatMoney(item.totalPrice)}</Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </GlassCard>
          </motion.div>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <Box
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: '20px',
                background: 'linear-gradient(135deg,rgba(41,121,255,0.13) 0%,rgba(124,77,255,0.07) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(41,121,255,0.22)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.03) 50%,transparent 60%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmerLine 4s linear infinite',
                  pointerEvents: 'none',
                }}
              />

              <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase', mb: 0.8 }}>
                {summary.hasDeposit && summary.deposit > 0 ? 'ยอดมัดจำ' : 'ยอดที่ต้องชำระ'}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '7rem' },
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg,#FFFFFF 0%,#00E5FF 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 6s ease infinite',
                  filter: 'drop-shadow(0 0 24px rgba(0,229,255,0.28))',
                }}
              >
                ฿{formatMoney(summary.amountToPay)}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 2, md: 4 },
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>ยอดรวม</Typography>
                  <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 600, color: 'rgba(255,255,255,0.72)', mt: 0.3 }}>฿{formatMoney(summary.grandTotal)}</Typography>
                </Box>

                {summary.discount > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>ส่วนลด</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 700, color: '#FF4081', mt: 0.3 }}>-฿{formatMoney(summary.discount)}</Typography>
                  </Box>
                )}

                {order.taxInvoice === 'yes' && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>VAT 7%</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 600, color: '#FFB74D', mt: 0.3 }}>฿{formatMoney(summary.vat)}</Typography>
                  </Box>
                )}

                {summary.hasDeposit && summary.remaining > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>คงเหลือ</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 700, color: '#FF6E40', mt: 0.3 }}>฿{formatMoney(summary.remaining)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <PaymentCard payment={order.payment} promptpayId={promptpayId} amountToPay={summary.amountToPay} />
          </motion.div>
        </Box>
      </Box>

      <motion.div initial={{ y: 56, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <Box
          sx={{
            zIndex: 10,
            px: { xs: 2.5, md: 4 },
            py: 1.2,
            background: 'rgba(255,255,255,0.025)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#00E5B0',
                animation: 'statusPulse 1.8s ease-in-out infinite',
                boxShadow: '0 0 7px #00E5B0',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: { xs: '0.78rem', md: '0.92rem' }, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.04em' }}>{statusLabel}</Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: '0.65rem', md: '0.72rem' },
              color: 'rgba(255,255,255,0.27)',
              letterSpacing: '0.08em',
              textAlign: 'right',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            ขอบคุณที่ใช้บริการ Glossy Design • โทร 062-562-4598
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0625624598';

  useEffect(() => {
    const handleStorage = () => {
      const str = localStorage.getItem('pendingOrder');
      if (!str) {
        setOrder(null);
        return;
      }

      try {
        setOrder(JSON.parse(str) as Order);
      } catch {
        setOrder(null);
      }
    };

    handleStorage();
    globalThis.window?.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);

    return () => {
      globalThis.window?.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!order) return;

    const fullyPaid = order.status === 'paid' || (order.status === 'partial' && order.remainingTotal === 0);
    if (!fullyPaid) return;

    const timeoutId = setTimeout(() => {
      localStorage.removeItem('pendingOrder');
      setOrder(null);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [order]);

  const summary = useMemo(() => (order ? computePaymentSummary(order) : null), [order]);
  const currentStep = order ? getWorkflowStep(order.status) : 3;
  const isPaid = order ? order.status === 'paid' || (order.status === 'partial' && order.remainingTotal === 0) : false;
  const statusLabel = STATUS_MESSAGES[currentStep] ?? 'กำลังดำเนินการ...';

  if (!order) return <IdleScreen />;
  if (isPaid) return <PaidScreen />;
  if (!summary) return <IdleScreen />;

  return <ActiveOrderScreen order={order} summary={summary} currentStep={currentStep} statusLabel={statusLabel} promptpayId={promptpayId} />;
}
