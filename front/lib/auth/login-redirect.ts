const LOGIN_PATH = '/login';
const NEXT_PARAM = 'next';

export const buildLoginRedirectUrl = (nextHref: string): string =>
  `${LOGIN_PATH}?${NEXT_PARAM}=${encodeURIComponent(nextHref)}`;
