'use client';

import { Card, CardContent, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { posSellerLocale } from '../locales/th';

type Props = {
  fullPayment: boolean;
  total: number;
  deposit: number;
  remaining: number;
  onFullPaymentChange: (next: boolean) => void;
  onTotalChange: (value: number) => void;
  onDepositChange: (value: number) => void;
  allowDepositTotalEdit?: boolean;
  allowFullAmountEdit?: boolean;
  moneyInputType?: 'number' | 'text';
};

export default function PosPaymentSummaryFields({
  fullPayment,
  total,
  deposit,
  remaining,
  onFullPaymentChange,
  onTotalChange,
  onDepositChange,
  allowDepositTotalEdit = false,
  allowFullAmountEdit = false,
  moneyInputType = 'number',
}: Readonly<Props>) {
  return (
    <RadioGroup row value={fullPayment ? 'full' : 'deposit'} onChange={e => onFullPaymentChange(e.target.value === 'full')} sx={{ width: '100%' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch" flexWrap="wrap" sx={{ width: '100%' }}>
        <Card
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 280,
            borderColor: fullPayment ? 'grey.300' : 'primary.main',
          }}>
          <CardContent>
            <FormControlLabel value="deposit" control={<Radio />} label={<Typography variant="subtitle1" fontWeight={600}>{posSellerLocale.common.depositProduct}</Typography>} />
            <Stack spacing={2} mt={2}>
              <TextField
                label={posSellerLocale.common.totalLabel}
                type={moneyInputType}
                value={total}
                onChange={e => {
                  if (!fullPayment && allowDepositTotalEdit) {
                    onTotalChange(Number(e.target.value) || 0);
                  }
                }}
                fullWidth
                disabled={fullPayment || !allowDepositTotalEdit}
                slotProps={{ input: { endAdornment: '฿' } }}
              />
              <TextField
                label={posSellerLocale.common.depositLabel}
                type="number"
                value={deposit}
                onChange={e => onDepositChange(Number(e.target.value) || 0)}
                fullWidth
                disabled={fullPayment}
                slotProps={{ input: { endAdornment: '฿' } }}
              />
              <TextField
                label={posSellerLocale.common.remainingLabel}
                value={remaining}
                fullWidth
                disabled
                slotProps={{ input: { endAdornment: '฿' } }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 280,
            borderColor: fullPayment ? 'primary.main' : 'grey.300',
          }}>
          <CardContent>
            <FormControlLabel value="full" control={<Radio />} label={<Typography variant="subtitle1" fontWeight={600}>{posSellerLocale.common.fullPaymentLabel}</Typography>} />
            <Stack spacing={2} mt={2}>
              <TextField
                label={posSellerLocale.common.amountLabel}
                type={moneyInputType}
                value={total}
                onChange={e => {
                  if (fullPayment && allowFullAmountEdit) {
                    onTotalChange(Number(e.target.value) || 0);
                  }
                }}
                fullWidth
                disabled={!fullPayment || !allowFullAmountEdit}
                slotProps={{ input: { endAdornment: '฿' } }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </RadioGroup>
  );
}
