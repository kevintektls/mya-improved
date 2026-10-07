import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

type SchoolWithImages = {
  sourceImages?: string[];
  images?: string[];
  image1?: string;
  image2?: string;
  image3?: string;
};

const proxy = process.env.BURP_PROXY || 'http://127.0.0.1:8080';
const detailsDirectory = resolve('public/data/universities/details');
const imagesDirectory = resolve('public/images/universities');
const imageJobs = new Map<string, string>();

function sourceFilenameFor(image: string): string {
  const path = /^https?:\/\//i.test(image) ? new URL(image).pathname : image;
  const filename = basename(path);
  if (!/^[\w.-]+$/.test(filename)) throw new Error(`Invalid image path: ${image}`);
  return filename;
}

function run(program: string, args: string[]): Promise<{ code: number | null; error: string }> {
  return new Promise((resolveResult) => {
    const child = spawn(program, args);
    let error = '';
    child.stderr.on('data', (chunk) => { error += chunk.toString(); });
    child.on('error', (reason) => resolveResult({ code: -1, error: String(reason) }));
    child.on('close', (code) => resolveResult({ code, error }));
  });
}

async function download(sourceFilename: string): Promise<{ result: 'downloaded' | 'skipped' } | { error: string }> {
  const outputFilename = `${basename(sourceFilename, extname(sourceFilename))}.webp`;
  const outputPath = join(imagesDirectory, outputFilename);
  try {
    if ((await stat(outputPath)).size > 0) return { result: 'skipped' };
  } catch {
    // The optimized image has not been downloaded yet.
  }

  const sourcePath = `${outputPath}.source`;
  const temporaryPath = `${outputPath}.part`;
  const sourceUrl = `https://mya.epitech.eu/uploads/${sourceFilename}`;
  const response = await run('curl', [
    '--fail', '--silent', '--show-error', '--location', '--max-time', '120', '--retry', '2',
    '--proxy', proxy, '--insecure', '--output', sourcePath, sourceUrl,
  ]);
  if (response.code !== 0) {
    await rm(sourcePath, { force: true });
    return { error: `${sourceFilename}: ${response.error || `curl exited with ${response.code}`}` };
  }

  const conversion = await run('cwebp', ['-quiet', '-q', '84', sourcePath, '-o', temporaryPath]);
  let converted = conversion.code === 0;
  let fallbackError = '';
  if (conversion.code !== 0) {
    const fallback = await run('python3', [
      '-c',
      "import sys; from PIL import Image; image = Image.open(sys.argv[1]); image = image if image.mode in ('RGB', 'RGBA') else image.convert('RGB'); image.save(sys.argv[2], format='WEBP', quality=84, method=6)",
      `${outputPath}.source`, temporaryPath,
    ]);
    converted = fallback.code === 0;
    fallbackError = fallback.error || String(fallback.code);
  }
  await rm(sourcePath, { force: true });
  if (!converted) {
    await rm(temporaryPath, { force: true });
    return { error: `${sourceFilename}: cwebp failed (${conversion.error || conversion.code}); Python/Pillow fallback failed (${fallbackError})` };
  }

  const optimizedSize = await stat(temporaryPath).then((file) => file.size).catch(() => 0);
  if (optimizedSize === 0) {
    await rm(temporaryPath, { force: true });
    return { error: `${sourceFilename}: conversion produced an empty image` };
  }
  await rename(temporaryPath, outputPath);
  return { result: 'downloaded' };
}

await mkdir(imagesDirectory, { recursive: true });
for (const filename of await readdir(detailsDirectory)) {
  if (!filename.endsWith('.json')) continue;
  const school = JSON.parse(await readFile(join(detailsDirectory, filename), 'utf8')) as SchoolWithImages;
  const sources = school.sourceImages?.length
    ? school.sourceImages
    : school.images?.length ? school.images : [school.image1, school.image2, school.image3].filter(Boolean) as string[];
  for (const image of sources) {
    const sourceFilename = sourceFilenameFor(image);
    const outputFilename = `${basename(sourceFilename, extname(sourceFilename))}.webp`;
    imageJobs.set(outputFilename, sourceFilename);
  }
}

const queue = [...imageJobs.values()];
const failures: string[] = [];
let nextIndex = 0;
let completed = 0;
let downloaded = 0;
let skipped = 0;

async function worker(): Promise<void> {
  while (true) {
    const index = nextIndex++;
    if (index >= queue.length) return;
    const result = await download(queue[index]);
    if ('error' in result) failures.push(result.error);
    else if (result.result === 'downloaded') downloaded++;
    else skipped++;
    completed++;
    if (completed % 25 === 0) console.log(`Images processed: ${completed}/${queue.length}`);
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));
console.log(JSON.stringify({ total: queue.length, downloaded, skipped, failed: failures.length, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
