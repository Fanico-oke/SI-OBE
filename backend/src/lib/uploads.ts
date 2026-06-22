import path from 'path';

/**
 * Returns the base uploads directory.
 * On Vercel (serverless), the filesystem is read-only except /tmp.
 * Locally, use the project-relative 'uploads/' directory.
 */
export function getUploadsDir(subDir: string = ''): string {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
  const base = isVercel ? '/tmp/uploads' : path.join(__dirname, '../../uploads');
  return subDir ? path.join(base, subDir) : base;
}
