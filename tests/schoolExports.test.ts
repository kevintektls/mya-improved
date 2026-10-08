import { describe, expect, it } from 'bun:test';
import { buildSavedSchoolsCsv } from '../src/features/schools/utils/schoolExports';
import type { SchoolRecord } from '../src/features/schools/types';

describe('buildSavedSchoolsCsv', () => {
  it('keeps Unicode and safely quotes commas and quotation marks', () => {
    const school: SchoolRecord = {
      id: 1, name: 'Université "Laval", Québec', country: 'Canada', gpa: 2.5, spots: 3,
      diploma: 'YES', language: 'English', extracharge: 500, erasmus: 'YES', semester: 'Full-year only',
      display: 'YES', specializations: ['AI', 'Security'], coverImage: null,
    };
    const csv = buildSavedSchoolsCsv([school], { 1: { priority: 'high', note: 'Look at housing, first' } });
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Université ""Laval"", Québec"');
    expect(csv).toContain('"AI; Security"');
    expect(csv).toContain('"Look at housing, first"');
  });
});
