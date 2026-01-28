export const PROFILE_PATH = '/profile';
export const PROFILE_TAB_PARAM = 'tab';
export const PROFILE_TAB_PROFILE = 'profile';
export const PROFILE_TAB_SECURITY = 'security';
export const PROFILE_TAB_HISTORY = 'history';
export const PROFILE_REQUEST_PARAM = 'request';
export const PROFILE_REQUEST_NUMBER_PARAM = 'requestNumber';
export const PROFILE_VIEW_PARAM = 'view';
export const PROFILE_VIEW_CHAT = 'chat';
export const PROFILE_VIEW_DETAILS = 'details';

export type ProfileTab =
  | typeof PROFILE_TAB_PROFILE
  | typeof PROFILE_TAB_SECURITY
  | typeof PROFILE_TAB_HISTORY;

export type ProfileNotificationView = typeof PROFILE_VIEW_CHAT | typeof PROFILE_VIEW_DETAILS;

export const getProfileTab = (value?: string | null): ProfileTab => {
  if (value === PROFILE_TAB_SECURITY) return PROFILE_TAB_SECURITY;
  if (value === PROFILE_TAB_HISTORY) return PROFILE_TAB_HISTORY;
  return PROFILE_TAB_PROFILE;
};

export const getProfileNotificationView = (
  value?: string | null,
): ProfileNotificationView | null => {
  if (value === PROFILE_VIEW_CHAT || value === PROFILE_VIEW_DETAILS) {
    return value;
  }
  return null;
};

export const buildProfileNotificationHref = (args: {
  requestId: string;
  requestNumber?: string | null;
  view: ProfileNotificationView;
}): string => {
  const params = new URLSearchParams();
  params.set(PROFILE_TAB_PARAM, PROFILE_TAB_HISTORY);
  params.set(PROFILE_REQUEST_PARAM, args.requestId);
  if (args.requestNumber) {
    params.set(PROFILE_REQUEST_NUMBER_PARAM, args.requestNumber);
  }
  params.set(PROFILE_VIEW_PARAM, args.view);
  return `${PROFILE_PATH}?${params.toString()}`;
};
