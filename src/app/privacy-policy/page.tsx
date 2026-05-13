import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        color: '#edf2ff',
        background:
          'radial-gradient(circle at 84% 12%, rgba(73, 212, 255, 0.25), transparent 34%), radial-gradient(circle at 10% 20%, rgba(125, 104, 255, 0.28), transparent 36%), linear-gradient(140deg, #070a17 0%, #0a1130 45%, #12112f 100%)',
      }}>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={2.2}>
          <Typography sx={{ color: 'rgba(163, 236, 255, 0.95)', letterSpacing: '0.06em', fontSize: 12 }}>เอกสารทางกฎหมาย</Typography>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 800, lineHeight: 1.05 }}>นโยบายความเป็นส่วนตัว</Typography>
          <Typography sx={{ color: 'rgba(232, 239, 255, 0.72)', fontSize: 14 }}>มีผลบังคับใช้: 13 พฤษภาคม 2026</Typography>

          <Box sx={{ mt: 1, p: { xs: 2, md: 2.8 }, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 700 }}>1. ข้อมูลที่เราเก็บรวบรวม</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                เราอาจเก็บข้อมูลบัญชีผู้ใช้งาน ข้อมูลออเดอร์ลูกค้า ไฟล์ที่อัปโหลด หลักฐานการชำระเงิน และข้อมูลทางเทคนิคที่จำเป็นต่อการให้บริการของ Glossy Design
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>2. วัตถุประสงค์การใช้ข้อมูล</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                ข้อมูลถูกใช้เพื่อให้บริการหลัก รักษาความปลอดภัยบัญชี ปรับปรุงคุณภาพผลิตภัณฑ์ และสนับสนุนงานด้านบิลและการบริการลูกค้า
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>3. การจัดเก็บและความปลอดภัยของข้อมูล</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                เราใช้โครงสร้างพื้นฐานบนคลาวด์และระบบกำหนดสิทธิ์เพื่อปกป้องข้อมูล แม้ไม่มีระบบใดปลอดภัยได้ 100% แต่เราใช้มาตรฐานความปลอดภัยที่เป็นที่ยอมรับในอุตสาหกรรม
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>4. การเปิดเผยข้อมูล</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                เราไม่ขายข้อมูลของคุณ ข้อมูลจะถูกเปิดเผยเฉพาะกับผู้ให้บริการที่จำเป็นต่อการทำงานของระบบ หรือเมื่อมีกฎหมายกำหนด
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>5. สิทธิของผู้ใช้งาน</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                คุณสามารถขอแก้ไขข้อมูลบัญชี เปลี่ยนสิทธิ์การใช้งาน หรือขอปิดบัญชีได้โดยติดต่อทีมงานของเรา
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>6. ติดต่อเรา</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                หากต้องการสอบถามหรือยื่นคำขอด้านความเป็นส่วนตัว กรุณาติดต่อ privacy@glossypos.com
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.2}>
            <Button component={Link} href="/landing" variant="contained" sx={{ borderRadius: 99 }}>
              กลับสู่หน้า Landing
            </Button>
            <Button component={Link} href="/terms" variant="outlined" sx={{ borderRadius: 99, color: '#dce4ff', borderColor: 'rgba(220,228,255,0.4)' }}>
              ดูเงื่อนไขการใช้งาน
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
