'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

export type DashboardKpiCard = {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
  icon: string;
  iconGrad: string;
  topGrad: string;
  sparkColor: string;
  series: number[];
};

function Sparkline({ data, color, uid }: Readonly<{ data: number[]; color: string; uid: string }>) {
  const normalized = data.length > 0 ? data.map(value => ({ value })) : [{ value: 0 }];
  const gradientId = `dashboard-kpi-${uid}`;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={normalized} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.45} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.2} fill={`url(#${gradientId})`} dot={false} isAnimationActive animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type KPICardsProps = {
  cards: DashboardKpiCard[];
};

export default function KPICards({ cards }: Readonly<KPICardsProps>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr 1fr',
          sm: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 2.5,
        mb: 3.5,
      }}>
      {cards.map((card, index) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '20px',
              background: 'white',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              p: 2.5,
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 14px 44px rgba(0,0,0,0.11)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: card.topGrad,
                borderRadius: '20px 20px 0 0',
              },
            }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: card.iconGrad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.13)',
                  flexShrink: 0,
                }}>
                {card.icon}
              </Box>
            </Box>

            <Typography variant="h5" fontWeight={800} sx={{ color: '#1a1035', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              {card.value === null ? (
                'ไม่มีข้อมูล'
              ) : (
                <>
                  {card.prefix ? (
                    <Box component="span" sx={{ fontSize: '0.65em', fontWeight: 600, color: '#9CA3AF', mr: 0.5 }}>
                      {card.prefix}
                    </Box>
                  ) : null}
                  <CountUp end={card.value} duration={1.6} separator="," />
                  {card.suffix ? (
                    <Box component="span" sx={{ fontSize: '0.52em', fontWeight: 600, color: '#9CA3AF', ml: 0.6 }}>
                      {card.suffix}
                    </Box>
                  ) : null}
                </>
              )}
            </Typography>

            <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500, mt: 0.3 }}>{card.label}</Typography>

            <Box sx={{ mt: 1, mx: -1.5 }}>
              <Sparkline data={card.series} color={card.sparkColor} uid={`${index}`} />
            </Box>
          </Paper>
        </motion.div>
      ))}
    </Box>
  );
}
