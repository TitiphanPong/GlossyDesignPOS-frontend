export function buildOrderTrackingPath(orderNumber: string): string | null {
  const normalizedOrderNumber = orderNumber.trim();
  if (!normalizedOrderNumber) {
    return null;
  }

  const params = new URLSearchParams({ order: normalizedOrderNumber });
  return `/track?${params.toString()}`;
}

function buildAbsoluteTrackingUrl(path: string | null, origin: string | null | undefined): string | null {
  if (!path || !origin?.trim()) {
    return null;
  }

  try {
    const baseUrl = new URL(origin.trim());
    if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
      return null;
    }

    return new URL(path, baseUrl.origin).toString();
  } catch {
    return null;
  }
}

export function buildOrderTrackingUrl(orderNumber: string, origin: string | null | undefined): string | null {
  return buildAbsoluteTrackingUrl(buildOrderTrackingPath(orderNumber), origin);
}

export function buildSecureOrderTrackingPath(token: string): string | null {
  const normalizedToken = token.trim();
  if (!/^[A-Za-z0-9_-]{43}$/.test(normalizedToken)) {
    return null;
  }

  const params = new URLSearchParams({ t: normalizedToken });
  return `/track?${params.toString()}`;
}

export function buildSecureOrderTrackingUrl(token: string, origin: string | null | undefined): string | null {
  return buildAbsoluteTrackingUrl(buildSecureOrderTrackingPath(token), origin);
}
