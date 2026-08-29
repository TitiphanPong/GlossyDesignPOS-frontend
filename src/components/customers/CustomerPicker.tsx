'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { fetchCustomers, type CustomerProfile } from '@/lib/customers';
import { buildCustomerFieldSx } from './customerFormUi';

type CustomerPickerProps = Readonly<{
  active: boolean;
  value: CustomerProfile | null;
  taxInvoice: 'yes' | 'no';
  onChange: (customer: CustomerProfile | null) => void;
  onCreateCustomer: () => void;
}>;

function customerSecondaryText(customer: CustomerProfile): string {
  const parts = [customer.customerCode, customer.phoneNumber].filter(Boolean);
  return parts.join(' · ');
}

export default function CustomerPicker({ active, value, taxInvoice, onChange, onCreateCustomer }: CustomerPickerProps) {
  const [query, setQuery] = React.useState('');
  const [recentCustomers, setRecentCustomers] = React.useState<CustomerProfile[]>([]);
  const [searchResults, setSearchResults] = React.useState<CustomerProfile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    void fetchCustomers('', 5)
      .then(items => {
        if (cancelled) return;
        setRecentCustomers(items);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  React.useEffect(() => {
    if (!active) return;
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const timer = globalThis.setTimeout(() => {
      setLoading(true);
      setLoadError(false);
      void fetchCustomers(normalizedQuery, 10)
        .then(items => {
          if (!cancelled) setSearchResults(items);
        })
        .catch(() => {
          if (!cancelled) {
            setSearchResults([]);
            setLoadError(true);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 275);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [active, query]);

  const baseOptions = query.trim().length >= 2 ? searchResults : recentCustomers;
  const options = value && !baseOptions.some(customer => customer._id === value._id) ? [value, ...baseOptions] : baseOptions;
  const taxProfileIncomplete = taxInvoice === 'yes' && value && (!value.taxId?.trim() || !value.address?.trim());

  return (
    <Box sx={{ p: { xs: 1.5, sm: 1.75 }, border: '1px solid #E5EAF2', borderRadius: 3.5, bgcolor: '#FBFCFE' }}>
      <Stack gap={1.4}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box>
            <Typography fontWeight={900} color="#172033">
              ลูกค้า
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ไม่บังคับ · เลือกโปรไฟล์เมื่อต้องการผูกประวัติการขาย
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={value ? <PersonOutlineRoundedIcon /> : <StorefrontRoundedIcon />}
            label={value ? 'ลูกค้าประจำ' : 'ลูกค้าหน้าร้าน'}
            color={value ? 'primary' : 'default'}
            sx={{ flexShrink: 0, fontWeight: 800 }}
          />
        </Stack>

        {value ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: theme => alpha(theme.palette.primary.main, 0.2),
              bgcolor: theme => alpha(theme.palette.primary.main, 0.055),
            }}>
            <Stack direction="row" alignItems="flex-start" gap={1.25}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 2.25,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 21 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography fontWeight={900} color="#172033" noWrap>
                  {value.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {customerSecondaryText(value)}
                </Typography>
                {value.taxId ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                    Tax ID {value.taxId}
                  </Typography>
                ) : null}
              </Box>
              <Button
                size="small"
                onClick={() => onChange(null)}
                sx={{ minWidth: 0, px: 1, flexShrink: 0, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
                ใช้หน้าร้าน
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ px: 1.4, py: 1.15, borderRadius: 2.75, bgcolor: '#FFFFFF', border: '1px solid #E1E8F1' }}>
            <Stack direction="row" alignItems="center" gap={1.1}>
              <StorefrontRoundedIcon sx={{ color: '#64748B' }} />
              <Box>
                <Typography fontSize={13.5} fontWeight={850} color="#334155">
                  ลูกค้าหน้าร้าน
                </Typography>
                <Typography fontSize={11.75} color="#748296">
                  ขายได้ทันทีโดยไม่สร้างโปรไฟล์ลูกค้า
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        <Autocomplete
          fullWidth
          options={options}
          value={value}
          loading={loading}
          filterOptions={items => items}
          getOptionLabel={option => option.displayName}
          isOptionEqualToValue={(option, selected) => option._id === selected._id}
          onChange={(_event, customer) => {
            onChange(customer);
            if (customer) setQuery('');
          }}
          inputValue={query}
          onInputChange={(_event, nextValue, reason) => {
            if (reason === 'input') setQuery(nextValue);
            if (reason === 'clear') setQuery('');
          }}
          noOptionsText={query.trim().length < 2 ? 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา' : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option._id} sx={{ py: '10px !important' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} color="#172033" noWrap>
                  {option.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {customerSecondaryText(option)}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label="ค้นหาลูกค้าเดิม"
              placeholder="ชื่อ / รหัสลูกค้า / เบอร์ / Tax ID"
              helperText="ค้นหาจาก Customer Directory แล้วผูก Order กับโปรไฟล์เดิม"
              sx={buildCustomerFieldSx()}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: '#64748B' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />

        {!value && query.trim().length < 2 && recentCustomers.length > 0 ? (
          <Box>
            <Typography fontSize={11.75} fontWeight={800} color="#64748B" sx={{ mb: 0.75 }}>
              ลูกค้าล่าสุด
            </Typography>
            <Stack direction="row" gap={0.75} sx={{ overflowX: 'auto', pb: 0.25, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {recentCustomers.map(customer => (
                <Chip
                  key={customer._id}
                  clickable
                  label={customer.displayName}
                  onClick={() => onChange(customer)}
                  sx={{ flexShrink: 0, maxWidth: 190, fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #DCE5F0' }}
                />
              ))}
            </Stack>
          </Box>
        ) : null}

        {loadError ? (
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2.5 }}>
            โหลดรายชื่อลูกค้าไม่สำเร็จ แต่ยังสามารถขายแบบลูกค้าหน้าร้านได้
          </Alert>
        ) : null}

        {taxProfileIncomplete ? (
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2.5 }}>
            โปรไฟล์นี้ยังมี Tax ID หรือที่อยู่ไม่ครบ สามารถขายต่อได้ แต่ควรตรวจสอบข้อมูลก่อนออกใบกำกับภาษี
          </Alert>
        ) : null}

        {taxInvoice === 'yes' && !value ? (
          <Alert severity="info" variant="outlined" sx={{ borderRadius: 2.5 }}>
            ยังใช้ลูกค้าหน้าร้านอยู่ หากต้องออกใบกำกับภาษีให้เลือกหรือเพิ่มโปรไฟล์ลูกค้าก่อนเพื่อช่วยเติมข้อมูลเอกสาร
          </Alert>
        ) : null}

        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={onCreateCustomer}
          sx={{ alignSelf: 'flex-start', minHeight: 42, borderRadius: 2.5, bgcolor: '#FFFFFF', fontWeight: 800, textTransform: 'none' }}>
          เพิ่มลูกค้าใหม่
        </Button>
      </Stack>
    </Box>
  );
}
