import type { SchoolDetailRecord, SchoolDirectoryData, SchoolRecord } from '../types';

const baseUrl = import.meta.env.BASE_URL;
const detailRequests = new Map<number, Promise<SchoolDetailRecord>>();

export async function fetchSchools(): Promise<SchoolRecord[]> {
  const response = await fetch(`${baseUrl}data/universities/index.json`);
  if (!response.ok) throw new Error('Could not load the school directory.');
  const data = await response.json() as SchoolDirectoryData;
  return (data.schools || []).map((school) => ({
    ...school,
    name: school.name.trim(),
    specializations: school.specializations || [],
  }));
}

export function fetchSchoolDetails(id: number): Promise<SchoolDetailRecord> {
  const cachedRequest = detailRequests.get(id);
  if (cachedRequest) return cachedRequest;

  const request = fetch(`${baseUrl}data/universities/details/${id}.json`)
    .then(async (response) => {
      if (!response.ok) throw new Error('Could not load this school profile.');
      const school = await response.json() as SchoolDetailRecord;
      if (school.id !== id) throw new Error('The school profile data is invalid.');
      return {
        ...school,
        name: school.name.trim(),
        images: school.images?.length ? school.images : [school.image1, school.image2, school.image3]
          .filter((image): image is string => Boolean(image))
          .map((image) => /^https?:\/\//i.test(image) ? image : `https://mya.epitech.eu/uploads/${image}`),
      };
    })
    .catch((error: unknown) => {
      detailRequests.delete(id);
      throw error;
    });

  detailRequests.set(id, request);
  return request;
}
