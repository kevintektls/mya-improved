import { describe, expect, it } from 'bun:test';
import { matchSchools } from '../src/features/schools/utils/schoolMatching';
import type { PlanningPreferences, SchoolRecord } from '../src/features/schools/types';

function school(overrides: Partial<SchoolRecord> = {}): SchoolRecord {
  return {
    id: 1, name: 'A School', country: 'Canada', gpa: 2.5, spots: 3, diploma: 'YES', language: 'English',
    extracharge: 500, erasmus: 'YES', semester: 'Full-year or semester', display: 'YES',
    specializations: ['Artificial Intelligence', 'Security'], coverImage: null, ...overrides,
  };
}

const blank: PlanningPreferences = { studentGpa: null, maxExtraCharge: null, specializations: [], semesters: [], languages: [] };

describe('matchSchools', () => {
  it('requires every selected study area and respects all populated criteria', () => {
    const eligible = school();
    const rejected = school({ id: 2, name: 'Other School', specializations: ['Artificial Intelligence'] });
    const matches = matchSchools([rejected, eligible], {
      studentGpa: 3, maxExtraCharge: 500, specializations: ['Artificial Intelligence', 'Security'],
      semesters: ['Full-year or semester'], languages: ['English'],
    });
    expect(matches.map((match) => match.school.id)).toEqual([1]);
    expect(matches[0].matchedCriteria).toContain('All selected study areas');
  });

  it('treats an open GPA requirement as eligible and excludes a requirement above the student GPA', () => {
    const open = school({ id: 2, name: 'Open School', gpa: 0 });
    const strict = school({ id: 3, name: 'High GPA School', gpa: 3.1 });
    expect(matchSchools([strict, open], { ...blank, studentGpa: 3 }).map(({ school: result }) => result.id)).toEqual([2]);
  });

  it('returns all schools alphabetically when no criteria are set', () => {
    const matches = matchSchools([school({ id: 2, name: 'Zeta' }), school({ id: 3, name: 'Alpha' })], blank);
    expect(matches.map((match) => match.school.name)).toEqual(['Alpha', 'Zeta']);
  });
});
