import { Box, Card, Skeleton, Stack } from '@mui/material';

export default function AdminRouteLoading() {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 }, maxWidth: 1600, width: '100%', mx: 'auto' }}>
      <Stack spacing={2.5} aria-label="กำลังโหลดหน้า">
        <Box>
          <Skeleton variant="text" width={260} height={48} />
          <Skeleton variant="text" width={380} height={26} />
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {[0, 1, 2, 3].map(item => (
            <Card key={item} sx={{ flex: 1, p: 2, minHeight: 128 }}>
              <Skeleton width="45%" />
              <Skeleton width="70%" height={42} />
              <Skeleton width="55%" />
            </Card>
          ))}
        </Stack>
        <Card sx={{ p: 2, minHeight: 320 }}>
          <Skeleton width="28%" height={32} />
          <Skeleton variant="rounded" height={240} sx={{ mt: 2 }} />
        </Card>
      </Stack>
    </Box>
  );
}
