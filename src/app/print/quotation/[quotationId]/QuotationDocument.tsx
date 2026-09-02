'use client';

import { Box, Stack, Typography } from '@mui/material';
import type { Quotation } from '@/lib/quotations';
import { formatQuotationDate, quotationMoney } from '@/app/home/quotations/quotationUi';

const readEnv = (value: string | undefined, fallback = '-') => value?.trim() || fallback;

const ITEM_HEADERS: ReadonlyArray<{
  label: string;
  width?: string;
  align: 'left' | 'center' | 'right';
}> = [
  { label: '#', width: '9mm', align: 'center' },
  { label: 'รายการ / รายละเอียดงาน', align: 'left' },
  { label: 'จำนวน', width: '18mm', align: 'right' },
  { label: 'หน่วย', width: '17mm', align: 'center' },
  { label: 'ราคาต่อหน่วย', width: '26mm', align: 'right' },
  { label: 'รวม', width: '27mm', align: 'right' },
];

function customerAddress(quotation: Quotation): string {
  const customer = quotation.customerSnapshot;
  return [
    customer.address,
    customer.subDistrict,
    customer.district,
    customer.province,
    customer.postalCode,
  ]
    .filter(Boolean)
    .join(' ');
}

function documentNumber(quotation: Quotation): string {
  return quotation.quotationNumber ?? 'DRAFT';
}

export function QuotationDocument({ quotation }: Readonly<{ quotation: Quotation }>) {
  const customer = quotation.customerSnapshot;
  const companyName = readEnv(process.env.NEXT_PUBLIC_COMPANY_THAI_NAME, 'Glossy Design');
  const companyEnglishName = readEnv(process.env.NEXT_PUBLIC_COMPANY_ENGLISH_NAME, 'Glossy Design');
  const companyAddress = readEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS);
  const companyPhone = readEnv(process.env.NEXT_PUBLIC_COMPANY_PHONE);
  const companyTaxId = readEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_ID);
  const companyEmail = readEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL);

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm 11mm 13mm;
        }
        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .quotation-print-root {
            min-height: auto !important;
            background: #fff !important;
            padding: 0 !important;
          }
          .quotation-print-toolbar {
            display: none !important;
          }
          .quotation-a4-sheet {
            width: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 0 !important;
          }
          .quotation-items-table thead {
            display: table-header-group;
          }
          .quotation-items-table tr,
          .quotation-financial-summary,
          .quotation-signatures {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .quotation-print-footer {
            display: flex !important;
            position: fixed;
            left: 11mm;
            right: 11mm;
            bottom: 4mm;
          }
          .quotation-print-footer .page-number::after {
            content: counter(page);
          }
        }
      `}</style>

      <Box
        className="quotation-a4-sheet"
        sx={{
          width: '210mm',
          minHeight: '297mm',
          mx: 'auto',
          boxSizing: 'border-box',
          bgcolor: '#FFFFFF',
          color: '#0F172A',
          px: '14mm',
          py: '13mm',
          border: '1px solid #E2E8F0',
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
          fontFamily: 'var(--font-geist-sans), "Noto Sans Thai", Tahoma, sans-serif',
        }}
      >
        <Stack spacing="6mm">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 62mm', gap: '8mm', alignItems: 'start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '5.2mm', fontWeight: 900, lineHeight: 1.15 }}>{companyName}</Typography>
              {companyEnglishName !== '-' && companyEnglishName !== companyName ? (
                <Typography sx={{ mt: '0.8mm', fontSize: '2.8mm', fontWeight: 700, color: '#475569' }}>
                  {companyEnglishName}
                </Typography>
              ) : null}
              <Typography sx={{ mt: '2mm', fontSize: '2.75mm', lineHeight: 1.55, color: '#475569', whiteSpace: 'pre-line' }}>
                {companyAddress}
              </Typography>
              <Typography sx={{ fontSize: '2.75mm', lineHeight: 1.55, color: '#475569' }}>
                โทร {companyPhone} · อีเมล {companyEmail}
              </Typography>
              <Typography sx={{ fontSize: '2.75mm', lineHeight: 1.55, color: '#475569' }}>
                เลขประจำตัวผู้เสียภาษี {companyTaxId}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '6mm', fontWeight: 900, color: '#1D4ED8', lineHeight: 1.1 }}>
                ใบเสนอราคา
              </Typography>
              <Typography sx={{ fontSize: '3.2mm', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em' }}>
                QUOTATION
              </Typography>
              <Box sx={{ mt: '3.5mm', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.2mm 3mm', textAlign: 'left' }}>
                <Typography sx={{ fontSize: '2.7mm', color: '#64748B' }}>เลขที่</Typography>
                <Typography sx={{ fontSize: '2.7mm', fontWeight: 800 }}>{documentNumber(quotation)}</Typography>
                <Typography sx={{ fontSize: '2.7mm', color: '#64748B' }}>Revision</Typography>
                <Typography sx={{ fontSize: '2.7mm', fontWeight: 800 }}>Rev.{quotation.revision}</Typography>
                <Typography sx={{ fontSize: '2.7mm', color: '#64748B' }}>วันที่ออก</Typography>
                <Typography sx={{ fontSize: '2.7mm', fontWeight: 700 }}>{formatQuotationDate(quotation.issuedAt ?? quotation.createdAt)}</Typography>
                <Typography sx={{ fontSize: '2.7mm', color: '#64748B' }}>ใช้ได้ถึง</Typography>
                <Typography sx={{ fontSize: '2.7mm', fontWeight: 700 }}>{formatQuotationDate(quotation.validUntil)}</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderTop: '0.45mm solid #2563EB' }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
            <Box>
              <Typography sx={{ mb: '1.6mm', fontSize: '2.65mm', fontWeight: 900, color: '#1D4ED8', letterSpacing: '0.08em' }}>
                ลูกค้า / CUSTOMER
              </Typography>
              <Typography sx={{ fontSize: '3.25mm', fontWeight: 800 }}>{customer.customerName || '-'}</Typography>
              <Typography sx={{ mt: '1mm', fontSize: '2.7mm', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{customerAddress(quotation) || '-'}</Typography>
              <Typography sx={{ mt: '1mm', fontSize: '2.7mm', color: '#475569' }}>
                โทร {customer.phoneNumber || '-'} {customer.email ? `· ${customer.email}` : ''}
              </Typography>
              {customer.taxId ? (
                <Typography sx={{ fontSize: '2.7mm', color: '#475569' }}>
                  เลขผู้เสียภาษี {customer.taxId}{customer.branchType ? ` · ${customer.branchType}${customer.branchNo ? ` ${customer.branchNo}` : ''}` : ''}
                </Typography>
              ) : null}
            </Box>
            <Box>
              <Typography sx={{ mb: '1.6mm', fontSize: '2.65mm', fontWeight: 900, color: '#1D4ED8', letterSpacing: '0.08em' }}>
                เรื่อง / SUBJECT
              </Typography>
              <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.5 }}>{quotation.subject || '-'}</Typography>
              {quotation.notes ? (
                <Typography sx={{ mt: '1.3mm', fontSize: '2.7mm', lineHeight: 1.5, color: '#475569', whiteSpace: 'pre-line' }}>
                  {quotation.notes}
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box component="table" className="quotation-items-table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: '#EFF6FF' }}>
                {ITEM_HEADERS.map(({ label, width, align }) => (
                  <Box
                    component="th"
                    key={label}
                    sx={{
                      width,
                      px: '2.1mm',
                      py: '2.4mm',
                      borderBottom: '0.35mm solid #93C5FD',
                      textAlign: align,
                      fontSize: '2.55mm',
                      fontWeight: 900,
                      color: '#1E3A8A',
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {quotation.items.map((item, index) => (
                <Box component="tr" key={`${item.productId ?? item.name}-${index}`}>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', textAlign: 'center', verticalAlign: 'top', fontSize: '2.7mm' }}>
                    {index + 1}
                  </Box>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', verticalAlign: 'top' }}>
                    <Typography sx={{ fontSize: '2.85mm', fontWeight: 800, lineHeight: 1.4 }}>{item.name}</Typography>
                    {[item.variantName, item.description, item.productNote, item.note].filter(Boolean).map((detail) => (
                      <Typography key={detail} sx={{ mt: '0.7mm', fontSize: '2.45mm', lineHeight: 1.4, color: '#64748B', whiteSpace: 'pre-line' }}>
                        {detail}
                      </Typography>
                    ))}
                  </Box>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', textAlign: 'right', verticalAlign: 'top', fontSize: '2.7mm' }}>
                    {item.quantity.toLocaleString('th-TH')}
                  </Box>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', textAlign: 'center', verticalAlign: 'top', fontSize: '2.7mm' }}>
                    {item.unit || 'ชิ้น'}
                  </Box>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', textAlign: 'right', verticalAlign: 'top', fontSize: '2.7mm' }}>
                    {quotationMoney.format(item.authoritativeUnitPrice)}
                  </Box>
                  <Box component="td" sx={{ px: '2.1mm', py: '2.8mm', borderBottom: '0.2mm solid #E2E8F0', textAlign: 'right', verticalAlign: 'top', fontSize: '2.7mm', fontWeight: 800 }}>
                    {quotationMoney.format(item.lineTotal)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className="quotation-financial-summary" sx={{ display: 'grid', gridTemplateColumns: '1fr 72mm', gap: '9mm', alignItems: 'start' }}>
            <Box>
              {quotation.paymentTerms ? (
                <Box sx={{ mb: '3mm' }}>
                  <Typography sx={{ fontSize: '2.65mm', fontWeight: 900 }}>เงื่อนไขการชำระเงิน</Typography>
                  <Typography sx={{ mt: '1mm', fontSize: '2.6mm', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{quotation.paymentTerms}</Typography>
                </Box>
              ) : null}
              {quotation.deliveryTerms ? (
                <Box>
                  <Typography sx={{ fontSize: '2.65mm', fontWeight: 900 }}>เงื่อนไขการส่งมอบ</Typography>
                  <Typography sx={{ mt: '1mm', fontSize: '2.6mm', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{quotation.deliveryTerms}</Typography>
                </Box>
              ) : null}
            </Box>
            <Box sx={{ border: '0.25mm solid #CBD5E1', borderRadius: '2mm', overflow: 'hidden' }}>
              {[
                ['ยอดรวม', quotation.subtotal],
                ['ส่วนลด', -quotation.discount],
                [`VAT ${quotation.taxInvoiceRequested ? quotation.vatRate : 0}%`, quotation.vatAmount],
              ].map(([label, amount]) => (
                <Box key={String(label)} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3mm', px: '3mm', py: '2mm', borderBottom: '0.2mm solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '2.7mm', color: '#475569' }}>{String(label)}</Typography>
                  <Typography sx={{ fontSize: '2.7mm', fontWeight: 700 }}>{quotationMoney.format(Number(amount))}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3mm', px: '3mm', py: '3mm', bgcolor: '#EFF6FF' }}>
                <Typography sx={{ fontSize: '3mm', fontWeight: 900, color: '#1E3A8A' }}>ยอดสุทธิ</Typography>
                <Typography sx={{ fontSize: '3.4mm', fontWeight: 900, color: '#1D4ED8' }}>{quotationMoney.format(quotation.grandTotal)}</Typography>
              </Box>
            </Box>
          </Box>

          {quotation.termsAndConditions ? (
            <Box sx={{ pt: '2mm', borderTop: '0.2mm solid #CBD5E1' }}>
              <Typography sx={{ fontSize: '2.7mm', fontWeight: 900 }}>ข้อตกลงและเงื่อนไข</Typography>
              <Typography sx={{ mt: '1.2mm', fontSize: '2.55mm', lineHeight: 1.65, color: '#334155', whiteSpace: 'pre-line' }}>
                {quotation.termsAndConditions}
              </Typography>
            </Box>
          ) : null}

          <Box className="quotation-signatures" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16mm', pt: '9mm' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ height: '12mm', borderBottom: '0.2mm solid #94A3B8' }} />
              <Typography sx={{ mt: '1.5mm', fontSize: '2.6mm', fontWeight: 700 }}>ผู้จัดทำ / Prepared by</Typography>
              <Typography sx={{ fontSize: '2.45mm', color: '#64748B' }}>{quotation.createdBy || '-'}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ height: '12mm', borderBottom: '0.2mm solid #94A3B8' }} />
              <Typography sx={{ mt: '1.5mm', fontSize: '2.6mm', fontWeight: 700 }}>ลูกค้ายืนยัน / Customer approval</Typography>
              <Typography sx={{ fontSize: '2.45mm', color: '#64748B' }}>วันที่ ____________________</Typography>
            </Box>
          </Box>
        </Stack>
      </Box>

      <Box
        className="quotation-print-footer"
        sx={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', fontSize: '2.2mm', color: '#64748B' }}
      >
        <span>{documentNumber(quotation)} · Rev.{quotation.revision}</span>
        <span>Glossy Design · หน้า <span className="page-number" /></span>
      </Box>
    </>
  );
}
