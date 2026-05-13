'use client';

import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

interface KPICardsProps {
  salesToday?: number;
  cashToday?: number;
  promptPayToday?: number;
  completed?: number;
}

interface CardDef {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: string;
  dir: 'up' | 'down' | 'neu';
  emoji: string;
  iconGrad: string;
  topGrad: string;
  sparkData: number[];
  sparkColor: string;
}

function Sparkline({ data, color, uid }: Readonly<{ data: number[]; color: string; uid: string }>) {
  const d = data.map((v) => ({ v }));
  const gradId = `sg-${uid}`;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={d} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.45} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2.2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function KPICards({ salesToday = 0, cashToday = 0, promptPayToday = 0, completed = 0 }: Readonly<KPICardsProps>) {
  const cards: CardDef[] = [
    {
      label: 'ยอดขายรวมวันนี้',
      value: salesToday,
      prefix: '฿',
      trend: '+18% จากเมื่อวาน',
      dir: 'up',
      emoji: '💰',
      iconGrad: 'linear-gradient(135deg, #6C4DFF, #A87CFF)',
      topGrad: 'linear-gradient(90deg, #6C4DFF, #8A5CFF)',
      sparkData: [4200, 5800, 4900, 6200, 7100, 9200, salesToday || 12580],
      sparkColor: '#6C4DFF',
    },
    {
      label: 'ยอดขายเงินสด',
      value: cashToday,
      prefix: '฿',
      trend: '52% ของยอดรวม',
      dir: 'neu',
      emoji: '💵',
      iconGrad: 'linear-gradient(135deg, #10B981, #34D399)',
      topGrad: 'linear-gradient(90deg, #10B981, #34D399)',
      sparkData: [2100, 3200, 2800, 3600, 4100, 5200, cashToday || 6200],
      sparkColor: '#10B981',
    },
    {
      label: 'ยอดขายโอน / QR',
      value: promptPayToday,
      prefix: '฿',
      trend: '48% ของยอดรวม',
      dir: 'neu',
      emoji: '📲',
      iconGrad: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
      topGrad: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
      sparkData: [2100, 2600, 2100, 2600, 3000, 4000, promptPayToday || 5900],
      sparkColor: '#3B82F6',
    },
    {
      label: 'งานเสร็จสิ้น',
      value: completed,
      suffix: 'งาน',
      trend: 'วันนี้',
      dir: 'up',
      emoji: '✅',
      iconGrad: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
      topGrad: 'linear-gradient(90deg, #14B8A6, #2DD4BF)',
      sparkData: [8, 14, 11, 17, 22, 25, completed || 28],
      sparkColor: '#14B8A6',
    },
    {
      label: 'งานกำลังดำเนินการ',
      value: 13,
      suffix: 'งาน',
      trend: 'กำลังผลิต',
      dir: 'down',
      emoji: '⚙️',
      iconGrad: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
      topGrad: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
      sparkData: [3, 7, 5, 9, 11, 14, 13],
      sparkColor: '#F59E0B',
    },
    {
      label: 'ลูกค้าใหม่วันนี้',
      value: 9,
      suffix: 'คน',
      trend: '+3 จากเมื่อวาน',
      dir: 'up',
      emoji: '👥',
      iconGrad: 'linear-gradient(135deg, #EC4899, #F472B6)',
      topGrad: 'linear-gradient(90deg, #EC4899, #F472B6)',
      sparkData: [2, 4, 3, 5, 6, 7, 9],
      sparkColor: '#EC4899',
    },
  ];

  const trendStyle = {
    up:  { bg: '#F0FDF4', color: '#10B981', Icon: TrendingUpRoundedIcon },
    down:{ bg: '#FFF7ED', color: '#F59E0B', Icon: TrendingDownRoundedIcon },
    neu: { bg: '#F3F4F6', color: '#6B7280', Icon: RemoveRoundedIcon },
  };

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
      }}
    >
      {cards.map((card, i) => {
        const ts = trendStyle[card.dir];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
          >
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
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 14px 44px rgba(0,0,0,0.11)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '3px',
                  background: card.topGrad,
                  borderRadius: '20px 20px 0 0',
                },
              }}
            >
              {/* Icon + Trend badge */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 42, height: 42,
                    borderRadius: '12px',
                    background: card.iconGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.13)',
                    flexShrink: 0,
                  }}
                >
                  {card.emoji}
                </Box>

                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.4,
                    background: ts.bg,
                    px: 1, py: 0.4,
                    borderRadius: '9px',
                    maxWidth: '62%',
                  }}
                >
                  <ts.Icon sx={{ fontSize: 13, color: ts.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: ts.color, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {card.trend}
                  </Typography>
                </Box>
              </Box>

              {/* Value */}
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: '#1a1035', lineHeight: 1.15, letterSpacing: '-0.5px' }}
              >
                {card.prefix && (
                  <Box component="span" sx={{ fontSize: '0.65em', fontWeight: 600, color: '#9CA3AF', mr: 0.5 }}>
                    {card.prefix}
                  </Box>
                )}
                <CountUp end={card.value} duration={1.6} separator="," />
                {card.suffix && (
                  <Box component="span" sx={{ fontSize: '0.52em', fontWeight: 600, color: '#9CA3AF', ml: 0.6 }}>
                    {card.suffix}
                  </Box>
                )}
              </Typography>

              {/* Label */}
              <Typography sx={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 500, mt: 0.3 }}>
                {card.label}
              </Typography>

              {/* Sparkline */}
              <Box sx={{ mt: 1, mx: -1.5 }}>
                <Sparkline data={card.sparkData} color={card.sparkColor} uid={`${i}`} />
              </Box>
            </Paper>
          </motion.div>
        );
      })}
    </Box>
  );
}
