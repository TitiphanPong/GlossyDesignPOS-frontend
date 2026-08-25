import AdminGuardLayout from '@/components/admin/AdminGuardLayout';
import GlossyLocalizationProvider from '@/components/date-pickers/GlossyLocalizationProvider';

type HomeLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <GlossyLocalizationProvider>
      <AdminGuardLayout>{children}</AdminGuardLayout>
    </GlossyLocalizationProvider>
  );
}
