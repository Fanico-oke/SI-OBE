import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const createKurikulumSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  prodi: z.string().min(1),
  tahunMulai: z.coerce.number().int().min(2000).max(2100),
  tahunSelesai: z.coerce.number().int().min(2000).max(2100),
  deskripsi: z.string().optional(),
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(3, 'Password minimal 3 karakter'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['ADMIN', 'KAPRODI', 'DOSEN', 'MAHASISWA']),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const createModulSchema = z.object({
  kurikulumId: z.string().uuid(),
  kode: z.string().min(1),
  nama: z.string().min(1),
  sks: z.coerce.number().int().min(1).max(12),
  semester: z.coerce.number().int().min(1).max(8),
  koordinator: z.string().optional(),
  status: z.string().optional(),
});

export const createActionPlanSchema = z.object({
  kurikulumId: z.string().optional(),
  title: z.string().min(3),
  context: z.string().optional(),
  assignedTo: z.string().min(1),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  status: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});

// Helper to validate request body
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const messages = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
  return { success: false, error: messages };
}
