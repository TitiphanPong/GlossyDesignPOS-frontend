'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AdminPageContainer from '../components/AdminPageContainer';
import { fetchApiJson } from '@/lib/api';

type Role = 'staff' | 'manager' | 'admin';
type StaffUser = { id: string; username: string; role: Role; active: boolean; lastLoginAt: string | null };
type AuditEvent = { _id: string; actorUsername: string; action: string; targetType?: string; targetId?: string; createdAt: string };

const roleLabels: Record<Role, string> = { staff: 'Staff', manager: 'Manager', admin: 'Admin' };

export default function StaffManagementPage() {
  const [tab, setTab] = React.useState(0);
  const [users, setUsers] = React.useState<StaffUser[]>([]);
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<Role>('staff');
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRows, auditRows] = await Promise.all([fetchApiJson<StaffUser[]>('/auth/users', { cache: 'no-store' }), fetchApiJson<AuditEvent[]>('/auth/audit?limit=100', { cache: 'no-store' })]);
      setUsers(userRows);
      setEvents(auditRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลสิทธิ์ผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => void load(), [load]);

  const createUser = async () => {
    setSaving(true);
    setError(null);
    try {
      await fetchApiJson('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });
      setDialogOpen(false);
      setUsername('');
      setPassword('');
      setRole('staff');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'สร้างบัญชีไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user: StaffUser, changes: Partial<Pick<StaffUser, 'role' | 'active'>>) => {
    setError(null);
    try {
      await fetchApiJson(`/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'แก้ไขบัญชีไม่สำเร็จ');
    }
  };

  return (
    <AdminPageContainer
      title="Staff & Audit"
      subtitle="จัดการบัญชี สิทธิ์การใช้งาน และตรวจสอบกิจกรรมสำคัญ"
      headerActions={
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
          เพิ่มพนักงาน
        </Button>
      }>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab label={`บัญชีพนักงาน (${users.length})`} />
          <Tab label="Audit log" />
        </Tabs>
        {loading ? (
          <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
            {users.map(user => (
              <Stack key={user.id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ p: 2.25 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={800}>{user.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    เข้าสู่ระบบล่าสุด: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('th-TH') : 'ยังไม่เคย'}
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>สิทธิ์</InputLabel>
                  <Select label="สิทธิ์" value={user.role} onChange={event => void updateUser(user, { role: event.target.value as Role })}>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Switch checked={user.active} onChange={event => void updateUser(user, { active: event.target.checked })} />
                  <Chip label={user.active ? 'ใช้งาน' : 'ปิดใช้งาน'} color={user.active ? 'success' : 'default'} size="small" />
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
            {events.map(event => (
              <Stack key={event._id} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }}>
                <Box sx={{ minWidth: 190 }}>
                  <Typography fontWeight={700}>{event.actorUsername}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.createdAt).toLocaleString('th-TH')}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight={700}>{event.action}</Typography>
                  {(event.targetType || event.targetId) && (
                    <Typography variant="body2" color="text.secondary">
                      {event.targetType}: {event.targetId}
                    </Typography>
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>เพิ่มบัญชีพนักงาน</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Username" value={username} onChange={event => setUsername(event.target.value)} autoFocus />
            <TextField label="Password" type="password" helperText="อย่างน้อย 12 ตัวอักษร" value={password} onChange={event => setPassword(event.target.value)} />
            <FormControl>
              <InputLabel>สิทธิ์</InputLabel>
              <Select label="สิทธิ์" value={role} onChange={event => setRole(event.target.value as Role)}>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={() => void createUser()} disabled={saving || !username.trim() || password.length < 12}>
            {saving ? 'กำลังบันทึก…' : 'สร้างบัญชี'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}
