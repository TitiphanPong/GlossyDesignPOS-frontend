'use client';

import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import generatePayload from 'promptpay-qr';
import { QRCodeCanvas } from 'qrcode.react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AmbientBackground, GlassCard, LiveClock, OrderTimeline } from './customerDisplayPrimitives';
import CartItemDetails from './CartItemDetails';
import type { Order, StatusMeta } from './customerDisplayTypes';
import type { PaymentSummaryResult } from '../../utils/computeTotal';
import type { CustomerDisplayPaymentMethod } from '../../../lib/contracts';

const UNKNOWN_PAYMENT_MESSAGE = 'เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธงเธดเธเธตเธเธณเธฃเธฐเน€เธเธดเธเธชเธณเธซเธฃเธฑเธเธญเธญเน€เธ”เธญเธฃเนเธเธตเน';

const BANNERS = [
  { title: 'Glossy Design', sub: 'Premium Printing Services', img: '/banners/Banner1.png' },
  { title: 'เธเธฒเธเธชเธ•เธดเธเน€เธเธญเธฃเนเธเธฃเธเธงเธเธเธฃ', sub: 'Sticker & Label Printing', img: '/banners/Banner8.png' },
  { title: 'เธเธฒเธเธ”เนเธงเธ เธฃเธญเธฃเธฑเธเนเธ”เนเน€เธฅเธข', sub: 'Express Print Service', img: '/banners/Banner9.png' },
  { title: 'เธเธดเธกเธเนเธเธฒเธเธเธธเธ“เธ เธฒเธเธชเธนเธ', sub: 'Premium Print Production', img: '/banners/Banner10.png' },
];

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('th-TH');
}

function getCartKey(item: Order['cart'][number]): string {
  return [item.name, item.category ?? '', item.material ?? '', item.variant?.name ?? '', item.size ?? '', item.qty, item.totalPrice].join('|');
}

export function IdleScreen() {
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
                      <Typography sx={{ fontSize: '1.5rem', lineHeight: 1, userSelect: 'none' }}>โฆ</Typography>
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
                      เธขเธดเธเธ”เธตเธ•เนเธญเธเธฃเธฑเธเธชเธนเน Glossy Design
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

export function PaidScreen() {
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
            <Typography sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1, fontWeight: 900, color: '#fff' }}>โ“</Typography>
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
            เธเธณเธฃเธฐเน€เธเธดเธเน€เธฃเธตเธขเธเธฃเนเธญเธข
          </Typography>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.5rem', lg: '2rem' }, fontWeight: 400, color: '#00E5B0', letterSpacing: '0.06em', mt: 1 }}>Payment Successful</Typography>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.3rem', lg: '1.6rem' }, color: 'rgba(255,255,255,0.55)', mt: { xs: 3, md: 4 }, fontWeight: 300 }}>
            เธเธญเธเธเธธเธ“เธ—เธตเนเนเธเนเธเธฃเธดเธเธฒเธฃ Glossy Design
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' }, color: 'rgba(255,255,255,0.28)', mt: 1.5, letterSpacing: '0.06em' }}>
            เธซเธเนเธฒเธเธญเธเธฐเธเธฅเธฑเธเธชเธนเนเธซเธเนเธฒเธซเธฅเธฑเธเนเธ”เธขเธญเธฑเธ•เนเธเธกเธฑเธ•เธด...
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

function PaymentCard({
  payment,
  promptpayId,
  amountToPay,
  hasUnsupportedPayment,
}: Readonly<{
  payment: CustomerDisplayPaymentMethod;
  promptpayId: string;
  amountToPay: number;
  hasUnsupportedPayment?: boolean;
}>) {
  if (hasUnsupportedPayment) {
    return (
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg,rgba(148,163,184,0.12) 0%,rgba(71,85,105,0.08) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(148,163,184,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธงเธดเธเธตเธเธณเธฃเธฐเน€เธเธดเธ</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{UNKNOWN_PAYMENT_MESSAGE}</Typography>
      </Box>
    );
  }

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
        <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>เธเธณเธฃเธฐเธ”เนเธงเธข PromptPay</Typography>
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
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00E5B0' }}>เธชเนเธเธ QR เน€เธเธทเนเธญเธเธณเธฃเธฐเน€เธเธดเธ</Typography>
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
          <Typography sx={{ fontSize: '2.2rem' }}>๐ฆ</Typography>
        </Box>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>เนเธญเธเน€เธเธดเธเธเนเธฒเธเธเธเธฒเธเธฒเธฃ</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>เธเธฃเธธเธ“เธฒเนเธญเธเน€เธเธดเธเนเธฅเธฐเนเธเนเธเธชเธฅเธดเธเธ—เธตเนเน€เธเธฒเธเนเน€เธ•เธญเธฃเน</Typography>
      </Box>
    );
  }

  if (payment === 'card') {
    return (
      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 3 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg,rgba(168,85,247,0.12) 0%,rgba(79,70,229,0.08) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(168,85,247,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>เธเธณเธฃเธฐเธเนเธฒเธเธเธฑเธ•เธฃ</Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>เธเธฃเธธเธ“เธฒเธเธณเธฃเธฐเธเนเธฒเธเน€เธเธฃเธทเนเธญเธเธฃเธฑเธเธเธฑเธ•เธฃเธ—เธตเนเน€เธเธฒเธเนเน€เธ•เธญเธฃเน</Typography>
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
        <Typography sx={{ fontSize: '2.5rem' }}>๐’ต</Typography>
      </Box>
      <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#fff' }}>เธเธณเธฃเธฐเธ”เนเธงเธขเน€เธเธดเธเธชเธ”</Typography>
      <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.48)' }}>เธเธฃเธธเธ“เธฒเธเธณเธฃเธฐเน€เธเธดเธเธ—เธตเนเน€เธเธฒเธเนเน€เธ•เธญเธฃเน</Typography>
    </Box>
  );
}

export function ActiveOrderScreen({
  order,
  summary,
  currentStep,
  statusLabel,
  promptpayId,
  statusMeta,
}: Readonly<{
  order: Order;
  summary: PaymentSummaryResult;
  currentStep: number;
  statusLabel: string;
  promptpayId: string;
  statusMeta: StatusMeta;
}>) {
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
        fontFamily: 'var(--font-sans), "Prompt", "Noto Sans Thai", sans-serif',
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
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1, userSelect: 'none' }}>โฆ</Typography>
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
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>เธฅเธนเธเธเนเธฒ</Typography>
                    <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, fontWeight: 700, color: '#fff', mt: 0.3, letterSpacing: '-0.01em' }}>เธเธธเธ“ {order.customerName}</Typography>
                  </Box>
                )}

                {order.phoneNumber && (
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>เนเธ—เธฃเธจเธฑเธเธ—เน</Typography>
                    <Typography sx={{ fontSize: { xs: '1rem', md: '1.25rem' }, fontWeight: 600, color: 'rgba(255,255,255,0.75)', mt: 0.3 }}>{order.phoneNumber}</Typography>
                  </Box>
                )}

                {order.note && (
                  <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>เธซเธกเธฒเธขเน€เธซเธ•เธธ</Typography>
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
                เธฃเธฒเธขเธเธฒเธฃเธชเธดเธเธเนเธฒ โ€ข {order.cart.length} เธฃเธฒเธขเธเธฒเธฃ
              </Typography>

              <Box className="customer-scroll" sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {order.cart.map(item => (
                  <motion.div key={getCartKey(item)} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                    <CartItemDetails item={item} />
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
                {summary.hasDeposit && summary.deposit > 0 ? 'เธขเธญเธ”เธกเธฑเธ”เธเธณ' : 'เธขเธญเธ”เธ—เธตเนเธ•เนเธญเธเธเธณเธฃเธฐ'}
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
                เธฟ{formatMoney(summary.amountToPay)}
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
                  <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>เธขเธญเธ”เธฃเธงเธก</Typography>
                  <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 600, color: 'rgba(255,255,255,0.72)', mt: 0.3 }}>เธฟ{formatMoney(summary.grandTotal)}</Typography>
                </Box>

                {summary.discount > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>เธชเนเธงเธเธฅเธ”</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 700, color: '#FF4081', mt: 0.3 }}>-เธฟ{formatMoney(summary.discount)}</Typography>
                  </Box>
                )}

                {order.taxInvoice === 'yes' && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>VAT 7%</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 600, color: '#FFB74D', mt: 0.3 }}>เธฟ{formatMoney(summary.vat)}</Typography>
                  </Box>
                )}

                {summary.hasDeposit && summary.remaining > 0 && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>เธเธเน€เธซเธฅเธทเธญ</Typography>
                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.1rem' }, fontWeight: 700, color: '#FF6E40', mt: 0.3 }}>เธฟ{formatMoney(summary.remaining)}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <PaymentCard payment={order.payment} promptpayId={promptpayId} amountToPay={summary.amountToPay} hasUnsupportedPayment={order.hasUnsupportedPayment} />
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
            เธเธญเธเธเธธเธ“เธ—เธตเนเนเธเนเธเธฃเธดเธเธฒเธฃ Glossy Design โ€ข เนเธ—เธฃ 062-562-4598
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
