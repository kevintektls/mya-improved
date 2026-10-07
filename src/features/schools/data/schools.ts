import type { SchoolDirectoryData, SchoolRecord } from '../types';

export function normalizeSchools(list: SchoolRecord[]): SchoolRecord[] {
  return list.map((school) => ({
    ...school,
    name: school.name.trim(),
    images: school.images?.length ? school.images : [school.image1, school.image2, school.image3]
      .filter((image): image is string => Boolean(image))
      .map((image) => `https://mya.epitech.eu/uploads/${image}`),
  }));
}

export async function fetchSchools(): Promise<SchoolRecord[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/mya-epitech-universities.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load the school directory.');
  const data = await response.json() as SchoolDirectoryData;
  return normalizeSchools(data.schools || []);
}
