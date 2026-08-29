'use client';

import * as React from 'react';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '../components/AdminHeroHeader';
import AdminPageContainer from '../components/AdminPageContainer';
import GlossyDetailDrawer from '@/components/drawers/GlossyDetailDrawer';
import {
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_META,
  advanceProductionJob,
  listProductionAssignees,
  listProductionJobs,
  nextProductionStage,
  updateProductionJob,
  type ProductionAssignee,
  type ProductionDueFilter,
  type ProductionJob,
  type ProductionPriority,
  type ProductionStage,
} from '@/lib/production';

type SessionIdentity = { id: string; username: string; role: 'staff' | 'manager' | 'admin' };
type StageFilter = 'all' | ProductionStage;
type PriorityFilter = 'all' | ProductionPriority;
type ViewMode = 'board' | 'list';

const stageTone: Record<ProductionStage, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  file_check: 'default',
  queued: 'info',
  producing: 'primary',
  quality_check: 'warning',
  ready: 'success',
  delivered: 'success',
};

function formatDue(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function replaceJob(rows: ProductionJob[], updated: ProductionJob) {
  return rows.map(row => (row.id === updated.id ? updated : row));
}

function ProductionCard({
  job,
  busy,
  onOpen,
  onAdvance,
}: Readonly<{
  job: ProductionJob;
  busy: boolean;
  onOpen: (job: ProductionJob) => void;
  onAdvance: (job: ProductionJob) => void;
}>) {
  const next = nextProductionStage(job.stage);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: job.isOverdue ? 'error.light' : 'divider', overflow: 'hidden' }}>
      <CardActionArea onClick={() => onOpen(job)} sx={{ textAlign: 'left' }}>
        <CardContent>
          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={900} noWrap>{job.jobNumber}</Typography>
                <Typography variant="caption" color="text.secondary">Order {job.orderNumber}</Typography>
              </Box>
              {job.isRush ? <Chip size="small" icon={<LocalFireDepartmentRoundedIcon />} color="error" label="RUSH" /> : null}
            </Stack>
            <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{job.workSummary}</Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap" useFlexGap>
              {job.jobType ? <Chip size="small" variant="outlined" label={job.jobType} /> : null}
              <Chip size="small" color={stageTone[job.stage]} label={PRODUCTION_STAGE_META[job.stage].label} />
              <Chip size="small" variant="outlined" label={job.linkedUploadIds.length ? `ไฟล์ ${job.linkedUploadIds.length}` : 'ยังไม่มีไฟล์'} />
            </Stack>
            <Box>
              <Typography variant="caption" color={job.isOverdue ? 'error.main' : 'text.secondary'} fontWeight={job.isOverdue ? 800 : 500}>
                {job.isOverdue ? 'เกินกำหนด · ' : 'กำหนด · '}{formatDue(job.dueAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                ผู้รับผิดชอบ: {job.assignee?.username || 'ยังไม่มอบหมาย'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
      {next ? (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Button
            size="small"
            fullWidth
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            disabled={busy}
            onClick={() => onAdvance(job)}
          >
            ไปขั้น {PRODUCTION_STAGE_META[next].shortLabel}
          </Button>
        </Box>
      ) : null}
    </Card>
  );
}

function StageColumn({
  stage,
  jobs,
  busyId,
  onOpen,
  onAdvance,
}: Readonly<{
  stage: ProductionStage;
  jobs: ProductionJob[];
  busyId: string | null;
  onOpen: (job: ProductionJob) => void;
  onAdvance: (job: ProductionJob) => void;
}>) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography fontWeight={900}>{PRODUCTION_STAGE_META[stage].label}</Typography>
        <Chip size="small" label={jobs.length} />
      </Stack>
      <Stack spacing={1.25}>
        {jobs.map(job => <ProductionCard key={job.id} job={job} busy={busyId === job.id} onOpen={onOpen} onAdvance={onAdvance} />)}
        {jobs.length === 0 ? (
          <Box sx={{ py: 4, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">ไม่มีงานในขั้นนี้</Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

function TrackingProjection({ job }: Readonly<{ job: ProductionJob }>) {
  const labels = {
    received: 'รับงานแล้ว',
    in_progress: 'กำลังดำเนินการ',
    ready: 'พร้อมรับงาน',
    completed: 'เสร็จสมบูรณ์',
  } as const;
  return (
    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover' }}>
      <Typography variant="caption" color="text.secondary">Customer Tracking projection</Typography>
      <Typography fontWeight={800}>{labels[job.customerMilestone]}</Typography>
    </Box>
  );
}

function JobTicketDrawer({
  job,
  assignees,
  session,
  busy,
  onClose,
  onChanged,
}: Readonly<{
  job: ProductionJob | null;
  assignees: ProductionAssignee[];
  session: SessionIdentity | null;
  busy: boolean;
  onClose: () => void;
  onChanged: (job: ProductionJob) => void;
}>) {
  const [note, setNote] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setNote(job?.internalNote ?? '');
    setError(null);
  }, [job]);

  if (!job) return null;
  const next = nextProductionStage(job.stage);

  const assign = async (userId: string) => {
    setError(null);
    try {
      onChanged(await updateProductionJob(job.id, { assigneeUserId: userId }));
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'มอบหมายงานไม่สำเร็จ');
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    setError(null);
    try {
      onChanged(await updateProductionJob(job.id, { internalNote: note }));
    } catch (noteError) {
      setError(noteError instanceof Error ? noteError.message : 'บันทึกโน้ตไม่สำเร็จ');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <GlossyDetailDrawer
      open
      onClose={onClose}
      title="Job Ticket"
      subtitle={`${job.jobNumber} · Order ${job.orderNumber}`}
      headerActions={<Chip color={stageTone[job.stage]} label={PRODUCTION_STAGE_META[job.stage].label} />}
      footer={(
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button component={Link} href={`/home/orders?focus=${encodeURIComponent(job.orderId)}`} variant="outlined" startIcon={<DescriptionRoundedIcon />} fullWidth>
              เปิด Order หลัก
            </Button>
            {next ? (
              <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
                disabled={busy}
                onClick={async () => onChanged(await advanceProductionJob(job.id, next))}
              >
                ไปขั้น {PRODUCTION_STAGE_META[next].shortLabel}
              </Button>
            ) : null}
          </Stack>
        </Box>
      )}>
      <Stack spacing={2}>
            {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography fontWeight={900}>สเปกงานผลิต</Typography>
                  <Typography>{job.workSummary}</Typography>
                  <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={job.jobType || 'ไม่ระบุประเภทงาน'} variant="outlined" />
                    <Chip size="small" label={job.isRush ? 'Rush' : 'Normal'} color={job.isRush ? 'error' : 'default'} />
                    <Chip size="small" label={`กำหนด ${formatDue(job.dueAt)}`} color={job.isOverdue ? 'error' : 'default'} />
                  </Stack>
                  <TrackingProjection job={job} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography fontWeight={900}>ผู้รับผิดชอบ</Typography>
                  <TextField
                    select
                    size="small"
                    label="มอบหมายให้"
                    value={job.assignee?.id ?? ''}
                    onChange={event => void assign(event.target.value)}
                    disabled={busy}
                  >
                    <MenuItem value="" disabled>ยังไม่มอบหมาย</MenuItem>
                    {assignees.map(user => <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>)}
                  </TextField>
                  {session?.id && session.id !== job.assignee?.id ? (
                    <Button startIcon={<AssignmentIndRoundedIcon />} variant="outlined" onClick={() => void assign(session.id)} disabled={busy}>
                      มอบหมายให้ฉัน ({session.username})
                    </Button>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography fontWeight={900}>ไฟล์ลูกค้า</Typography>
                  {job.linkedUploadIds.length ? job.linkedUploadIds.map(uploadId => (
                    <Button
                      key={uploadId}
                      component={Link}
                      href={`/home/storage?order=${encodeURIComponent(job.orderId)}&focus=${encodeURIComponent(uploadId)}`}
                      target="_blank"
                      variant="outlined"
                      startIcon={<FolderOpenRoundedIcon />}
                      endIcon={<OpenInNewRoundedIcon />}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      {uploadId}
                    </Button>
                  )) : <Typography variant="body2" color="text.secondary">ยังไม่มีไฟล์ที่เชื่อมกับ Job นี้</Typography>}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Typography fontWeight={900}>โน้ตภายใน</Typography>
                  <TextField multiline minRows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="รายละเอียดสำหรับทีมผลิต" />
                  <Button variant="outlined" onClick={() => void saveNote()} disabled={savingNote || note === (job.internalNote ?? '')}>
                    {savingNote ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900} sx={{ mb: 1.25 }}>ประวัติขั้นตอน</Typography>
                <Stack spacing={1} divider={<Divider flexItem />}>
                  {[...job.stageHistory].reverse().map((entry, index) => (
                    <Box key={`${entry.stage}-${entry.changedAt}-${index}`}>
                      <Typography variant="body2" fontWeight={800}>{PRODUCTION_STAGE_META[entry.stage].label}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDue(entry.changedAt)} · {entry.changedBy}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>วัสดุ / Stock reference</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>ยังไม่มีรายการวัสดุที่เชื่อมกับ Job Ticket นี้</Typography>
              </CardContent>
            </Card>
      </Stack>
    </GlossyDetailDrawer>
  );
}

export default function ProductionPage() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [jobs, setJobs] = React.useState<ProductionJob[]>([]);
  const [assignees, setAssignees] = React.useState<ProductionAssignee[]>([]);
  const [session, setSession] = React.useState<SessionIdentity | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<ProductionJob | null>(null);
  const [search, setSearch] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stage, setStage] = React.useState<StageFilter>('all');
  const [due, setDue] = React.useState<ProductionDueFilter>('all');
  const [priority, setPriority] = React.useState<PriorityFilter>('all');
  const [assigneeId, setAssigneeId] = React.useState('all');
  const [jobType, setJobType] = React.useState('all');
  const [knownJobTypes, setKnownJobTypes] = React.useState<string[]>([]);
  const [view, setView] = React.useState<ViewMode>('board');
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setSearchQuery(search.trim()), 250);
    return () => window.clearTimeout(handle);
  }, [search]);

  React.useEffect(() => {
    void Promise.all([
      fetch('/api/admin/session', { cache: 'no-store' }).then(async response => response.ok ? (await response.json()) as SessionIdentity : null),
      listProductionAssignees(),
    ]).then(([identity, rows]) => {
      if (identity?.id) setSession(identity);
      setAssignees(rows);
    }).catch(() => {
      // The board itself remains usable if optional session/assignee enrichment is temporarily unavailable.
    });
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listProductionJobs({
        limit: 100,
        stage: stage === 'all' ? undefined : stage,
        due,
        priority: priority === 'all' ? undefined : priority,
        assigneeUserId: assigneeId === 'all' ? undefined : assigneeId,
        jobType: jobType === 'all' ? undefined : jobType,
        q: searchQuery || undefined,
      });
      setJobs(response.items);
      setKnownJobTypes(current => Array.from(new Set([...current, ...response.items.map(item => item.jobType).filter((value): value is string => Boolean(value))])).sort());
      setLastSyncedAt(new Date());
      setSelectedJob(current => current ? response.items.find(item => item.id === current.id) ?? current : null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'โหลด Production Board ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [assigneeId, due, jobType, priority, searchQuery, stage]);

  React.useEffect(() => void load(), [load]);

  React.useEffect(() => {
    if (mobile) setView('board');
  }, [mobile]);

  const onChanged = React.useCallback((updated: ProductionJob) => {
    setJobs(current => replaceJob(current, updated));
    setSelectedJob(current => current?.id === updated.id ? updated : current);
  }, []);

  const advance = React.useCallback(async (job: ProductionJob) => {
    const next = nextProductionStage(job.stage);
    if (!next) return;
    setBusyId(job.id);
    setError(null);
    try {
      onChanged(await advanceProductionJob(job.id, next));
    } catch (advanceError) {
      setError(advanceError instanceof Error ? advanceError.message : 'อัปเดตขั้นตอนงานไม่สำเร็จ');
      await load();
    } finally {
      setBusyId(null);
    }
  }, [load, onChanged]);

  const visibleStages = stage === 'all' ? PRODUCTION_STAGES : [stage];

  return (
    <AdminPageContainer>
      <Stack spacing={2.25}>
        <AdminHeroHeader
          title="Production Board"
          description="คุมคิวงานผลิตจากไฟล์เข้า → ผลิต → QC → พร้อมส่งมอบ โดยแยกจากสถานะการชำระเงิน"
          lastSynced={formatAdminLastSynced(lastSyncedAt)}
          thaiDate={formatAdminThaiDate(lastSyncedAt)}
          actions={<Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void load()} disabled={loading}>รีเฟรช</Button>}
        />

        {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <TextField
                size="small"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="ค้นหาเลข Job, Order, ชื่อลูกค้า หรืองาน"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,minmax(0,1fr))' }, gap: 1 }}>
                <TextField select size="small" label="กำหนดส่ง" value={due} onChange={event => setDue(event.target.value as ProductionDueFilter)}>
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="today">ครบกำหนดวันนี้</MenuItem>
                  <MenuItem value="overdue">เกินกำหนด</MenuItem>
                </TextField>
                <TextField select size="small" label="ความเร่งด่วน" value={priority} onChange={event => setPriority(event.target.value as PriorityFilter)}>
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="rush">Rush</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                </TextField>
                <TextField select size="small" label="ผู้รับผิดชอบ" value={assigneeId} onChange={event => setAssigneeId(event.target.value)}>
                  <MenuItem value="all">ทุกคน</MenuItem>
                  {session?.id ? <MenuItem value={session.id}>งานของฉัน</MenuItem> : null}
                  {assignees.filter(user => user.id !== session?.id).map(user => <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="ประเภทงาน" value={jobType} onChange={event => setJobType(event.target.value)}>
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  {knownJobTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={stage}
              onChange={(_, value: StageFilter | null) => value && setStage(value)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              <ToggleButton value="all">ทั้งหมด</ToggleButton>
              {PRODUCTION_STAGES.map(value => <ToggleButton key={value} value={value}>{PRODUCTION_STAGE_META[value].shortLabel}</ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
          {!mobile ? (
            <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, value: ViewMode | null) => value && setView(value)}>
              <ToggleButton value="board"><Tooltip title="Kanban"><ViewColumnRoundedIcon fontSize="small" /></Tooltip></ToggleButton>
              <ToggleButton value="list"><Tooltip title="Compact list"><ViewListRoundedIcon fontSize="small" /></Tooltip></ToggleButton>
            </ToggleButtonGroup>
          ) : null}
        </Stack>

        {loading && jobs.length === 0 ? <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : null}

        {!loading && jobs.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography fontWeight={800}>ไม่พบงานผลิตตามตัวกรอง</Typography>
            <Typography variant="body2" color="text.secondary">ลองเปลี่ยนช่วงกำหนดส่ง ขั้นตอน หรือคำค้นหา</Typography>
          </Box>
        ) : null}

        {jobs.length > 0 && view === 'board' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: visibleStages.length > 1 ? 'repeat(3,minmax(0,1fr))' : '1fr', xl: visibleStages.length > 1 ? `repeat(${visibleStages.length},minmax(220px,1fr))` : '1fr' }, gap: 1.5, alignItems: 'start' }}>
            {visibleStages.map(value => (
              <StageColumn
                key={value}
                stage={value}
                jobs={jobs.filter(job => job.stage === value)}
                busyId={busyId}
                onOpen={setSelectedJob}
                onAdvance={job => void advance(job)}
              />
            ))}
          </Box>
        ) : null}

        {jobs.length > 0 && view === 'list' ? (
          <TableContainer component={Card} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" sx={{ minWidth: 1000 }}>
              <TableHead><TableRow><TableCell>Job / Order</TableCell><TableCell>งาน</TableCell><TableCell>ขั้นตอน</TableCell><TableCell>กำหนด</TableCell><TableCell>ผู้รับผิดชอบ</TableCell><TableCell>ไฟล์</TableCell><TableCell align="right">ทำงานต่อ</TableCell></TableRow></TableHead>
              <TableBody>
                {jobs.map(job => {
                  const next = nextProductionStage(job.stage);
                  return (
                    <TableRow key={job.id} hover onClick={() => setSelectedJob(job)} sx={{ cursor: 'pointer' }}>
                      <TableCell><Typography variant="body2" fontWeight={800}>{job.jobNumber}</Typography><Typography variant="caption" color="text.secondary">{job.orderNumber}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{job.workSummary}</Typography><Typography variant="caption" color="text.secondary">{job.jobType || 'ไม่ระบุประเภท'}</Typography></TableCell>
                      <TableCell><Chip size="small" color={stageTone[job.stage]} label={PRODUCTION_STAGE_META[job.stage].label} /></TableCell>
                      <TableCell><Typography variant="body2" color={job.isOverdue ? 'error.main' : undefined} fontWeight={job.isOverdue ? 800 : 500}>{formatDue(job.dueAt)}</Typography>{job.isRush ? <Chip size="small" color="error" label="RUSH" /> : null}</TableCell>
                      <TableCell>{job.assignee?.username || '-'}</TableCell>
                      <TableCell>{job.linkedUploadIds.length}</TableCell>
                      <TableCell align="right">{next ? <Button size="small" disabled={busyId === job.id} onClick={event => { event.stopPropagation(); void advance(job); }}>ไป {PRODUCTION_STAGE_META[next].shortLabel}</Button> : '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Stack>

      <JobTicketDrawer
        job={selectedJob}
        assignees={assignees}
        session={session}
        busy={Boolean(selectedJob && busyId === selectedJob.id)}
        onClose={() => setSelectedJob(null)}
        onChanged={onChanged}
      />
    </AdminPageContainer>
  );
}
