import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from './sections/HeroSection';

type NavItem = {
  label: string;
  href: string;
};

type Service = {
  title: string;
  description: string;
  detail: string;
};

type Highlight = {
  label: string;
  value: string;
  description: string;
};

type WorkflowStep = {
  title: string;
  description: string;
};

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const navItems: NavItem[] = [
  { label: 'บริการ', href: '#services' },
  { label: 'ผลงาน', href: '#portfolio' },
  { label: 'ขั้นตอน', href: '#process' },
  { label: 'ติดต่อ', href: '#contact' },
];

const highlights: Highlight[] = [
  {
    label: 'Premium finish',
    value: 'วัสดุและผิวสัมผัส',
    description: 'คัดกระดาษ โทนสี และเทคนิคหลังพิมพ์ให้ภาพลักษณ์ของแบรนด์ดูนิ่งและน่าเชื่อถือ',
  },
  {
    label: 'Fast response',
    value: 'ตอบไวทุกวัน',
    description: 'ช่วยเช็กไฟล์ สรุปสเปก และให้คำแนะนำก่อนเริ่มผลิตจริงแบบไม่ปล่อยให้ลูกค้าตัดสินใจคนเดียว',
  },
  {
    label: 'Nationwide delivery',
    value: 'จัดส่งทั่วประเทศ',
    description: 'แพ็กงานอย่างเป็นระบบเพื่อให้ชิ้นงานยังคม สะอาด และพร้อมใช้งานเมื่อถึงมือลูกค้า',
  },
];

const services: Service[] = [
  {
    title: 'นามบัตร หัวจดหมาย และสื่อแนะนำตัว',
    description: 'นามบัตร กระดาษหัวจดหมาย และองค์ประกอบแบรนด์ที่ช่วยให้การแนะนำตัวดูแพงขึ้นทันที',
    detail: 'เหมาะกับแบรนด์ใหม่ ผู้บริหาร และทีมขายที่ต้องการภาพจำที่ชัด',
  },
  {
    title: 'โบรชัวร์ เมนู และสื่อเล่าเรื่องแบรนด์',
    description: 'ออกแบบลำดับการอ่าน วางจังหวะภาพ และเลือกวัสดุให้ข้อมูลเยอะยังดูโปรและอ่านง่าย',
    detail: 'เหมาะกับร้านอาหาร สตูดิโอ คลินิก และงานพรีเซนต์สินค้า',
  },
  {
    title: 'แพ็กเกจจิ้งและฉลากสินค้า',
    description: 'งานกล่อง ซอง สติกเกอร์ และฉลากที่ช่วยให้สินค้าดูพร้อมวางขายและน่าหยิบขึ้นมาทันที',
    detail: 'เหมาะกับสินค้าไลฟ์สไตล์ ความงาม อาหาร และของฝาก',
  },
  {
    title: 'ป้าย อะคริลิก และสื่อหน้าร้าน',
    description: 'สร้างประสบการณ์หน้าร้านให้ดูสะอาด คุมโทน และสื่อสารได้ชัดตั้งแต่ระยะไกล',
    detail: 'เหมาะกับหน้าร้าน คาเฟ่ บูทอีเวนต์ และพื้นที่เปิดตัวสินค้า',
  },
];

const workflow: WorkflowStep[] = [
  {
    title: 'คุยภาพรวมแบรนด์และเป้าหมายงาน',
    description: 'เริ่มจากสิ่งที่ลูกค้าต้องการให้คนรู้สึกเมื่อได้รับชิ้นงาน ไม่ใช่แค่ขนาดหรือจำนวนพิมพ์',
  },
  {
    title: 'แนะนำสเปก วัสดุ และโทนที่เหมาะ',
    description: 'ช่วยคัดทางเลือกที่ใช่สำหรับงบ เวลา และภาพลักษณ์ที่อยากสื่อออกไป',
  },
  {
    title: 'ตรวจไฟล์ก่อนผลิตจริง',
    description: 'เช็กสี ฟอนต์ ระยะตัดตก และรายละเอียดสำคัญเพื่อลดความเสี่ยงเรื่องงานพลาด',
  },
  {
    title: 'ผลิต แพ็ก และจัดส่งอย่างเป็นระบบ',
    description: 'ติดตามงานให้ต่อเนื่องจนชิ้นงานไปถึงมือลูกค้าอย่างเรียบร้อยและพร้อมใช้งาน',
  },
];

const testimonials: Testimonial[] = [
  {
    name: 'พิชาภรณ์',
    role: 'Founder, Maison Bloom',
    quote: 'ทีมช่วยคุมทั้งวัสดุและอารมณ์ของแบรนด์ได้ละเอียดมาก พองานออกมาวางคู่สินค้าแล้วภาพรวมดูแพงขึ้นชัดเจน',
  },
  {
    name: 'ณัฐวุฒิ',
    role: 'Marketing Manager, Vela Studio',
    quote: 'ชอบวิธีทำงานที่ไม่ได้รีบพิมพ์อย่างเดียว แต่ช่วยจัดลำดับข้อมูลและแนะนำสเปกที่ทำให้สื่อทุกชิ้นไปในทิศทางเดียวกัน',
  },
  {
    name: 'กีรติพล',
    role: 'Owner, Aromatique Lab',
    quote: 'คุณภาพงานนิ่ง รายละเอียดสะอาด และการตอบกลับรวดเร็วมาก ทำให้สั่งงานต่อได้สบายใจทุกครั้ง',
  },
];

const CONTACT_PHONE_DISPLAY = '081-555-2929';
const CONTACT_PHONE_HREF = 'tel:0815552929';
const CONTACT_EMAIL = 'glossy2929@gmail.com';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4.167 10h11.666M10.833 4.167 15.833 10l-5 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f7fb] text-slate-900">
      <div className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.45),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_32%),linear-gradient(180deg,_#f7fbff_0%,_#eef4f9_52%,_#f3f7fb_100%)]" />
        <div className="absolute left-[-8rem] top-28 -z-10 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 -z-10 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 pb-4 pt-5 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/70 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <Image src="/logo/logo.png" alt="Glossy Design" width={30} height={30} className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">Glossy Design</p>
              <p className="text-sm text-slate-600">Premium print studio</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            {navItems.map(item => (
              <a key={item.href} href={item.href} className="transition hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition hover:bg-slate-800">
              ส่งไฟล์งาน
              <ArrowIcon />
            </Link>
          </div>
        </header>

        <HeroSection highlights={highlights} />

        <section className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {highlights.map(item => (
              <div key={item.label} className="rounded-[1.8rem] border border-white/70 bg-white/78 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <SectionLabel>Services</SectionLabel>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">เลือกสื่อที่ใช่ให้แบรนด์ดูดีตั้งแต่ชิ้นเล็กไปจนถึงพื้นที่หน้าร้าน</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">เราออกแบบให้แต่ละชิ้นทำงานร่วมกันเป็นระบบ ทั้งอารมณ์แบรนด์ ความคมชัดของงาน และประสบการณ์ที่ลูกค้าจะได้รับเมื่อหยิบหรือมองเห็น</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {services.map(service => (
              <article
                key={service.title}
                className="group rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.82))] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.11)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <SparkIcon />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-500">{service.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="portfolio" className="mx-auto max-w-7xl px-5 py-2 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div className="max-w-xl">
              <SectionLabel>Selected work</SectionLabel>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">งานที่ช่วยยืนยันว่าแบรนด์ที่ดูดี เริ่มจากรายละเอียดเล็กที่สุด</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">แต่ละโปรเจกต์เริ่มจากการตีความ mood ของแบรนด์ แล้วค่อยแปลออกมาเป็นพื้นผิว รูปทรง สี และจังหวะการรับรู้ที่ลูกค้าสัมผัสได้จริง</p>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/82 p-5 shadow-[0_24px_65px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">What clients ask for</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['คุมโทนแบรนด์ให้ดูนิ่ง', 'ตรวจไฟล์ก่อนผลิต', 'สเปกที่เหมาะกับงบ', 'งานหน้าร้านที่ดูสะอาด'].map(item => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/70 bg-slate-950 px-5 py-6 text-white shadow-[0_34px_90px_rgba(15,23,42,0.18)] sm:px-6 lg:px-8 lg:py-8">
            <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="max-w-xl">
                <SectionLabel>Process</SectionLabel>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">ไม่ใช่แค่รับพิมพ์ แต่ช่วยให้ทุกชิ้นสื่อสารในระดับที่แบรนด์ควรเป็น</h2>
                <p className="mt-4 text-base leading-7 text-white/68">วิธีทำงานของเราถูกออกแบบให้ลูกค้าตัดสินใจง่ายขึ้น มั่นใจขึ้น และเห็นภาพรวมของชิ้นงานชัดตั้งแต่ก่อนเริ่มผลิตจริง</p>
              </div>

              <div className="grid gap-4">
                {workflow.map((step, index) => (
                  <div key={step.title} className="rounded-[1.7rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white/80">0{index + 1}</div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/65">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-2 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            {testimonials.map(item => (
              <article key={item.name} className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                  </div>
                  <span className="text-3xl leading-none text-sky-200">“</span>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">{item.quote}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_55%,#38bdf8_100%)] px-5 py-8 text-white shadow-[0_36px_100px_rgba(30,58,138,0.28)] sm:px-6 lg:px-8 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Start your project</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">พร้อมให้แบรนด์ของคุณดูพรีเมียมขึ้นตั้งแต่ชิ้นพิมพ์แรก</h2>
                <p className="mt-4 text-base leading-7 text-white/75">ส่งไฟล์หรือเริ่มต้นคุยสเปกกับทีมได้เลย เราจะช่วยจัดทิศทางงานให้เหมาะกับภาพลักษณ์ของแบรนด์ งบประมาณ และเวลาที่คุณต้องการ</p>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/upload"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-slate-950 transition hover:bg-slate-100">
                    ส่งไฟล์งานตอนนี้
                    <ArrowIcon />
                  </Link>
                  <a
                    href={CONTACT_PHONE_HREF}
                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/22 bg-white/8 px-6 text-base font-semibold text-white transition hover:bg-white/12">
                    โทรคุยกับทีม
                  </a>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-white/72">
                  <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">ตรวจไฟล์ก่อนผลิตจริงโดยไม่มีค่าใช้จ่ายเพิ่มเติม</div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">ช่วยเลือกวัสดุและฟินิชชิงที่เหมาะกับ mood ของแบรนด์</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="mx-auto max-w-7xl px-5 pb-24 sm:px-6 lg:px-8 lg:pb-12">
          <div className="grid gap-10 rounded-[2rem] border border-white/80 bg-white/84 px-5 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-6">
            <div>
              <Image src="/logo/logo.png" alt="Glossy Design" width={156} height={54} className="h-auto" />
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
                สตูดิโองานพิมพ์และสื่อแบรนด์สำหรับธุรกิจที่ต้องการงานภาพลักษณ์สะอาด คุมโทนดี และพร้อมสร้างความประทับใจในทุกจุดสัมผัสของลูกค้า
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Services</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {services.map(service => (
                  <p key={service.title}>{service.title}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Menu</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {navItems.map(item => (
                  <a key={item.href} href={item.href} className="block transition hover:text-slate-950">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <a href={CONTACT_PHONE_HREF} className="block transition hover:text-slate-950">
                  {CONTACT_PHONE_DISPLAY}
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`} className="block transition hover:text-slate-950">
                  {CONTACT_EMAIL}
                </a>
                <p>ซีคอนสแควร์ ชั้น B1 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพฯ 10250</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Glossy Design. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/privacy-policy" className="transition hover:text-slate-600">
                Privacy policy
              </Link>
              <span aria-hidden="true">·</span>
              <Link href="/terms" className="transition hover:text-slate-600">
                Terms of service
              </Link>
            </div>
          </div>
        </footer>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/92 px-4 py-3 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <Link
            href="/upload"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-base font-semibold text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
            ส่งไฟล์งาน
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </main>
  );
}
