import { Alert, alpha, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileDownloadDoneRoundedIcon from '@mui/icons-material/FileDownloadDoneRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
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
      <AdminHeroHeader
        title="Storage"
        description="จัดการไฟล์ลูกค้าและสถานะงานพิมพ์ในระบบคลังเอกสาร"
        lastSynced={formatAdminLastSynced(lastSyncedAt)}
        thaiDate={formatAdminThaiDate(lastSyncedAt)}
        notice={
          missingApiBase || errorMessage || actionMessage ? (
            <Stack spacing={1}>
              {missingApiBase ? <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าคลังไฟล์เชื่อมต่อรายการอัปโหลดได้" /> : null}
              {errorMessage ? <Alert severity="warning">{errorMessage}</Alert> : null}
              {actionMessage ? <Alert severity={actionMessage.severity}>{actionMessage.text}</Alert> : null}
            </Stack>
          ) : undefined
        }
        actions={
          <>
              <Button
                onClick={onRefresh}
                startIcon={<RefreshRoundedIcon />}
                variant="outlined"
                sx={heroOutlineButtonSx}>
                รีเฟรช
              </Button>
              <Button
                onClick={onExport}
                startIcon={<FileDownloadDoneRoundedIcon />}
                variant="outlined"
                sx={heroOutlineButtonSx}>
                ส่งออก
              </Button>
              <Button
                onClick={onDownloadSelected}
                disabled={selectedCount === 0}
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                sx={heroPrimaryButtonSx}>
                ดาวน์โหลดที่เลือก
              </Button>
          </>
        }
      />
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
