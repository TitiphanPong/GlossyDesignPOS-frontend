// app/home/layout.tsx

import AppShell from "./shell";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}