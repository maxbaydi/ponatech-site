import { Prisma } from '@prisma/client';

const SEARCH_TERM_SEPARATOR = /[\s,;]+/;
const SEARCH_MATCH_MODE: Prisma.QueryMode = 'insensitive';

const normalizeSearchValue = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const splitSearchTerms = (search: string): string[] => {
  const parts = search
    .split(SEARCH_TERM_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return Array.from(new Set(parts));
};

const buildTermFilters = (term: string): Prisma.ProductWhereInput[] => [
  { title: { contains: term, mode: SEARCH_MATCH_MODE } },
  { sku: { contains: term, mode: SEARCH_MATCH_MODE } },
  { description: { contains: term, mode: SEARCH_MATCH_MODE } },
  { brand: { name: { contains: term, mode: SEARCH_MATCH_MODE } } },
  { category: { name: { contains: term, mode: SEARCH_MATCH_MODE } } },
];

const buildProductSearchWhere = (rawSearch?: string): Prisma.ProductWhereInput | undefined => {
  const search = normalizeSearchValue(rawSearch);
  if (!search) {
    return undefined;
  }

  const terms = splitSearchTerms(search);
  if (terms.length === 0) {
    return undefined;
  }

  if (terms.length === 1) {
    return { OR: buildTermFilters(terms[0]) };
  }

  return {
    AND: terms.map((term) => ({
      OR: buildTermFilters(term),
    })),
  };
};

const normalizeAndFilters = (
  value?: Prisma.ProductWhereInput | Prisma.ProductWhereInput[],
): Prisma.ProductWhereInput[] => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const appendProductAndFilters = (
  where: Prisma.ProductWhereInput,
  filters: Prisma.ProductWhereInput[],
): void => {
  if (filters.length === 0) {
    return;
  }

  where.AND = [...normalizeAndFilters(where.AND), ...filters];
};

export const applyProductSearchFilter = (
  where: Prisma.ProductWhereInput,
  rawSearch?: string,
): void => {
  const searchFilter = buildProductSearchWhere(rawSearch);
  if (!searchFilter) {
    return;
  }

  appendProductAndFilters(where, [searchFilter]);
};
