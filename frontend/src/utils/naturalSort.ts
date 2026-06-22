/**
 * Natural sort comparator - sorts strings with embedded numbers correctly.
 * e.g., CPL1, CPL2, CPL10 instead of CPL1, CPL10, CPL2
 */
export const naturalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

export const sortByKode = <T extends { kode: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => naturalSort(a.kode, b.kode));
};
