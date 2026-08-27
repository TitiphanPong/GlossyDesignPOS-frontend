import { permanentRedirect } from 'next/navigation';

// Compatibility owner: Frontend navigation.
// Deprecated: 2026-08-28. Remove after 2026-11-30 if analytics/support logs show no remaining legacy bookmarks.
export default function LegacySaleListPage() {
  permanentRedirect('/home/orders');
}
