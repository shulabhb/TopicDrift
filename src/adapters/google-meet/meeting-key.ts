/**
 * Derives a privacy-safe local meeting key from a Google Meet URL.
 * Stores only the room path segment, never query parameters or full URLs.
 */
export function deriveMeetingKeyFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== 'meet.google.com') {
      return undefined;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);

    if (segments.length !== 1) {
      return undefined;
    }

    const room = segments[0];

    if (!room || room === 'landing' || room === 'new') {
      return undefined;
    }

    // Meet room codes use lowercase letters and hyphens.
    if (!/^[a-z]{3,}-[a-z]{3,}-[a-z]{3,}$/.test(room)) {
      return undefined;
    }

    return room;
  } catch {
    return undefined;
  }
}

export function isLandingPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === '/' || normalized === '/landing';
}
