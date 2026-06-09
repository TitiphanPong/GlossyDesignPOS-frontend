import Image from 'next/image';
import Link from 'next/link';

type Highlight = {
  label: string;
  value: string;
  description: string;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4.167 10h11.666M10.833 4.167 15.833 10l-5 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 2.5 11.864 8.136 17.5 10l-5.636 1.864L10 17.5l-1.864-5.636L2.5 10l5.636-1.864L10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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

export function HeroSection({ highlights }: Readonly<{ highlights: Highlight[] }>) {
  return (
    <section id="home" className="mx-auto max-w-7xl px-5 pb-10 pt-3 sm:px-6 lg:px-8 lg:pb-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center">
        <div className="max-w-2xl">
          <SectionLabel>Printing Shop</SectionLabel>
          <h1 className="mt-5 text-[2.85rem] font-semibold leading-[1.12] tracking-[-0.06em] text-slate-950 sm:text-[4.25rem]">
            <span className="block">งานพิมพ์ที่ทำให้แบรนด์</span>
            <span className="block text-sky-700">ดูนิ่ง ดูแพง และน่าจดจำ</span>
          </h1>
          <p className="mt-5 max-w-xl text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">
            Glossy Design ช่วยดูแลตั้งแต่การเลือกวัสดุ คุมโทนงาน ตรวจไฟล์ และผลิตชิ้นงานที่พร้อมเป็นหน้าตาของแบรนด์ทั้งออนไลน์และหน้าร้าน
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-base font-semibold text-white shadow-[0_22px_55px_rgba(15,23,42,0.18)] transition hover:bg-slate-800">
              เริ่มส่งไฟล์งาน
              <ArrowIcon />
            </Link>
            <a
              href="#portfolio"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 text-base font-semibold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur transition hover:border-slate-300 hover:text-slate-950">
              ดูตัวอย่างผลงาน
            </a>
          </div>

          <div className="mt-8 grid gap-3">
            {highlights.map(item => (
              <div key={item.value} className="flex items-start gap-3 rounded-[22px] border border-white/70 bg-white/78 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,255,255,0)_68%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,248,252,0.84))] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.1)] backdrop-blur sm:p-5">
            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-slate-200/70 bg-slate-950 p-4 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Signature kit</p>
                    <p className="mt-2 text-xl font-semibold">Curated materials for elegant brand touchpoints</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">Since 2026</div>
                </div>
                <div className="mt-4 grid grid-cols-[1.1fr_0.9fr] gap-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-slate-900">
                    <Image src="/covers/namecard.png" alt="Premium business card mockup" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Finish advice</p>
                      <p className="mt-2 text-sm leading-6 text-white/78">คุมผิวสัมผัส ฟอยล์ และน้ำหนักกระดาษให้เข้ากับคาแรกเตอร์ของแบรนด์</p>
                    </div>
                    <div className="relative min-h-40 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/8">
                      <Image src="/covers/productpremium.png" alt="Premium packaging sample" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 22vw" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-[1.6rem] border border-white/80 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Process</p>
                  <div className="mt-3 space-y-3">
                    {['Brief & brand mood', 'File check before print', 'Production tracking'].map(item => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <CheckIcon />
                        </div>
                        <p className="text-sm font-medium text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-sky-100/60 blur-2xl" />
                  <p className="relative text-[11px] uppercase tracking-[0.22em] text-slate-400">Studio preview</p>
                  <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-[1.3rem]">
                    <Image src="/banners/Banner5.png" alt="Glossy Design studio work" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 30vw" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
