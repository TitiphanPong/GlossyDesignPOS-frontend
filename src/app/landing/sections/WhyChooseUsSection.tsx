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

type Advantage = {
  title: string;
  description: string;
  icon: string;
};

const advantages: Advantage[] = [
  {
    title: 'งานพิมพ์หลากหลาย',
    description: 'รองรับตั้งแต่งานเอกสารไปจนถึงงานสื่อโฆษณา นามบัตร ป้าย สติกเกอร์ และสินค้าพรีเมียม',
    icon: '🎨',
  },
  {
    title: 'ตรวจไฟล์ก่อนผลิต',
    description: 'ช่วยลดปัญหาขนาด สี และไฟล์ผิด ทีมงานจะเช็คแล้วแจ้งให้ทราบเพื่อความมั่นใจ',
    icon: '✓',
  },
  {
    title: 'รองรับงานด่วน',
    description: 'สามารถสอบถามระยะเวลาผลิตและความเป็นไปได้ของงานด่วนได้ทันที ไม่ต้องรอ',
    icon: '⚡',
  },
  {
    title: 'ส่งไฟล์ออนไลน์',
    description: 'ไม่ต้องนำ USB หรือเดินทางมาส่งไฟล์ก่อน ส่งได้ทันที ตรวจได้ทันที',
    icon: '☁️',
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <SectionLabel>Why glossy design</SectionLabel>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">ทำไมต้องเลือก Glossy Design?</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">ทีมงานของเราออกแบบให้ทุกกระบวนการตั้งแต่เลือกบริการจนถึงรับงาน เป็นเรื่องง่ายและรวดเร็ว</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {advantages.map(item => (
          <div
            key={item.title}
            className="rounded-[1.8rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]">
            <div className="text-4xl leading-none">{item.icon}</div>
            <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
