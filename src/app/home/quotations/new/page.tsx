'use client';

import * as React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import AdminHeroHeader, { heroSecondaryButtonSx } from '../../components/AdminHeroHeader';
import AdminPageContainer from '../../components/AdminPageContainer';
import QuotationBuilder from '../QuotationBuilder';

export default function NewQuotationPage() {
  return (
    <AdminPageContainer>
      <Stack spacing={2}>
        <AdminHeroHeader
          title="Create Quotation"
          description="สร้างเอกสารได้โดยไม่ต้องมี Order ก่อน ระบบหลังบ้านจะยืนยันราคา ส่วนลด VAT และยอดรวมทุกครั้งที่บันทึก ร่างจะได้รับเลขใบเสนอราคาเมื่อส่งครั้งแรก"
          lastSyncedAt={null}
          mb={0}
          secondaryActions={
            <Button component={Link} href="/home/quotations" variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={heroSecondaryButtonSx}>
              กลับรายการใบเสนอราคา
            </Button>
          }
        />
        <QuotationBuilder />
      </Stack>
    </AdminPageContainer>
  );
}
