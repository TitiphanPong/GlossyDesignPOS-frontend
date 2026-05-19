type MoneySummaryKind = 'full' | 'deposit';

export const posSellerLocale = {
  common: {
    cancel: 'ยกเลิก',
    next: 'ถัดไป',
    detailsTitle: 'รายละเอียดสินค้า :',
    detailsField: 'รายละเอียดสินค้า',
    optionsTitle: 'ตัวเลือกเพิ่มเติม :',
    paperTypeTitle: 'ชนิดกระดาษ :',
    quantityProductLabel: 'จำนวนสินค้า :',
    pieces: 'ชิ้น',
    other: 'อื่นๆ',
    priceSummaryTitle: 'สรุปราคา :',
    depositProduct: 'มัดจำสินค้า',
    totalLabel: 'ยอดรวม',
    depositLabel: 'ยอดมัดจำ',
    remainingLabel: 'คงค้าง',
    fullPaymentLabel: 'ชำระเต็มจำนวน',
    amountLabel: 'จำนวนเงิน',
    customSizeInches: 'Custom Size (นิ้ว)',
    customSizeMillimeters: 'Custom Size (mm)',
    oneSide: '1 ด้าน',
    twoSides: '2 ด้าน',
    blackAndWhite: 'ขาวดำ',
    color: 'สี',
    typeTitle: 'ประเภท :',
    kindTitle: 'ชนิด :',
    materialTitle: 'ชนิดวัสดุ :',
    quantityAndPriceTitle: 'จำนวนและราคา :',
    quantityLabel: 'จำนวน',
    priceLabel: 'ราคา',
    sizeLabel: 'ขนาด',
    widthMillimeters: 'กว้าง (mm)',
    heightMillimeters: 'สูง (mm)',
    addSize: 'เพิ่ม Size',
    baht: 'บาท',
    paperPrefix: 'PAPER',
  },
  postcard: {
    category: 'โพสการ์ด',
    sizeUnit: 'นิ้ว',
    quantitySetTitle: 'จำนวน (เซต) :',
    quantitySheetLabel: 'จำนวน (ใบ) :',
    setCountLabel: (count: number) => `นับเป็นจำนวน (Set) : ${count} ชุด`,
    setNote: (setLabel: string) => `*** หมายเหตุ : ถ้าเป็น A5 ขั้นต่ำ 2 ใบต่อ 1 ชุด, A6 ขั้นต่ำ 4 ใบต่อ 1 ชุด || (1 Set = ${setLabel})`,
    variantDescriptions: {
      A5: 'ขั้นต่ำ 2 ใบต่อ 1 ชุด',
      A6: 'ขั้นต่ำ 4 ใบต่อ 1 ชุด',
    },
    materials: {
      '160g': '160 แกรม',
      '260g': '260 แกรม',
      '300g': '300 แกรม',
      other: 'อื่นๆ',
    },
  },
  documentPrint: {
    category: 'ปริ้นท์เอกสาร',
    sizeUnit: 'mm',
    printSidesLabel: 'พิมพ์กี่ด้าน :',
    colorModeLabel: 'โหมดสี :',
    materials: {
      '80g': '80 แกรม',
      '100g': '100 แกรม',
      '120g': '120 แกรม',
      '150g': '150 แกรม',
      other: 'อื่นๆ',
    },
  },
  nameCard: {
    category: 'นามบัตร',
    sizeUnit: 'mm',
    customSize: 'Custom Size (mm)',
    paperKinds: {
      MATTE: 'MATTE',
      GLOSS: 'GLOSS',
      PVC: 'PVC',
      CUSTOM: 'CUSTOM',
    },
    materials: {
      '150g': '150g',
      '160g': '160g',
      '260g': '260g',
      '300g': '300g',
      '200MC': '200MC',
      '220MC': '220MC',
      other: 'อื่นๆ',
    },
  },
  inkjet: {
    category: 'อิงค์เจ็ท',
    addSize: 'เพิ่ม Size',
    sizeCardsTitle: 'ประเภท :',
    types: {
      'paper-gloss': 'PAPER GLOSS',
      'pp-board': 'PP+PP BOARD',
      'pp-banner': 'PP BANNER',
      vinyl: 'VINYL',
      'pp-passwood': 'PP+PASSWOOD',
      backlid: 'BACKLID',
      canvas: 'CANVAS',
    },
  },
  stamp: {
    category: 'ตรายาง',
    types: {
      normal: {
        label: 'ธรรมดา',
        description: 'ไม่มีหมึกในตัว',
      },
      inked: {
        label: 'หมึกในตัว',
        description: 'มาพร้อมหมึกในตัว',
      },
    },
    shapes: {
      circle: 'วงกลม',
      square: 'สี่เหลี่ยม',
    },
  },
  stickerPP: {
    category: 'สติ๊กเกอร์',
    sizeUnit: 'mm',
    quantityAndPriceTitle: 'ตัวเลือกเพิ่มเติม :',
    priceOnlyLabel: 'ราคา :',
    variants: {
      A4: 'A4',
      A3: 'A3',
      squareSheet: '1 Square / 7 Sheet',
    },
  },
  stickerPVC: {
    category: 'สติ๊กเกอร์',
    quantityAndPriceTitle: 'จำนวนและราคา :',
    sizeCardsTitle: 'ประเภท :',
    addSize: 'เพิ่ม Size',
    types: {
      'w.pvc-matte-st': 'W.PVC MATTE ST.',
      'w.pvc-gloss-st': 'W.PVC GLOSS ST.',
      'clear-gloss-st': 'CLEAR GLOSS ST.',
      'clear-matte-st': 'CLEAR MATTE ST.',
      'pp-sticker': 'PP STICKER',
    },
  },
  premiumProduct: {
    category: 'สินค้าพรีเมียม',
    types: {
      roundpin: {
        label: 'เข็มกลัด',
        description: 'ราคาเริ่มต้นที่ ...',
      },
      'shirt-screen': {
        label: 'สกรีนเสื้อ',
        description: 'ราคาเริ่มต้นที่ ...',
      },
      'coffee-mug': {
        label: 'สกรีนแก้ว',
        description: 'ราคาเริ่มต้นที่ ...',
      },
      'acrylic-sign': {
        label: 'ป้ายอะคริลิค',
        description: 'ราคาเริ่มต้นที่ ...',
      },
    },
  },
  plotPlan: {
    category: 'พล็อตแพลน',
    sizeUnit: 'mm',
    colorModeLabel: 'โหมดสี :',
    materials: {
      'bond-80g': 'กระดาษปอนด์ 80 แกรม',
      'bond-100g': 'กระดาษปอนด์ 100 แกรม',
      'tracing-paper': 'กระดาษไข',
      'photo-paper': 'กระดาษโฟโต้',
      other: 'อื่นๆ',
    },
  },
} as const;

export function formatMoneySummary(kind: MoneySummaryKind, amount: number) {
  if (kind === 'full') {
    return `ยอดที่ต้องชำระเต็มจำนวน: ${amount.toLocaleString()} ฿`;
  }

  return `ยอดที่ต้องชำระมัดจำ: ${amount.toLocaleString()} ฿`;
}
