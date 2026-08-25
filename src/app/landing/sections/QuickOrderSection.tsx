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

type OrderStep = {
  step: number;
  title: string;
  description: string;
};

const steps: OrderStep[] = [
  {
    step: 1,
    title: 'เลือกประเภทงาน',
    description: 'กำหนดว่าต้องการพิมพ์อะไร จากเอกสารไปจนถึงสินค้าพรีเมียม',
  },
  {
    step: 2,
    title: 'ส่งไฟล์',
    description: 'อัปโหลดไฟล์ได้ง่ายผ่านเว็บไซต์ ไม่ต้องเดินทางมาร้านก่อน',
  },
  {
    step: 3,
    title: 'ร้านตรวจสอบและแจ้งราคา',
    description: 'ทีมงานเช็กไฟล์ สเปก และให้คำแนะนำโดยไม่มีค่าใช้จ่าย',
  },
  {
    step: 4,
    title: 'ชำระเงิน',
    description: 'ยืนยันรายละเอียดและชำระเงินเพื่อเริ่มกระบวนการผลิต',
  },
  {
    step: 5,
    title: 'รับงาน',
    description: 'งานสำเร็จแล้ว รับที่ร้านหรือเลือกจัดส่งตามต้องการ',
  },
];

export function QuickOrderSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <SectionLabel>Fast ordering</SectionLabel>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">งานด่วนไม่ต้องเสียเวลา</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">ปกติลูกค้าขึ้นใจที่ต้องเดินทางไปร้านเพื่อส่งไฟล์และปรึกษาก่อน เรามีระบบที่ทำให้ไม่ต้องแบบนั้น</p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-5 lg:gap-3">
        {steps.map((item, index) => (
          <div key={item.step} className="group">
            {/* Arrow connector for desktop */}
            {index < steps.length - 1 && <div className="mb-4 hidden h-0.5 bg-gradient-to-r from-sky-300 to-transparent lg:block" />}

            {/* Step card */}
            <div className="rounded-[1.8rem] border border-white/70 bg-white/78 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-sky-200 bg-sky-50 text-lg font-bold text-sky-700">{item.step}</div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile vertical timeline */}
      <div className="mt-12 space-y-4 lg:hidden">
        {steps.map(item => (
          <div key={item.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-sky-200 bg-sky-50 text-lg font-bold text-sky-700">{item.step}</div>
              {item.step < steps.length && <div className="mt-2 h-12 w-0.5 bg-gradient-to-b from-sky-300 to-transparent" />}
            </div>
            <div className="flex-1 pt-2">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
