'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ActionCenterContext, useActionCenterStore } from '@/lib/useNotifications';
import { NotificationDrawer } from './NotificationDrawer';

export function ActionCenterProvider({ children }: { children: ReactNode }) {
  const store = useActionCenterStore();
  const { refetch } = store;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    void refetch();
  }, [refetch]);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  return (
    <ActionCenterContext.Provider value={{ ...store, drawerOpen, openDrawer, closeDrawer }}>
      {children}
      <NotificationDrawer />
    </ActionCenterContext.Provider>
  );
}
