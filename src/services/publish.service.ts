import * as fs from 'fs-extra';
import * as path from 'path';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify }_from 'util';

const execAsync = promisify(exec);

const PUBLIC_DIR = 'public';
const OUTPUT_DIR = 'dist';
const ZIP_FILE = 'website.zip';

export const publish = async (): Promise<string> => {
  // 1. Clear existing output directory
  await fs.emptyDir(OUTPUT_DIR);

  // 2. Copy public assets
  await fs.copy(PUBLIC_DIR, `${OUTPUT_DIR}`);

  // 3. Compile TypeScript (if needed, assuming it's already done in build step)
  // For this example, we'll assume the JS files are in `dist` already.
  // If not, you'd add a build step here.

  // 4. Create a zip archive
  const output = fs.createWriteStream(ZIP_FILE);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archiver has been finalized and the output file descriptor has closed.');
      resolve(ZIP_FILE);
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(OUTPUT_DIR, false);
    archive.finalize();
  });
};