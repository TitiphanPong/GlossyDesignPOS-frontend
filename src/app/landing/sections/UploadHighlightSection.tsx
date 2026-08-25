'use client';

import { useState } from 'react';
import Link from 'next/link';

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 2.5 11.864 8.136 17.5 10l-5.636 1.864L10 17.5l-1.864-5.636L2.5 10l5.636-1.864L10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="m4.167 10.417 3.333 3.333 8.333-8.333" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4.167 10h11.666M10.833 4.167 15.833 10l-5 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudUploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-slate-400" aria-hidden="true">
      <path d="M12 2v10m5-6.5L12 2l-5 3.5M3 13.5v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
      <span className="text-sky-600">
        <SparkIcon />
      </span>
      {children}
    </div>
  );
}

export function UploadHighlightSection() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section id="upload" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        {/* Left content */}
        <div className="max-w-xl">
          <SectionLabel>Online upload</SectionLabel>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
            มีไฟล์แล้ว?
            <br />
            ส่งมาให้เราดูได้เลย
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">ไม่ต้องเดินทางมาที่ร้านเพื่อส่งไฟล์ อัปโหลดออนไลน์แล้วแจ้งรายละเอียดที่ต้องการ ทีมงานจะติดต่อกลับภายในวัน</p>

          <div className="mt-7 space-y-3">
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/70 bg-white/78 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <CheckIcon />
              </div>
              <p className="text-sm text-slate-600">รองรับหลายไฟล์ PDF JPG PNG AI PSD ZIP DOC และอื่นๆ</p>
            </div>
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/70 bg-white/78 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <CheckIcon />
              </div>
              <p className="text-sm text-slate-600">ตรวจสอบรายละเอียดก่อนผลิต ลดความเสี่ยงเรื่องข้อผิดพลาด</p>
            </div>
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-white/70 bg-white/78 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <CheckIcon />
              </div>
              <p className="text-sm text-slate-600">ไฟล์ถูกใช้เพื่อดำเนินงานพิมพ์เท่านั้น ความเป็นส่วนตัวได้รับการคุ้มครอง</p>
            </div>
          </div>

          <Link
            href="/upload"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition hover:bg-slate-800">
            อัปโหลดไฟล์งานเลย
            <ArrowIcon />
          </Link>
        </div>

        {/* Right - Upload card mockup */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.3),_transparent_50%)] blur-3xl" />

          <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.88))] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)] backdrop-blur">
            {/* Upload zone */}
            <div
              className={`relative rounded-[1.8rem] border-2 border-dashed px-6 py-12 text-center transition ${
                isDragging ? 'border-sky-400 bg-sky-50/50' : 'border-slate-300 bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/30'
              }`}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={() => setIsDragging(false)}>
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-full bg-sky-100 p-3">
                  <CloudUploadIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">ลากไฟล์มาวางที่นี่</p>
                  <p className="mt-1 text-xs text-slate-500">หรือคลิกเพื่อเลือกไฟล์</p>
                </div>
              </div>
            </div>

            {/* Supported formats */}
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {['PDF', 'JPG', 'PNG', 'AI', 'PSD', 'ZIP', 'DOC', 'XLS'].map(format => (
                <div key={format} className="rounded-[1.2rem] border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-600">
                  {format}
                </div>
              ))}
            </div>

            {/* Additional info */}
            <div className="mt-6 space-y-2 rounded-[1.4rem] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">ข้อมูลเพิ่มเติม</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p>📦 ไฟล์ได้มากที่สุด 7.5 MB ต่อไฟล์</p>
                <p>⚡ อัปโหลดถ่ายทำในไม่กี่วินาที</p>
                <p>✅ ร้านจะติดต่อกลับภายในวัน</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
