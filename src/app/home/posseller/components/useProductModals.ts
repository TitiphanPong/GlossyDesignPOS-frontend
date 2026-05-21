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
  component: React.ComponentType<ProductModalComponentProps>;
  matches: (product: ActiveProduct) => boolean;
};

const PRODUCT_MODAL_DEFINITIONS: ProductModalDefinition[] = [
  { key: 'name-card', component: NameCardModal, matches: product => product.category?.trim() === 'นามบัตร' },
  { key: 'stamp', component: StampModal, matches: product => product.category?.trim() === 'ตรายาง' },
  { key: 'document-print', component: DocumentPrintModal, matches: product => product.category?.trim() === 'ปริ้นท์เอกสาร' },
  { key: 'postcard', component: PostCardModal, matches: product => product.category?.trim() === 'โพสการ์ด' },
  { key: 'inkjet', component: InkjetModal, matches: product => product.category?.trim() === 'อิงค์เจ็ท' },
  { key: 'plot-plan', component: PlotPlanModal, matches: product => product.category?.trim() === 'พล็อตแพลน' },
  { key: 'premium-product', component: PremiumProductModal, matches: product => product.category?.trim() === 'สินค้าพรีเมียม' },
  { key: 'sticker-pvc', component: StickerPVCModal, matches: product => product.name.includes('สติ๊กเกอร์ PVC Inkjet') },
  { key: 'sticker-pp', component: StickerPPModal, matches: product => product.name.includes('สติ๊กเกอร์ PP Laser') },
];

const findProductModalDefinition = (activeProduct: ActiveProduct | null) => {
  if (!activeProduct) {
    return null;
  }

  return PRODUCT_MODAL_DEFINITIONS.find(definition => definition.matches(activeProduct)) ?? null;
};

export const createCartItemKey = (productId: string) => `${productId}-${Date.now()}`;

export const buildEditingProduct = (item: CartItem): ActiveProduct => ({
  id: item.key,
  name: item.name,
  category: item.category,
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
