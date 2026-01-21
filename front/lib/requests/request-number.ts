const REQUEST_NUMBER_PREFIX = '№';
const REQUEST_NUMBER_EMPTY = '—';
const REQUEST_NUMBER_SEPARATOR = ' ';

export const formatRequestNumber = (value: string | null | undefined, withPrefix = true): string => {
  const normalized = value?.trim();
  if (!normalized) return REQUEST_NUMBER_EMPTY;
  if (!withPrefix) return normalized;
  return `${REQUEST_NUMBER_PREFIX}${REQUEST_NUMBER_SEPARATOR}${normalized}`;
};
