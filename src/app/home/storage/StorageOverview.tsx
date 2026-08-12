import { Alert, alpha, Badge, Box, Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { MissingApiConfigState } from '../components/dashboardUi';

export type StorageStats = {
  waiting: number;
  pending: number;
  completed: number;
  totalFiles: number;
  uploadedToday: number;
};

type StorageOverviewProps = {
  stats: StorageStats;
  lastSyncedAt: Date | null;
  missingApiBase: boolean;
  errorMessage: string | null;
  actionMessage: { severity: 'success' | 'error'; text: string } | null;
  selectedCount: number;
  onRefresh: () => void;
  onExport: () => void;
  onDownloadSelected: () => void;
};

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function formatLastSynced(date: Date | null) {
  if (!date) return '-';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatThaiFullDate(date: Date | null) {
  if (!date) return 'ไม่มีวันที่';
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

function StatCard({ title, value, subtitle, icon, tone }: Readonly<{ title: string; value: string; subtitle: string; icon: React.ReactNode; tone: string }>) {
  return (
    <Card
      sx={{
        borderRadius: 4.5,
        border: '1px solid #E8EDF5',
        boxShadow: '0 12px 30px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(140deg, ${alpha(tone, 0.1)} 0%, #FFFFFF 46%, #FFFFFF 100%)`,
      }}>
      <CardContent sx={{ p: 2.35 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>{title}</Typography>
            <Typography sx={{ mt: 0.8, fontSize: 31, lineHeight: 1.1, fontWeight: 800, color: '#0B1325' }}>{value}</Typography>
            <Typography sx={{ mt: 0.6, color: '#8A95A7', fontSize: 11.8 }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.6, display: 'grid', placeItems: 'center', color: tone, bgcolor: alpha(tone, 0.14), boxShadow: `0 10px 20px ${alpha(tone, 0.2)}` }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function StorageOverview(props: Readonly<StorageOverviewProps>) {
  const { stats, lastSyncedAt, missingApiBase, errorMessage, actionMessage, selectedCount, onRefresh, onExport, onDownloadSelected } = props;
  return (
    <>
      <Card sx={{ borderRadius: 5.2, border: '1px solid #E6EDF8', boxShadow: '0 16px 36px rgba(18, 45, 82, 0.08)', background: 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 100%)' }}>
        <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
            <Box sx={{ flex: 1, minHeight: { md: 110 } }}>
              <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Storage</Typography>
              <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>จัดการไฟล์ลูกค้าและสถานะงานพิมพ์ในระบบคลังเอกสาร</Typography>
              <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>อัปเดตล่าสุด {formatLastSynced(lastSyncedAt)}</Typography>
              <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 12.5 }}>{formatThaiFullDate(lastSyncedAt)}</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ minHeight: { md: 110 } }}>
              <IconButton aria-label="การแจ้งเตือน" sx={{ borderRadius: 3, border: '1px solid #DFE8F5', bgcolor: '#FFFFFF', width: 44, height: 44, boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)' }}>
                <Badge variant="dot" sx={{ '& .MuiBadge-badge': { bgcolor: '#E5484D', boxShadow: '0 0 0 2px #FFFFFF' } }}>
                  <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
                </Badge>
              </IconButton>
              <Button
                onClick={onRefresh}
                startIcon={<RefreshRoundedIcon />}
                variant="outlined"
                sx={{ minHeight: 40, borderRadius: 3, borderColor: '#D7E3F4', bgcolor: '#FFFFFF', color: '#2A4365', px: 1.8, textTransform: 'none', fontWeight: 700 }}>
                Refresh
              </Button>
              <Button
                onClick={onExport}
                startIcon={<FileDownloadDoneRoundedIcon />}
                variant="outlined"
                sx={{ minHeight: 40, borderRadius: 3, borderColor: '#D7E3F4', bgcolor: '#FFFFFF', color: '#2A4365', px: 1.8, textTransform: 'none', fontWeight: 700 }}>
                Export
              </Button>
              <Button
                onClick={onDownloadSelected}
                disabled={selectedCount === 0}
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700, bgcolor: '#215AE8', boxShadow: '0 14px 24px rgba(26, 89, 247, 0.28)' }}>
                ดาวน์โหลดที่เลือก
              </Button>
            </Stack>
          </Stack>
          {missingApiBase && (
            <Box sx={{ mt: 2.2 }}>
              <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าคลังไฟล์เชื่อมต่อรายการอัปโหลดได้" />
            </Box>
          )}
          {errorMessage && (
            <Alert severity="warning" sx={{ mt: 2.2, borderRadius: 3 }}>
              {errorMessage}
            </Alert>
          )}
          {actionMessage && (
            <Alert severity={actionMessage.severity} sx={{ mt: 2.2, borderRadius: 3 }}>
              {actionMessage.text}
            </Alert>
          )}
        </CardContent>
      </Card>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: 1.5 }}>
        <StatCard title="ไฟล์ทั้งหมด" value={String(stats.totalFiles)} subtitle="จำนวนไฟล์ทั้งหมด" icon={<Inventory2RoundedIcon />} tone="#1E5EFF" />
        <StatCard title="รอดาวน์โหลด" value={String(stats.waiting)} subtitle="ไฟล์ที่รอดาวน์โหลด" icon={<PendingActionsRoundedIcon />} tone="#8993A4" />
        <StatCard title="รอดำเนินการ" value={String(stats.pending)} subtitle="รายการที่รับงานแล้ว" icon={<AutorenewRoundedIcon />} tone="#F08C00" />
        <StatCard title="เสร็จสิ้น" value={String(stats.completed)} subtitle="รายการที่จัดการเรียบร้อย" icon={<TaskAltRoundedIcon />} tone="#1F9D63" />
        <StatCard title="อัปโหลดวันนี้" value={String(stats.uploadedToday)} subtitle="รายการใหม่วันนี้" icon={<CloudUploadRoundedIcon />} tone="#5B4AE6" />
      </Box>
    </>
  );
}
