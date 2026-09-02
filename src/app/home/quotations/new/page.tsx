'use client';

import * as React from 'react';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import AdminHeroHeader, { heroOutlineButtonSx } from '../../components/AdminHeroHeader';
import AdminPageContainer from '../../components/AdminPageContainer';
import QuotationBuilder from '../QuotationBuilder';

export default function NewQuotationPage() {
  return (
    <AdminPageContainer>
      <Stack spacing={2}>
        <AdminHeroHeader
          title="สร้างใบเสนอราคา"
          description="สร้างเอกสารได้โดยไม่ต้องมี Order ก่อน ระบบหลังบ้านจะยืนยันราคา ส่วนลด VAT และยอดรวมทุกครั้งที่บันทึก"
          lastSynced="-"
          thaiDate="Draft ยังไม่มีเลขใบเสนอราคาจริง จนกว่าจะส่งครั้งแรก"
          mb={0}
          actions={
            <Button component={Link} href="/home/quotations" variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={heroOutlineButtonSx}>
              กลับรายการใบเสนอราคา
            </Button>
          }
        />
        <QuotationBuilder />
      </Stack>
    </AdminPageContainer>
  );
}
