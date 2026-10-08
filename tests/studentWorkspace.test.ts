import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { readStudentWorkspace } from '../src/features/schools/data/studentWorkspace';

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
  removeItem: (key: string) => { values.delete(key); },
  clear: () => values.clear(),
  key: (index: number) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
});

afterEach(() => values.clear());

describe('readStudentWorkspace', () => {
  it('migrates existing saved school IDs when no workspace exists yet', () => {
    storage.setItem('mya-saved-schools', '[4, 8, 8, "10"]');
    const workspace = readStudentWorkspace();
    expect(workspace.savedSchoolIds).toEqual([4, 8]);
    expect(workspace.comparedSchoolIds).toEqual([]);
  });

  it('normalizes stored preferences and limits comparison to four unique IDs', () => {
    storage.setItem('mya-student-workspace-v1', JSON.stringify({
      version: 1,
      savedSchoolIds: [1, 1, 2],
      comparedSchoolIds: [1, 2, 3, 4, 5],
      favoriteDetails: { 1: { priority: 'high', note: 'Visit Québec' } },
      preferences: { studentGpa: 3.2, maxExtraCharge: 1000, specializations: ['AI', 'AI'], semesters: [], languages: [] },
      checklists: {},
    }));
    const workspace = readStudentWorkspace();
    expect(workspace.savedSchoolIds).toEqual([1, 2]);
    expect(workspace.comparedSchoolIds).toEqual([1, 2, 3, 4]);
    expect(workspace.favoriteDetails[1]).toEqual({ priority: 'high', note: 'Visit Québec' });
    expect(workspace.preferences.specializations).toEqual(['AI']);
  });

  it('recovers safely from malformed storage', () => {
    storage.setItem('mya-student-workspace-v1', '{broken');
    expect(readStudentWorkspace().version).toBe(1);
  });
});
