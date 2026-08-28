export function buildOrderTrackingPath(orderNumber: string): string | null {
  const normalizedOrderNumber = orderNumber.trim();
  if (!normalizedOrderNumber) {
    return null;
  }

  const params = new URLSearchParams({ order: normalizedOrderNumber });
  return `/track?${params.toString()}`;
}

export function buildOrderTrackingUrl(orderNumber: string, origin: string | null | undefined): string | null {
  const trackingPath = buildOrderTrackingPath(orderNumber);
  if (!trackingPath || !origin?.trim()) {
    return null;
  }

  try {
    const baseUrl = new URL(origin.trim());
    if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
      return null;
    }

    return new URL(trackingPath, baseUrl.origin).toString();
  } catch {
    return null;
  }
}
