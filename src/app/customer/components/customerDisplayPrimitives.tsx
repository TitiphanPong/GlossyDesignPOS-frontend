'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type WorkflowStep = {
  id: number;
  label: string;
  sub: string;
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: 'เธฃเธฑเธเนเธเธฅเน', sub: 'File Received' },
  { id: 2, label: 'เธ•เธฃเธงเธเธเธฒเธ', sub: 'Reviewing' },
  { id: 3, label: 'เธฃเธญเธเธณเธฃเธฐเน€เธเธดเธ', sub: 'Awaiting Payment' },
  { id: 4, label: 'เธเธณเธฅเธฑเธเธเธฅเธดเธ•', sub: 'In Production' },
  { id: 5, label: 'เธเธฃเนเธญเธกเธฃเธฑเธเธชเธดเธเธเนเธฒ', sub: 'Ready for Pickup' },
];

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
        }}
      >
        {time}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', mt: 0.4, letterSpacing: '0.08em' }}>{date}</Typography>
    </Box>
  );
}

export function GlassCard({ children, sx = {} }: Readonly<{ children: ReactNode; sx?: object }>) {
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
                  <Typography sx={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>โ“</Typography>
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
