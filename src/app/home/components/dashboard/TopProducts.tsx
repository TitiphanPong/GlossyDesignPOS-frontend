'use client';

import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const PRODUCTS = [
  { rank: 1, name: 'โฟโต้บุ๊ค',       sold: 148, pct: 88, emoji: '📖', color: '#6C4DFF' },
  { rank: 2, name: 'สติ๊กเกอร์ PVC',   sold: 124, pct: 74, emoji: '🏷️', color: '#3B82F6' },
  { rank: 3, name: 'การ์ดแต่งงาน',     sold: 103, pct: 61, emoji: '💌', color: '#EC4899' },
  { rank: 4, name: 'นามบัตร',           sold: 89,  pct: 53, emoji: '💼', color: '#10B981' },
  { rank: 5, name: 'โปสเตอร์',         sold: 74,  pct: 44, emoji: '🖼️', color: '#F59E0B' },
];

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#CD7C2F'];

export default function TopProducts() {
  return (
    <Paper
      elevation={0}
      className="glass-card-hover"
      sx={{
        borderRadius: '20px',
        background: 'white',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        p: 3,
        overflow: 'hidden',
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', mb: 0.5, letterSpacing: '-0.3px' }}>
        🏆 สินค้าขายดี
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 2.5, fontWeight: 500 }}>
        อันดับยอดขายประจำเดือน
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 280, damping: 24 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Rank badge */}
              <Box
                sx={{
                  width: 28, height: 28,
                  borderRadius: '8px',
                  background: i < 3
                    ? `linear-gradient(135deg, ${RANK_COLORS[i]}33, ${RANK_COLORS[i]}66)`
                    : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: i < 3 ? RANK_COLORS[i] : '#9CA3AF',
                    lineHeight: 1,
                  }}
                >
                  {p.rank}
                </Typography>
              </Box>

              {/* Emoji icon */}
              <Box
                sx={{
                  width: 36, height: 36,
                  borderRadius: '10px',
                  background: `${p.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17,
                  flexShrink: 0,
                }}
              >
                {p.emoji}
              </Box>

              {/* Name + progress */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1035', lineHeight: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>
                    {p.sold} ชิ้น
                  </Typography>
                </Box>

                {/* Progress bar */}
                <Box sx={{ height: 6, borderRadius: '99px', background: '#F3F4F6', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 1.1, delay: i * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: '99px',
                      background: `linear-gradient(90deg, ${p.color}cc, ${p.color})`,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Paper>
  );
}
