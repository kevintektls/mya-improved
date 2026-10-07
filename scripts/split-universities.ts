import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

type SourceSchool = Record<string, unknown> & { id: number; name: string };

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Usage: bun run data:split -- <path-to-source-json>');

const parsed: unknown = JSON.parse(await readFile(resolve(sourcePath), 'utf8'));
const sourceSchools = Array.isArray(parsed)
  ? parsed
  : typeof parsed === 'object' && parsed !== null && 'schools' in parsed && Array.isArray(parsed.schools)
    ? parsed.schools
    : null;

if (!sourceSchools) throw new Error('The source JSON must be an array or an object containing a schools array.');

const schools = sourceSchools as SourceSchool[];
const ids = new Set<number>();
const detailsDirectory = resolve('public/data/universities/details');
const indexPath = resolve('public/data/universities/index.json');
const uploadsBase = 'https://mya.epitech.eu/uploads/';

function normalizeImages(school: SourceSchool): string[] {
  const sourceImages = Array.isArray(school.images) && school.images.length > 0
    ? school.images
    : [school.image1, school.image2, school.image3];

  return sourceImages
    .filter((image): image is string => typeof image === 'string' && image.length > 0)
    .map((image) => /^https?:\/\//i.test(image) ? image : `${uploadsBase}${image}`);
}

const summaries: Record<string, unknown>[] = [];
const detailedRecords: { id: number; record: Record<string, unknown> }[] = [];

for (const source of schools) {
  if (!Number.isInteger(source.id) || typeof source.name !== 'string') {
    throw new Error('Every school must have an integer id and a name.');
  }
  if (ids.has(source.id)) throw new Error(`Duplicate university id: ${source.id}`);
  ids.add(source.id);

  const name = source.name.trim();
  const images = normalizeImages(source);
  const record = { ...source, name, images };

  summaries.push({
    id: source.id,
    name,
    country: source.country,
    gpa: source.gpa,
    spots: source.spots,
    diploma: source.diploma,
    language: source.language,
    extracharge: source.extracharge,
    erasmus: source.erasmus,
    semester: source.semester,
    display: source.display,
    specializations: Array.isArray(source.specializations) ? source.specializations : [],
    coverImage: images[0] ?? null,
  });
  detailedRecords.push({ id: source.id, record });
}

await mkdir(detailsDirectory, { recursive: true });
for (const filename of await readdir(detailsDirectory)) {
  if (/^\d+\.json$/.test(filename)) await rm(join(detailsDirectory, filename));
}

for (const { id, record } of detailedRecords) {
  await writeFile(join(detailsDirectory, `${id}.json`), `${JSON.stringify(record, null, 2)}\n`);
}

await writeFile(indexPath, `${JSON.stringify({ schools: summaries }, null, 2)}\n`);
console.log(`Split ${schools.length} universities into ${indexPath} and ${detailsDirectory}.`);
