import { redirect } from 'next/navigation';

type HomeInvoicePageProps = Readonly<{
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

function buildSearchString(searchParams: Record<string, string | string[] | undefined> | undefined): string {
  if (!searchParams) {
    return '';
  }

  const resolved = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      resolved.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(entry => {
        if (entry.length > 0) {
          resolved.append(key, entry);
        }
      });
    }
  });

  const query = resolved.toString();
  return query ? `?${query}` : '';
}

export default async function HomeInvoicePage({ params, searchParams }: HomeInvoicePageProps) {
  const { orderId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  redirect(`/print/invoice/${orderId}${buildSearchString(resolvedSearchParams)}`);
}
