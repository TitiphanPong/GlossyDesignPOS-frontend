import * as React from 'react';
import { CartItem } from '../types/cart';
import type { Product } from '../page';

export function useProductModals() {
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<CartItem | null>(null);

  return {
    activeProduct,
    setActiveProduct,
    openModal,
    setOpenModal,
    editingItem,
    setEditingItem,
  };
}
