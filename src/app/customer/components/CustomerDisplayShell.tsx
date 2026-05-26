'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { BANNERS, WORKFLOW_STEPS } from './customerDisplayShared';
import 'swiper/css';

export function AmbientBackground() {
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
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),' + 'linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
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

export function LiveClock() {
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
        }}>
        {time}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', mt: 0.4, letterSpacing: '0.08em' }}>{date}</Typography>
    </Box>
  );
}

export function GlassCard({ children, sx }: Readonly<{ children: ReactNode; sx?: SxProps<Theme> }>) {
  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.045)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        ...sx,
      }}>
      {children}
    </Box>
  );
}

export function OrderTimeline({ currentStep }: Readonly<{ currentStep: number }>) {
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
        }}>
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
                }}>
                {done ? (
                  <Typography sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>✓</Typography>
                ) : (
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: active ? '#fff' : 'rgba(255,255,255,0.25)',
                      lineHeight: 1,
                    }}>
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
                }}>
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </GlassCard>
  );
}

export function IdleScreen() {
  useEffect(() => {
    BANNERS.forEach(item => {
      const preloadedImage = new window.Image();
      preloadedImage.src = item.img;
    });
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: '#04040A', overflow: 'hidden', position: 'relative' }}>
      <AmbientBackground />
      <Swiper modules={[Autoplay]} autoplay={{ delay: 15000, disableOnInteraction: false }} loop style={{ width: '100%', height: '100vh' }}>
        {BANNERS.map(item => (
          <SwiperSlide key={item.img}>
            <Box
              sx={{
                width: '100%',
                height: '100vh',
                position: 'relative',
              }}>
              <Image
                src={item.img}
                alt={item.title}
                fill
                priority
                loading="eager"
                unoptimized
                sizes="100vw"
                style={{
                  objectFit: 'cover',
                  filter: 'saturate(1.2) contrast(1.08) brightness(1.06)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom,rgba(4,4,10,0.18) 0%,rgba(4,4,10,0.04) 38%,rgba(4,4,10,0.22) 100%)',
                }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(4,4,10,0.02)' }} />
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
                }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box />
                  <LiveClock />
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
      }}>
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

      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.28 }}
        style={{ zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
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
            }}>
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
            }}>
            ชำระเงินเรียบร้อย
          </Typography>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.5rem', lg: '2rem' }, fontWeight: 400, color: '#00E5B0', letterSpacing: '0.06em', mt: 1 }}>Payment Successful</Typography>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}>
          <Typography sx={{ fontSize: { xs: '1rem', md: '1.3rem', lg: '1.6rem' }, color: 'rgba(255,255,255,0.55)', mt: { xs: 3, md: 4 }, fontWeight: 300 }}>
            ขอบคุณที่ใช้บริการ Glossy Design
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' }, color: 'rgba(255,255,255,0.28)', mt: 1.5, letterSpacing: '0.06em' }}>หน้าจอจะกลับสู่หน้าหลักโดยอัตโนมัติ...</Typography>
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
