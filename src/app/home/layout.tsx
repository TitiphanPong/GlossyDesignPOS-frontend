import AdminGuardLayout from '@/components/admin/AdminGuardLayout';

type HomeLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HomeLayout({ children }: HomeLayoutProps) {
  return <AdminGuardLayout>{children}</AdminGuardLayout>;
}
