const LOGIN_PATH = '/login';
const REGISTER_PATH = '/register';
const NEXT_PARAM = 'next';

export const buildAuthRedirectHref = (path: string, nextHref?: string | null): string => {
  if (!nextHref) return path;
  return `${path}?${NEXT_PARAM}=${encodeURIComponent(nextHref)}`;
};

export const buildLoginRedirectUrl = (nextHref: string): string =>
  buildAuthRedirectHref(LOGIN_PATH, nextHref);

export const buildRegisterRedirectUrl = (nextHref: string): string =>
  buildAuthRedirectHref(REGISTER_PATH, nextHref);

export const resolveNextPath = (next: string | null): string | null => {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//')) return null;
  return next;
};
