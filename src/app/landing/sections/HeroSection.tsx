import * as React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <Box
      sx={{
        minHeight: { xs: '90vh', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'rgba(10,12,30,1)',
      }}
    >
      {/* Aurora/gradient background and floating particles would go here */}
      <Container maxWidth="lg" sx={{ zIndex: 2, position: 'relative' }}>
        <Stack spacing={5} alignItems="center" textAlign="center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 38, sm: 54, md: 72 },
                background: 'linear-gradient(90deg, #2563eb, #9333ea, #00eaff, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -2,
                mb: 2,
              }}
            >
              Modern POS System for Printing Businesses
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.82)',
                fontWeight: 500,
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
              }}
            >
              Manage orders, customer files, payments, production workflow, and printing operations in one smart platform.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mb={4}>
              <Button size="large" variant="contained" color="primary" sx={{ px: 5, py: 1.5, fontWeight: 800, borderRadius: 99, fontSize: 20, boxShadow: '0 8px 32px #2563eb55' }}>
                Start Free Trial
              </Button>
              <Button size="large" variant="outlined" color="primary" sx={{ px: 5, py: 1.5, fontWeight: 800, borderRadius: 99, fontSize: 20, bgcolor: 'rgba(255,255,255,0.08)', borderColor: '#00eaff', color: '#00eaff', boxShadow: '0 8px 32px #00eaff33', '&:hover': { bgcolor: 'rgba(0,234,255,0.12)' } }}>
                Watch Demo
              </Button>
            </Stack>
          </motion.div>
          {/* TODO: Add floating dashboard mockup, trust badge, mini stats, floating cards, etc. */}
        </Stack>
      </Container>
    </Box>
  );
}
