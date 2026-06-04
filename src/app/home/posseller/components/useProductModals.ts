import * as React from 'react';
import NameCardModal from './NameCardModal';
import StampModal from './StampModal';
import DocumentPrintModal from './DocumentPrintModal';
import PostCardModal from './PostCardModal';
import InkjetModal from './InkjetModal';
import PlotPlanModal from './PlotPlanModal';
import StickerPVCModal from './stickerPVCModal';
import StickerPPModal from './stickerPPModal';
import PremiumProductModal from './premiumProductModal';
import { ActiveProduct, CartItem, ProductModalComponentProps } from '../types/cart';

type ProductModalDefinition = {
  key: string;
  typeCodes: string[];
  component: React.ComponentType<ProductModalComponentProps>;
  matchesLegacyProduct: (product: ActiveProduct) => boolean;
};

function hasText(value: string | undefined, needle: string): boolean {
  return Boolean(value?.includes(needle));
}

const PRODUCT_MODAL_DEFINITIONS: ProductModalDefinition[] = [
  {
    key: 'name-card',
    typeCodes: ['name-card', 'business-card', 'namecard'],
    component: NameCardModal,
    matchesLegacyProduct: product => hasText(product.category, 'นามบัตร') || hasText(product.category, 'เธเธฒเธก'),
  },
  {
    key: 'stamp',
    typeCodes: ['stamp', 'rubber-stamp'],
    component: StampModal,
    matchesLegacyProduct: product => hasText(product.category, 'ตรายาง') || hasText(product.category, 'เธ•เธฃเธฒ'),
  },
  {
    key: 'document-print',
    typeCodes: ['document-print', 'document', 'print-document'],
    component: DocumentPrintModal,
    matchesLegacyProduct: product => hasText(product.category, 'เอกสาร') || hasText(product.category, 'เธเธฃเธด'),
  },
  {
    key: 'postcard',
    typeCodes: ['postcard', 'post-card'],
    component: PostCardModal,
    matchesLegacyProduct: product => hasText(product.category, 'โปสการ์ด') || hasText(product.category, 'เนเธเธช'),
  },
  {
    key: 'inkjet',
    typeCodes: ['inkjet', 'large-format'],
    component: InkjetModal,
    matchesLegacyProduct: product => hasText(product.category, 'อิงค์เจ็ท') || hasText(product.category, 'เธญเธดเธ'),
  },
  {
    key: 'plot-plan',
    typeCodes: ['plot-plan', 'blueprint'],
    component: PlotPlanModal,
    matchesLegacyProduct: product => hasText(product.category, 'พล็อตแปลน') || hasText(product.category, 'เธเธฅ'),
  },
  {
    key: 'premium-product',
    typeCodes: ['premium-product', 'premium'],
    component: PremiumProductModal,
    matchesLegacyProduct: product => hasText(product.category, 'พรีเมียม') || hasText(product.category, 'เธเธฃเธต'),
  },
  {
    key: 'sticker-pvc',
    typeCodes: ['sticker-pvc', 'pvc-inkjet'],
    component: StickerPVCModal,
    matchesLegacyProduct: product => hasText(product.name, 'PVC Inkjet'),
  },
  {
    key: 'sticker-pp',
    typeCodes: ['sticker-pp', 'pp-laser'],
    component: StickerPPModal,
    matchesLegacyProduct: product => hasText(product.name, 'PP Laser'),
  },
];

const findProductModalDefinition = (activeProduct: ActiveProduct | null) => {
  if (!activeProduct) {
    return null;
  }

  const normalizedTypeCode = activeProduct.typeCode?.trim().toLowerCase();
  const normalizedCode = activeProduct.code?.trim().toLowerCase();

  return (
    PRODUCT_MODAL_DEFINITIONS.find(definition => definition.typeCodes.includes(normalizedTypeCode ?? '') || definition.typeCodes.includes(normalizedCode ?? '')) ??
    PRODUCT_MODAL_DEFINITIONS.find(definition => definition.matchesLegacyProduct(activeProduct)) ??
    null
  );
};

export const createCartItemKey = (productId: string) => `${productId}-${Date.now()}`;

export const buildEditingProduct = (item: CartItem): ActiveProduct => ({
  id: item.key,
  name: item.name,
  category: item.category,
  typeCode: item.type,
});

export function useProductModals() {
  const [activeProduct, setActiveProduct] = React.useState<ActiveProduct | null>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CartItem | null>(null);

  const activeModal = React.useMemo(() => findProductModalDefinition(activeProduct), [activeProduct]);

  const openForProduct = React.useCallback((product: ActiveProduct) => {
    setActiveProduct(product);
    setEditingItem(null);
    setOpenModal(true);
  }, []);

  const openForEdit = React.useCallback((item: CartItem) => {
    setEditingItem(item);
    setActiveProduct(buildEditingProduct(item));
    setOpenModal(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setOpenModal(false);
    setEditingItem(null);
  }, []);

  return {
    activeModal,
    activeProduct,
    closeModal,
    editingItem,
    openForEdit,
    openForProduct,
    openModal,
    setActiveProduct,
    setEditingItem,
    setOpenModal,
  };
}
