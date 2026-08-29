import { redirect } from 'next/navigation';

type LegacyCustomerDisplayPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function LegacyCustomerDisplayPage({ searchParams }: LegacyCustomerDisplayPageProps) {
  const params = await searchParams;
  const rawDisplayToken = params.display;
  const displayToken = Array.isArray(rawDisplayToken) ? rawDisplayToken[0] : rawDisplayToken;

  if (displayToken) {
    redirect(`/customer-display?display=${encodeURIComponent(displayToken)}`);
  }

  redirect('/customer-display');
}
