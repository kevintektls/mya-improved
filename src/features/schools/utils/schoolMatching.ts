import type { PlanningPreferences, SchoolRecord } from '../types';

export interface SchoolMatch {
  school: SchoolRecord;
  matchedCriteria: string[];
}

export function matchSchools(schools: SchoolRecord[], preferences: PlanningPreferences): SchoolMatch[] {
  return schools.flatMap((school) => {
    const matchedCriteria: string[] = [];
    if (preferences.studentGpa !== null) {
      if (school.gpa > 0 && school.gpa > preferences.studentGpa) return [];
      matchedCriteria.push(school.gpa > 0 ? `GPA ${school.gpa.toFixed(1)} or higher` : 'No minimum GPA listed');
    }
    if (preferences.maxExtraCharge !== null) {
      if (school.extracharge > preferences.maxExtraCharge) return [];
      matchedCriteria.push(`Extra cost up to €${preferences.maxExtraCharge.toLocaleString('en-US')}`);
    }
    if (preferences.specializations.length) {
      if (!preferences.specializations.every((area) => school.specializations.includes(area))) return [];
      matchedCriteria.push('All selected study areas');
    }
    if (preferences.semesters.length) {
      if (!preferences.semesters.includes(school.semester)) return [];
      matchedCriteria.push(school.semester);
    }
    if (preferences.languages.length) {
      const schoolLanguages = school.language.split(/[,/;]|\s+and\s+/i).map((language) => language.trim().toLocaleLowerCase()).filter(Boolean);
      if (!preferences.languages.some((language) => schoolLanguages.includes(language.toLocaleLowerCase()))) return [];
      matchedCriteria.push(`Language: ${school.language}`);
    }
    return [{ school, matchedCriteria }];
  }).sort((a, b) => a.school.name.localeCompare(b.school.name));
}
