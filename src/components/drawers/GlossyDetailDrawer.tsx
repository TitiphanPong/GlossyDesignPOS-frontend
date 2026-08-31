'use client';

import * as React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

export type GlossyDetailDrawerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  mobile?: boolean;
}>;

/**
 * Canonical detail drawer shell for Glossy Design.
 *
 * The visual and responsive behavior is intentionally based on the Order Detail Drawer.
 * Feature drawers should keep their business-specific content outside this component and
 * compose it through title/subtitle/headerActions/children/footer.
 */
export default function GlossyDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  headerActions,
  footer,
  children,
  mobile,
}: GlossyDetailDrawerProps) {
  const theme = useTheme();
  const detectedMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = mobile ?? detectedMobile;

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? '100%' : { sm: 420, md: 480, lg: 560 },
            maxWidth: '100%',
            maxHeight: isMobile ? '100dvh' : '100vh',
            height: isMobile ? '100dvh' : '100%',
            borderTopLeftRadius: isMobile ? 0 : 22,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: isMobile ? 0 : 22,
            borderBottomRightRadius: 0,
            background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
            overflow: 'hidden',
          },
        },
      }}>
      <Stack sx={{ height: '100%', minHeight: 0 }}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3 },
            pt: isMobile ? 'calc(12px + env(safe-area-inset-top))' : { xs: 1.8, sm: 2.2 },
            pb: { xs: 1.5, sm: 2.2 },
            borderBottom: '1px solid #E8EFF8',
            bgcolor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box sx={{ minWidth: 0, flex: 1, maxWidth: '100%' }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.25,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}>
                  {title}
                </Typography>
                {subtitle ? (
                  <Typography
                    component="div"
                    sx={{
                      mt: 0.4,
                      color: '#64748B',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                    }}>
                    {subtitle}
                  </Typography>
                ) : null}
              </Box>

              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                {!isMobile && headerActions ? <Box sx={{ maxWidth: '100%' }}>{headerActions}</Box> : null}
                <IconButton
                  aria-label="ปิดรายละเอียด"
                  onClick={onClose}
                  size="small"
                  sx={{
                    width: 38,
                    height: 38,
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    color: '#475569',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {isMobile && headerActions ? (
              <Box sx={{ minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere' }}>{headerActions}</Box>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3 },
            pt: { xs: 2, sm: 2.3 },
            pb: isMobile && !footer ? 'calc(16px + env(safe-area-inset-bottom))' : { xs: 2, sm: 2.3 },
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            minHeight: 0,
          }}>
          {children}
        </Box>

        {footer ? (
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: '#FFFFFF',
              pb: isMobile ? 'env(safe-area-inset-bottom)' : 0,
            }}>
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Drawer>
  );
}
