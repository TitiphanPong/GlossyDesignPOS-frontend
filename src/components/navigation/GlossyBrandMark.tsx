import Image from 'next/image';
import { Box } from '@mui/material';
import { sidebarTokens } from './sidebarTheme';

export default function GlossyBrandMark({ size = 42, priority = false }: Readonly<{ size?: number; priority?: boolean }>) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        border: `1px solid ${sidebarTokens.border}`,
        borderRadius: `${Math.round(size * 0.27)}px`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 5px 12px rgba(37, 34, 28, 0.06)',
      }}>
      <Image
        src="/logo/logo.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: 'scale(1.67) translateY(13%)',
          transformOrigin: '50% 50%',
        }}
      />
    </Box>
  );
}
