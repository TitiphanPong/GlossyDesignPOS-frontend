'use client';

import * as React from 'react';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import { fetchApiJson } from '@/lib/api';
import { normalizeStaffUsers, type StaffRole as Role, type StaffUser } from './staffUsers';

type AuditEvent = {
  _id: string;
  actorUsername: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

const roleLabels: Record<Role, string> = { staff: 'พนักงาน', manager: 'ผู้จัดการ', admin: 'ผู้ดูแลระบบ' };
const roleColors: Record<Role, 'default' | 'primary' | 'secondary'> = { staff: 'default', manager: 'secondary', admin: 'primary' };
const cardSx = { borderRadius: '22px', border: '1px solid #E5E7EB', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)' };

const actionPresentation: Record<string, { title: string; description: string; color: string }> = {
  'auth.login.success': { title: 'เข้าสู่ระบบสำเร็จ', description: 'ยืนยันตัวตนและเริ่มใช้งานระบบ', color: '#10B981' },
  'auth.login.failure': { title: 'เข้าสู่ระบบไม่สำเร็จ', description: 'มีการกรอกข้อมูลเข้าสู่ระบบไม่ถูกต้อง', color: '#EF4444' },
  'auth.logout': { title: 'ออกจากระบบ', description: 'สิ้นสุดเซสชันการใช้งาน', color: '#64748B' },
  'auth.user.bootstrap': { title: 'สร้างผู้ดูแลเริ่มต้น', description: 'ระบบสร้างบัญชีผู้ดูแลครั้งแรก', color: '#8B5CF6' },
  'auth.user.create': { title: 'เพิ่มบัญชีพนักงาน', description: 'สร้างบัญชีผู้ใช้งานใหม่', color: '#2563EB' },
  'auth.user.update': { title: 'แก้ไขบัญชีพนักงาน', description: 'เปลี่ยนสิทธิ์ สถานะ หรือรหัสผ่าน', color: '#F59E0B' },
  'order.create': { title: 'สร้างรายการงาน', description: 'เพิ่มออเดอร์ใหม่เข้าสู่ระบบ', color: '#2563EB' },
  'order.update': { title: 'แก้ไขรายการงาน', description: 'ปรับปรุงข้อมูลออเดอร์', color: '#F59E0B' },
  'order.payment.add': { title: 'บันทึกการชำระเงิน', description: 'เพิ่มรายการรับชำระเงิน', color: '#10B981' },
  'product.create': { title: 'เพิ่มสินค้า', description: 'สร้างสินค้าใหม่ในระบบ', color: '#2563EB' },
  'product.update': { title: 'แก้ไขสินค้า', description: 'ปรับปรุงข้อมูลสินค้า', color: '#F59E0B' },
  'product.delete': { title: 'ลบสินค้า', description: 'นำสินค้าออกจากระบบ', color: '#EF4444' },
  'upload.update': { title: 'แก้ไขไฟล์', description: 'ปรับปรุงข้อมูลหรือสถานะไฟล์', color: '#F59E0B' },
  'upload.delete': { title: 'ลบไฟล์', description: 'นำไฟล์ออกจากคลัง', color: '#EF4444' },
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

function getAuditPresentation(action: string) {
  return (
    actionPresentation[action] ?? {
      title: action
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' › '),
      description: 'กิจกรรมที่บันทึกโดยระบบ',
      color: '#64748B',
    }
  );
}

function formatMetadata(metadata?: AuditEvent['metadata']) {
  if (!metadata) return [];
  return Object.entries(metadata).filter(([, value]) => value !== null && value !== '' && value !== false);
}

export default function StaffManagementPage() {
  const [tab, setTab] = React.useState(0);
  const [users, setUsers] = React.useState<StaffUser[]>([]);
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [passwordUser, setPasswordUser] = React.useState<StaffUser | null>(null);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<Role>('staff');
  const [saving, setSaving] = React.useState(false);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [auditSearch, setAuditSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRows, auditRows] = await Promise.all([fetchApiJson<unknown>('/auth/users', { cache: 'no-store' }), fetchApiJson<AuditEvent[]>('/auth/audit?limit=100', { cache: 'no-store' })]);
      setUsers(normalizeStaffUsers(userRows));
      setEvents(auditRows);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดข้อมูลพนักงานได้');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => void load(), [load]);

  const resetPasswordFields = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const createUser = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await fetchApiJson('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });
      setCreateOpen(false);
      setUsername('');
      setRole('staff');
      resetPasswordFields();
      setSuccess(`สร้างบัญชี ${username.trim()} เรียบร้อยแล้ว`);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'สร้างบัญชีไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user: StaffUser, changes: Partial<Pick<StaffUser, 'role' | 'active'>> & { password?: string }, message?: string) => {
    setUpdatingUserId(user.id);
    setError(null);
    setSuccess(null);
    try {
      await fetchApiJson(`/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (message) setSuccess(message);
      await load();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'แก้ไขบัญชีไม่สำเร็จ');
      return false;
    } finally {
      setUpdatingUserId(null);
    }
  };

  const changePassword = async () => {
    if (!passwordUser) return;
    setSaving(true);
    const changed = await updateUser(passwordUser, { password }, `เปลี่ยนรหัสผ่านของ ${passwordUser.username} เรียบร้อยแล้ว`);
    if (changed) {
      setPasswordUser(null);
      resetPasswordFields();
    }
    setSaving(false);
  };

  const filteredEvents = React.useMemo(() => {
    const query = auditSearch.trim().toLowerCase();
    if (!query) return events;
    return events.filter(event => {
      const presentation = getAuditPresentation(event.action);
      return [event.actorUsername, event.action, presentation.title, event.targetType, event.targetId].filter(Boolean).some(value => String(value).toLowerCase().includes(query));
    });
  }, [auditSearch, events]);

  const activeUsers = users.filter(user => user.active).length;
  const adminUsers = users.filter(user => user.active && user.role === 'admin').length;
  const passwordValid = password.length >= 6 && password === confirmPassword;

  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <AdminHeroHeader
          title="Management Accounts"
          description="จัดการบัญชี สิทธิ์การใช้งาน และตรวจสอบกิจกรรมสำคัญในระบบ"
          lastSynced={formatAdminLastSynced(lastSyncedAt)}
          thaiDate={formatAdminThaiDate(lastSyncedAt)}
          actions={
            <>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()} disabled={loading} sx={heroOutlineButtonSx}>
                {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
              </Button>
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={heroPrimaryButtonSx}>
                เพิ่มพนักงาน
              </Button>
            </>
          }
        />

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          {[
            { label: 'บัญชีทั้งหมด', value: users.length, icon: ManageAccountsRoundedIcon, color: '#2563EB' },
            { label: 'กำลังใช้งาน', value: activeUsers, icon: CheckCircleRoundedIcon, color: '#10B981' },
            { label: 'ผู้ดูแลระบบ', value: adminUsers, icon: AdminPanelSettingsRoundedIcon, color: '#8B5CF6' },
          ].map(item => (
            <Card key={item.label} sx={cardSx}>
              <CardContent sx={{ p: '20px !important' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" fontWeight={700} variant="body2">
                      {item.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(item.color, 0.12), color: item.color }}>
                    <item.icon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card sx={{ ...cardSx, overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ px: { xs: 1, md: 2 }, borderBottom: '1px solid #E5E7EB' }}>
            <Tab icon={<BadgeRoundedIcon />} iconPosition="start" label={`บัญชีพนักงาน (${users.length})`} />
            <Tab icon={<HistoryRoundedIcon />} iconPosition="start" label={`Audit log (${events.length})`} />
          </Tabs>

          {loading ? (
            <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : tab === 0 ? (
            <Stack spacing={1.5} sx={{ p: { xs: 1.5, md: 2.5 }, bgcolor: '#F8FAFC' }}>
              {users.map(user => {
                const isUpdating = updatingUserId === user.id;
                return (
                  <Paper
                    key={user.id}
                    variant="outlined"
                    sx={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3.5,
                      borderColor: user.active ? '#D9E4F5' : '#E2E8F0',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 7px 20px rgba(15, 23, 42, 0.035)',
                      opacity: user.active ? 1 : 0.76,
                      '&::before': { content: '""', position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: user.active ? '#2563EB' : '#CBD5E1' },
                    }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 1fr) auto' }, alignItems: 'stretch' }}>
                      <Stack direction="row" spacing={1.6} alignItems="center" sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: user.active ? alpha('#2563EB', 0.11) : '#F1F5F9',
                            color: user.active ? '#2563EB' : '#94A3B8',
                            fontSize: 18,
                            fontWeight: 900,
                            border: '1px solid',
                            borderColor: user.active ? '#DBEAFE' : '#E2E8F0',
                          }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                            <Typography sx={{ color: '#0F172A', fontSize: 15.5, fontWeight: 900 }} noWrap>
                              {user.username}
                            </Typography>
                            <Chip size="small" label={roleLabels[user.role]} color={roleColors[user.role]} variant="outlined" sx={{ height: 23, fontSize: 11.5, fontWeight: 750 }} />
                            <Chip size="small" label={user.active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'} color={user.active ? 'success' : 'default'} sx={{ height: 23, fontSize: 11.5, fontWeight: 750 }} />
                          </Stack>
                          <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 0.65 }}>
                            <HistoryRoundedIcon sx={{ color: '#94A3B8', fontSize: 15 }} />
                            <Typography sx={{ color: '#64748B', fontSize: 12.5 }}>เข้าสู่ระบบล่าสุด {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'ยังไม่เคยเข้าสู่ระบบ'}</Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'minmax(160px, 1fr) auto minmax(130px, auto)' },
                          gap: 1.25,
                          alignItems: 'center',
                          px: { xs: 2, md: 2.25 },
                          py: 1.5,
                          bgcolor: '#FAFCFF',
                          borderTop: { xs: '1px solid #E8EEF7', lg: 0 },
                          borderLeft: { lg: '1px solid #E8EEF7' },
                        }}>
                        <FormControl size="small" fullWidth disabled={isUpdating}>
                          <InputLabel>สิทธิ์การใช้งาน</InputLabel>
                          <Select
                            label="สิทธิ์การใช้งาน"
                            value={user.role}
                            onChange={event => void updateUser(user, { role: event.target.value as Role }, `เปลี่ยนสิทธิ์ของ ${user.username} แล้ว`)}
                            sx={{ borderRadius: 2.25, bgcolor: '#FFF' }}>
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <MenuItem key={value} value={value}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="outlined"
                          startIcon={<LockResetRoundedIcon />}
                          onClick={() => setPasswordUser(user)}
                          disabled={isUpdating}
                          sx={{ minHeight: 40, borderRadius: 2.25, whiteSpace: 'nowrap', bgcolor: '#FFF', fontWeight: 750 }}>
                          เปลี่ยนรหัสผ่าน
                        </Button>
                        <Stack direction="row" alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-start' }} spacing={0.5} sx={{ minHeight: 40, px: { xs: 1, sm: 0 } }}>
                          <Switch
                            checked={user.active}
                            disabled={isUpdating}
                            onChange={event => void updateUser(user, { active: event.target.checked }, `${event.target.checked ? 'เปิด' : 'ปิด'}ใช้งาน ${user.username} แล้ว`)}
                          />
                          <Typography sx={{ color: user.active ? '#15803D' : '#64748B', fontSize: 12.5, fontWeight: 800 }}>{user.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ bgcolor: '#F8FAFC', p: { xs: 1.5, md: 2.5 } }}>
              <TextField
                fullWidth
                size="small"
                value={auditSearch}
                onChange={event => setAuditSearch(event.target.value)}
                placeholder="ค้นหาจากผู้ใช้งาน กิจกรรม หรือรหัสรายการ"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2, maxWidth: 560, bgcolor: '#fff' }}
              />
              <Stack spacing={1.25}>
                {filteredEvents.map(event => {
                  const presentation = getAuditPresentation(event.action);
                  const metadata = formatMetadata(event.metadata);
                  return (
                    <Paper key={event._id} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#E2E8F0' }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(presentation.color, 0.12), color: presentation.color }}>
                          <HistoryRoundedIcon fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.5}>
                            <Box>
                              <Typography fontWeight={900}>{presentation.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {presentation.description}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                              {formatDateTime(event.createdAt)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                            <Chip size="small" label={`โดย ${event.actorUsername}`} sx={{ fontWeight: 700 }} />
                            {(event.targetType || event.targetId) && <Chip size="small" variant="outlined" label={`${event.targetType ?? 'รายการ'}${event.targetId ? ` · ${event.targetId}` : ''}`} />}
                            {metadata.map(([key, value]) => (
                              <Chip key={key} size="small" variant="outlined" label={`${key}: ${String(value)}`} />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <HistoryRoundedIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
                    <Typography fontWeight={800} sx={{ mt: 1 }}>
                      ไม่พบกิจกรรมที่ค้นหา
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ลองใช้คำค้นหาอื่น หรือล้างช่องค้นหา
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Card>
      </Stack>

      <Dialog
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: { xs: 3, sm: 4.5 }, overflow: 'hidden', boxShadow: '0 28px 80px rgba(15, 23, 42, 0.24)' } } }}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ p: { xs: 2.25, sm: 3 }, background: 'linear-gradient(135deg, #F7FAFF 0%, #EEF4FF 100%)', borderBottom: '1px solid #E2E8F0' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', color: '#2563EB', bgcolor: alpha('#2563EB', 0.12), flexShrink: 0 }}>
                <AddRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: 21, sm: 24 }, lineHeight: 1.2, fontWeight: 900, color: '#0F172A' }}>เพิ่มบัญชีพนักงาน</Typography>
                <Typography sx={{ mt: 0.5, color: '#64748B', fontSize: 13.5 }}>สร้างข้อมูลเข้าสู่ระบบและกำหนดสิทธิ์การใช้งานเริ่มต้น</Typography>
              </Box>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2.25, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ mb: 1.25, color: '#334155', fontSize: 13, fontWeight: 850 }}>ข้อมูลบัญชี</Typography>
              <TextField
                label="ชื่อผู้ใช้งาน"
                placeholder="เช่น glossy.staff"
                value={username}
                onChange={event => setUsername(event.target.value)}
                autoFocus
                fullWidth
                helperText="ใช้สำหรับเข้าสู่ระบบ และไม่ควรซ้ำกับบัญชีที่มีอยู่"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeRoundedIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Box>
            <Box sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <KeyRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 850 }}>ตั้งรหัสผ่านเริ่มต้น</Typography>
              </Stack>
              <PasswordFields
                password={password}
                confirmPassword={confirmPassword}
                showPassword={showPassword}
                onPasswordChange={setPassword}
                onConfirmChange={setConfirmPassword}
                onToggleVisibility={() => setShowPassword(value => !value)}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1.25, color: '#334155', fontSize: 13, fontWeight: 850 }}>สิทธิ์การใช้งาน</Typography>
              <FormControl fullWidth>
                <InputLabel>ระดับสิทธิ์</InputLabel>
                <Select label="ระดับสิทธิ์" value={role} onChange={event => setRole(event.target.value as Role)} sx={{ borderRadius: 2.5 }}>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography sx={{ mt: 1, color: '#64748B', fontSize: 12.5 }}>
                {role === 'admin'
                  ? 'ผู้ดูแลระบบสามารถจัดการบัญชีและการตั้งค่าทั้งหมด'
                  : role === 'manager'
                    ? 'ผู้จัดการเข้าถึงงานขายและการตั้งค่าที่ได้รับอนุญาต'
                    : 'พนักงานใช้งานหน้าขาย รายการงาน และคลังไฟล์'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.25, sm: 3 }, py: 2.25, borderTop: '1px solid #E2E8F0', bgcolor: '#FAFBFC', gap: 1 }}>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setUsername('');
              setRole('staff');
              resetPasswordFields();
            }}
            disabled={saving}
            sx={{ minHeight: 44, px: 2.25, borderRadius: 2.5, fontWeight: 800 }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => void createUser()}
            disabled={saving || !username.trim() || !passwordValid}
            sx={{ minHeight: 44, px: 2.5, borderRadius: 2.5, fontWeight: 850, boxShadow: '0 10px 22px rgba(37, 99, 235, 0.24)' }}>
            {saving ? 'กำลังบันทึก…' : 'สร้างบัญชี'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(passwordUser)} onClose={() => !saving && setPasswordUser(null)} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={900}>เปลี่ยนรหัสผ่าน</DialogTitle>
        <DialogContent>
          <Alert severity="info" icon={<KeyRoundedIcon />} sx={{ mb: 2 }}>
            กำลังเปลี่ยนรหัสผ่านของ <strong>{passwordUser?.username}</strong>
          </Alert>
          <PasswordFields
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirmPassword}
            onToggleVisibility={() => setShowPassword(value => !value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setPasswordUser(null);
              resetPasswordFields();
            }}
            disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={() => void changePassword()} disabled={saving || !passwordValid}>
            {saving ? 'กำลังบันทึก…' : 'ยืนยันรหัสผ่านใหม่'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}

function PasswordFields({
  password,
  confirmPassword,
  showPassword,
  onPasswordChange,
  onConfirmChange,
  onToggleVisibility,
}: Readonly<{
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onToggleVisibility: () => void;
}>) {
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  return (
    <Stack spacing={2}>
      <TextField
        label="รหัสผ่านใหม่"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={event => onPasswordChange(event.target.value)}
        helperText="อย่างน้อย 6 ตัวอักษร"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onToggleVisibility} edge="end" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}>
                  {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        label="ยืนยันรหัสผ่านใหม่"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={event => onConfirmChange(event.target.value)}
        error={mismatch}
        helperText={mismatch ? 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' : 'กรอกรหัสผ่านเดิมอีกครั้ง'}
      />
    </Stack>
  );
}
