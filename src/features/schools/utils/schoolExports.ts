import type { FavoriteDetails, SchoolRecord } from '../types';

function csvCell(value: string | number): string {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

export function buildSavedSchoolsCsv(schools: SchoolRecord[], details: Record<number, FavoriteDetails>): string {
  const rows: (string | number)[][] = [
    ['University', 'Country', 'Study areas', 'Places', 'Minimum GPA', 'Extra cost (EUR)', 'Language', 'Duration', 'Erasmus+', 'Priority', 'Personal note'],
    ...schools.map((school) => [
      school.name,
      school.country,
      school.specializations.join('; '),
      school.spots,
      school.gpa || 'Open',
      school.extracharge,
      school.language,
      school.semester,
      school.erasmus,
      details[school.id]?.priority ?? 'medium',
      details[school.id]?.note ?? '',
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
}

export function downloadSavedSchoolsCsv(schools: SchoolRecord[], details: Record<number, FavoriteDetails>): void {
  const blob = new Blob([buildSavedSchoolsCsv(schools, details)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mya-saved-universities.csv';
  link.click();
  URL.revokeObjectURL(url);
}
