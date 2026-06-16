export function normalizeTag(tag: string) {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-');
}

export function normalizeTags(tags: string[]) {
  const unique = new Set<string>();

  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (normalized) {
      unique.add(normalized);
    }
  }

  return [...unique];
}
