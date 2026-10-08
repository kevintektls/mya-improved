import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import world from '@svg-maps/world';

const outputDirectory = resolve('public/data');
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, 'world-countries.json'), `${JSON.stringify({ viewBox: world.viewBox, locations: world.locations }, null, 2)}\n`);
console.log(`Exported ${world.locations.length} country shapes to public/data/world-countries.json.`);
