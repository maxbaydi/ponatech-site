const STORAGE_KEY = 'pona_guest_request';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

export type GuestRequestPayload = {
  requestId: string;
  email: string;
  createdAt?: string;
  savedAt: string;
};

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const isPayloadValid = (payload: GuestRequestPayload): boolean => {
  if (!payload.requestId || !payload.email || !payload.savedAt) return false;
  return true;
};

const isExpired = (payload: GuestRequestPayload): boolean => {
  const savedAtMs = Date.parse(payload.savedAt);
  if (!Number.isFinite(savedAtMs)) return true;
  return Date.now() - savedAtMs > MAX_AGE_MS;
};

export const saveGuestRequest = (args: {
  requestId: string;
  email: string;
  createdAt?: string;
}): void => {
  if (!isBrowser()) return;
  const email = normalizeEmail(args.email);
  if (!email || !args.requestId) return;

  const payload: GuestRequestPayload = {
    requestId: args.requestId,
    email,
    createdAt: args.createdAt,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getGuestRequest = (): GuestRequestPayload | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GuestRequestPayload;
    if (!isPayloadValid(parsed) || isExpired(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearGuestRequest = (): void => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const isGuestRequestEmailMatch = (
  guest: GuestRequestPayload | null,
  email: string,
): boolean => {
  if (!guest) return false;
  return normalizeEmail(email) === normalizeEmail(guest.email);
};
