const STORAGE_KEY = 'mya-saved-schools';

export function readSavedSchools(): number[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((id): id is number => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function writeSavedSchools(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
