import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        color: '#edf2ff',
        background:
          'radial-gradient(circle at 12% 15%, rgba(79, 123, 255, 0.3), transparent 35%), radial-gradient(circle at 85% 10%, rgba(255, 111, 214, 0.2), transparent 32%), linear-gradient(145deg, #060915 0%, #0d1231 45%, #130f30 100%)',
      }}>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={2.2}>
          <Typography sx={{ color: 'rgba(163, 236, 255, 0.95)', letterSpacing: '0.06em', fontSize: 12 }}>เอกสารทางกฎหมาย</Typography>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 800, lineHeight: 1.05 }}>เงื่อนไขการใช้งาน</Typography>
          <Typography sx={{ color: 'rgba(232, 239, 255, 0.72)', fontSize: 14 }}>มีผลบังคับใช้: 13 พฤษภาคม 2026</Typography>

          <Box sx={{ mt: 1, p: { xs: 2, md: 2.8 }, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 700 }}>1. ขอบเขตการให้บริการ</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                Glossy POS ให้บริการระบบขายหน้าร้าน การจัดการออเดอร์ การจัดการไฟล์ และเวิร์กโฟลว์การผลิตบนคลาวด์ สำหรับธุรกิจงานพิมพ์และงานป้าย
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>2. ความรับผิดชอบของบัญชีผู้ใช้งาน</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                ผู้ใช้งานมีหน้าที่รับผิดชอบข้อมูลเข้าสู่ระบบ การกำหนดสิทธิ์พนักงาน และกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีขององค์กร
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>3. แพ็กเกจและการเรียกเก็บเงิน</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                ค่าบริการจะเรียกเก็บตามแพ็กเกจและรอบบิลที่เลือก การอัปเกรดอาจมีการคิดสัดส่วนตามระยะเวลาที่เหลือ และอาจมีภาษีตามข้อกำหนดของแต่ละพื้นที่
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>4. การใช้งานที่ยอมรับได้</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                ผู้ใช้งานตกลงว่าจะไม่ใช้ระบบเพื่อกิจกรรมที่ผิดกฎหมาย ไม่ใช้งานโครงสร้างพื้นฐานในทางที่ผิด และไม่อัปโหลดเนื้อหาที่ไม่มีสิทธิ์ใช้งาน
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>5. ข้อมูลและความพร้อมใช้งาน</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                เราใช้มาตรการที่เหมาะสมเพื่อให้บริการพร้อมใช้งานและปกป้องข้อมูลของคุณ อย่างไรก็ตาม ช่วงบำรุงรักษาและเหตุสุดวิสัยอาจกระทบต่อความต่อเนื่องของบริการ
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>6. ติดต่อเรา</Typography>
              <Typography sx={{ color: 'rgba(234, 240, 255, 0.8)' }}>
                หากมีคำถามด้านกฎหมายหรือการเรียกเก็บเงิน กรุณาติดต่อ sales@glossypos.com
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.2}>
            <Button component={Link} href="/landing" variant="contained" sx={{ borderRadius: 99 }}>
              กลับสู่หน้า Landing
            </Button>
            <Button component={Link} href="/privacy-policy" variant="outlined" sx={{ borderRadius: 99, color: '#dce4ff', borderColor: 'rgba(220,228,255,0.4)' }}>
              ดูนโยบายความเป็นส่วนตัว
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
