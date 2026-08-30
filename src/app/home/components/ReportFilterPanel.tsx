'use client';

import * as React from 'react';
import { Box, Button, Card, CardContent, FormControl, IconButton, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

export type DatePreset = 'all' | 'today' | 'last7' | 'last30' | 'month' | 'custom';
export type DatePresetOption = Exclude<DatePreset, 'custom'>;

export const DATE_PRESET_LABELS: Record<DatePresetOption, string> = {
  all: 'ทั้งหมด',
  today: 'วันนี้',
  last7: 'ย้อนหลัง 7 วัน',
  last30: '30 วัน',
  month: 'เดือนนี้',
};

export function bangkokDateParam(value: dayjs.Dayjs, endOfDay = false): string {
  return `${value.format('YYYY-MM-DD')}T${endOfDay ? '23:59:59' : '00:00:00'}+07:00`;
}

export function resolveDatePreset(preset: DatePresetOption): { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null } {
  const today = dayjs();
  if (preset === 'all') return { start: null, end: null };
  if (preset === 'today') return { start: today, end: today };
  if (preset === 'last7') return { start: today.subtract(6, 'day'), end: today };
  if (preset === 'last30') return { start: today.subtract(29, 'day'), end: today };
  return { start: today.startOf('month'), end: today };
}

const dateFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    borderRadius: 1.5,
    bgcolor: '#FFFFFF',
    '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
    '&:hover fieldset': { borderColor: '#94A3B8' },
    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
  },
  '& .MuiInputBase-input': { fontSize: 13, py: 0 },
};

const selectSx = {
  borderRadius: 2,
  height: 48,
  bgcolor: '#FFFFFF',
  '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
  '&:hover fieldset': { borderColor: '#94A3B8' },
  '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1 },
};

export type ReportDateRangeConfig = {
  title?: string;
  preset: DatePreset;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  presetOptions?: readonly DatePresetOption[];
  onPresetChange: (preset: DatePresetOption) => void;
  onStartDateChange: (value: dayjs.Dayjs | null) => void;
  onEndDateChange: (value: dayjs.Dayjs | null) => void;
};

export type ReportDateRangeValue = {
  preset: DatePreset;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
};

export const EMPTY_DATE_RANGE: ReportDateRangeValue = { preset: 'all', startDate: null, endDate: null };

export function createDateRangeConfig(
  value: ReportDateRangeValue,
  onChange: (next: ReportDateRangeValue) => void,
  options?: { title?: string; presetOptions?: readonly DatePresetOption[] }
): ReportDateRangeConfig {
  return {
    ...options,
    preset: value.preset,
    startDate: value.startDate,
    endDate: value.endDate,
    onPresetChange: preset => {
      const range = resolveDatePreset(preset);
      onChange({ preset, startDate: range.start, endDate: range.end });
    },
    onStartDateChange: next => {
      if (!next?.isValid()) return;
      const endDate = value.endDate && next.isAfter(value.endDate, 'day') ? next : value.endDate;
      onChange({ preset: 'custom', startDate: next, endDate });
    },
    onEndDateChange: next => {
      if (!next?.isValid()) return;
      const startDate = value.startDate && next.isBefore(value.startDate, 'day') ? next : value.startDate;
      onChange({ preset: 'custom', startDate, endDate: next });
    },
  };
}

export function ReportDateRangePanel({
  title = 'ช่วงวันที่',
  preset,
  startDate,
  endDate,
  presetOptions = ['today', 'last7', 'month'],
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
}: Readonly<ReportDateRangeConfig>) {
  return (
    <Box
      sx={{
        gridColumn: { xs: 'auto', lg: 2 },
        gridRow: { xs: 'auto', lg: '1 / span 2' },
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        p: { xs: 1.5, sm: 2.25 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
      }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: '#EFF6FF', color: '#2563EB' }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 15 }}>{title}</Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${presetOptions.length}, minmax(0, 1fr))`,
          gap: 0.5,
          p: 0.5,
          border: '1px solid #E2E8F0',
          borderRadius: 1.75,
          mb: 2,
        }}>
        {presetOptions.map(item => (
          <Button
            key={item}
            variant="text"
            onClick={() => onPresetChange(item)}
            aria-pressed={preset === item}
            sx={{
              minWidth: 0,
              minHeight: 38,
              px: 0.5,
              borderRadius: 1.25,
              textTransform: 'none',
              color: preset === item ? '#1D4ED8' : '#64748B',
              bgcolor: preset === item ? '#EFF6FF' : 'transparent',
              fontSize: 12.5,
              fontWeight: preset === item ? 700 : 600,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}>
            {DATE_PRESET_LABELS[item]}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto minmax(0, 1fr)' }, alignItems: 'end', gap: 0.75 }}>
        <DatePicker
          label="วันที่เริ่มต้น"
          value={startDate}
          maxDate={endDate ?? dayjs()}
          format="DD/MM/YYYY"
          onChange={onStartDateChange}
          slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
        />
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.6, color: '#94A3B8', fontSize: 18 }}>→</Typography>
        <DatePicker
          label="วันที่สิ้นสุด"
          value={endDate}
          minDate={startDate ?? undefined}
          maxDate={dayjs()}
          format="DD/MM/YYYY"
          onChange={onEndDateChange}
          slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
        />
      </Box>
      {preset === 'custom' ? <Typography sx={{ mt: 0.75, color: '#2563EB', fontSize: 12, fontWeight: 600 }}>กำหนดเอง</Typography> : null}
    </Box>
  );
}

export type ReportFilterSelectConfig = {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  minWidth?: number;
};

export type ReportFilterPanelProps = {
  title?: string;
  subtitle?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReadonlyArray<ReportFilterSelectConfig>;
  /** Extra controls rendered at the end of the filter row (e.g. a free-text filter). */
  extraFilters?: React.ReactNode;
  dateRange?: ReportDateRangeConfig;
  /** Replaces the built-in date range panel when a page needs a different date control. */
  dateSlot?: React.ReactNode;
  onReset?: () => void;
  resetDisabled?: boolean;
  resetLabel?: string;
  /** Extra content rendered below the filter grid (e.g. active filter chips or bulk actions). */
  children?: React.ReactNode;
};

export default function ReportFilterPanel({
  title = 'ค้นหารายงาน',
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'ค้นหา',
  filters = [],
  extraFilters,
  dateRange,
  dateSlot,
  onReset,
  resetDisabled = false,
  resetLabel = 'ล้างตัวกรอง',
  children,
}: Readonly<ReportFilterPanelProps>) {
  const hasDateColumn = Boolean(dateRange || dateSlot);

  return (
    <Card
      sx={{
        borderRadius: 5,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        background: '#FFFFFF',
      }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TuneRoundedIcon sx={{ color: '#2563EB', fontSize: 19 }} />
              <Box>
                <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{title}</Typography>
                {subtitle ? <Typography sx={{ color: '#64748B', fontSize: 12, mt: 0.25 }}>{subtitle}</Typography> : null}
              </Box>
            </Stack>
            {onReset ? (
              <Button
                size="small"
                disabled={resetDisabled}
                onClick={onReset}
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ minHeight: 32, px: 1, color: '#64748B', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#F8FAFC', color: '#2563EB' } }}>
                {resetLabel}
              </Button>
            ) : null}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: hasDateColumn ? 'minmax(0, 1.7fr) minmax(360px, 1fr)' : '1fr' },
              gridTemplateRows: { xs: 'auto', lg: 'auto auto' },
              gap: { xs: 1.5, lg: 2 },
              alignItems: 'stretch',
            }}>
            <TextField
              size="small"
              value={searchValue}
              onChange={event => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchValue ? (
                    <InputAdornment position="end">
                      <IconButton aria-label="ล้างคำค้นหา" size="small" onClick={() => onSearchChange('')} edge="end">
                        <ClearRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  height: 64,
                  bgcolor: '#FFFFFF',
                  '& input': { fontSize: 15, color: '#0F172A' },
                  '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                  '&:hover fieldset': { borderColor: '#94A3B8' },
                  '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                },
              }}
            />

            {dateSlot ?? (dateRange ? <ReportDateRangePanel {...dateRange} /> : null)}

            {filters.length || extraFilters ? (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  gridColumn: { xs: 'auto', lg: 1 },
                  gridRow: { xs: 'auto', lg: 2 },
                }}>
                {filters.map(filter => (
                  <FormControl key={filter.id} size="small" sx={{ minWidth: { xs: '100%', sm: filter.minWidth ?? 190 } }}>
                    <Typography sx={{ mb: 0.4, color: '#475569', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>{filter.label}</Typography>
                    <Select<string>
                      labelId={`${filter.id}-label`}
                      value={filter.value}
                      label={filter.label}
                      inputProps={{ 'aria-label': filter.label }}
                      onChange={event => filter.onChange(event.target.value)}
                      startAdornment={filter.icon ? <InputAdornment position="start">{filter.icon}</InputAdornment> : undefined}
                      sx={selectSx}>
                      {filter.options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
                {extraFilters}
              </Box>
            ) : null}
          </Box>

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
