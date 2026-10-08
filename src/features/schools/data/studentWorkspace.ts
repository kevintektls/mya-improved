import { readSavedSchools } from './savedSchools';
import type { ChecklistTask, FavoriteDetails, PlanningPreferences, StudentWorkspace } from '../types';

const STORAGE_KEY = 'mya-student-workspace-v1';
const MAX_COMPARISON_SCHOOLS = 4;

export const DEFAULT_PREFERENCES: PlanningPreferences = {
  studentGpa: null,
  maxExtraCharge: null,
  specializations: [],
  semesters: [],
  languages: [],
};

export const DEFAULT_CHECKLIST: Omit<ChecklistTask, 'dueDate' | 'completed'>[] = [
  { id: 'check-eligibility', title: 'Verify eligibility and study options' },
  { id: 'confirm-nomination', title: 'Confirm nomination with my campus' },
  { id: 'prepare-documents', title: 'Prepare application documents' },
  { id: 'submit-application', title: 'Submit the partner application' },
  { id: 'plan-housing', title: 'Plan accommodation and travel' },
  { id: 'check-administration', title: 'Check visa, insurance and local requirements' },
];

function emptyWorkspace(): StudentWorkspace {
  return {
    version: 1,
    savedSchoolIds: normalizeIds(readSavedSchools()),
    comparedSchoolIds: [],
    favoriteDetails: {},
    preferences: DEFAULT_PREFERENCES,
    checklists: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeIds(value: unknown, maxCount = Number.POSITIVE_INFINITY): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))].slice(0, maxCount);
}

function normalizePreferences(value: unknown): PlanningPreferences {
  if (!isRecord(value)) return DEFAULT_PREFERENCES;
  const numberOrNull = (entry: unknown) => typeof entry === 'number' && Number.isFinite(entry) && entry >= 0 ? entry : null;
  const stringArray = (entry: unknown) => Array.isArray(entry) ? [...new Set(entry.filter((item): item is string => typeof item === 'string'))] : [];
  return {
    studentGpa: numberOrNull(value.studentGpa),
    maxExtraCharge: numberOrNull(value.maxExtraCharge),
    specializations: stringArray(value.specializations),
    semesters: stringArray(value.semesters),
    languages: stringArray(value.languages),
  };
}

function normalizeFavorites(value: unknown): Record<number, FavoriteDetails> {
  if (!isRecord(value)) return {};
  const result: Record<number, FavoriteDetails> = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue;
    const priority = entry.priority === 'high' || entry.priority === 'low' ? entry.priority : 'medium';
    result[Number(id)] = { priority, note: typeof entry.note === 'string' ? entry.note.slice(0, 1000) : '' };
  }
  return result;
}

function normalizeChecklists(value: unknown): Record<number, ChecklistTask[]> {
  if (!isRecord(value)) return {};
  const result: Record<number, ChecklistTask[]> = {};
  for (const [id, entries] of Object.entries(value)) {
    if (!Array.isArray(entries)) continue;
    result[Number(id)] = entries.filter(isRecord).map((entry, index) => ({
      id: typeof entry.id === 'string' ? entry.id : `task-${index}`,
      title: typeof entry.title === 'string' ? entry.title.slice(0, 160) : '',
      dueDate: typeof entry.dueDate === 'string' ? entry.dueDate : '',
      completed: entry.completed === true,
    })).filter((task) => task.title.length > 0);
  }
  return result;
}

export function readStudentWorkspace(): StudentWorkspace {
  const fallback = emptyWorkspace();
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!isRecord(stored) || stored.version !== 1) return fallback;
    return {
      version: 1,
      savedSchoolIds: normalizeIds(stored.savedSchoolIds),
      comparedSchoolIds: normalizeIds(stored.comparedSchoolIds, MAX_COMPARISON_SCHOOLS),
      favoriteDetails: normalizeFavorites(stored.favoriteDetails),
      preferences: normalizePreferences(stored.preferences),
      checklists: normalizeChecklists(stored.checklists),
    };
  } catch {
    return fallback;
  }
}

export function writeStudentWorkspace(workspace: StudentWorkspace): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Storage can be unavailable in private browsing or when the quota is exceeded.
  }
}

export function defaultChecklist(): ChecklistTask[] {
  return DEFAULT_CHECKLIST.map((task) => ({ ...task, dueDate: '', completed: false }));
}

export function defaultFavoriteDetails(): FavoriteDetails {
  return { priority: 'medium', note: '' };
}
