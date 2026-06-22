import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { generateToken } from '../middleware/auth';
import { validate, loginSchema, createUserSchema, changePasswordSchema } from '../lib/validators';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP per 15 min
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});


// Login — returns JWT token
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const v = validate(loginSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });
    const { username, password } = v.data;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const userData = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role
    };
    const token = generateToken(userData);

    // Return user data + token
    res.json({
      ...userData,
      token
    });

  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Gagal melakukan login' });
  }
});

// Endpoint rahasia untuk men-generate data dummy User
router.post('/seed', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync('123', 10);
    const users = [
      { username: 'kaprodi', password: hashedPassword, nama: 'Bapak Kaprodi', role: 'KAPRODI' },
      { username: 'dosen', password: hashedPassword, nama: 'Bapak Dosen', role: 'DOSEN' },
      { username: '120220001', password: hashedPassword, nama: 'Mahasiswa Dummy', role: 'MAHASISWA' },
      { username: 'admin', password: hashedPassword, nama: 'Super Admin', role: 'ADMIN' },
    ];

    for (const u of users) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
        create: u
      });
    }

    res.json({ message: 'Berhasil membuat 4 user dummy (kaprodi, dosen, mahasiswa, admin)' });
  } catch (error) {
    console.error('Error seeding users:', error);
    res.status(500).json({ error: 'Gagal membuat user' });
  }
});

// GET semua user
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, nama: true, role: true, email: true, phone: true, lastLoginAt: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna' });
  }
});

// POST tambah user baru
router.post('/users', async (req, res) => {
  try {
    const v = validate(createUserSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });
    const { username, password, nama, role, email, phone } = v.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, nama, role, email: email || null, phone: phone || null }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambah pengguna (mungkin username duplikat)' });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus pengguna' });
  }
});

// GET /me — return the logged-in user's profile
router.get('/me', async (req, res) => {
  try {
    const userId = req.query.userId as string;

    let user;
    if (userId) {
      // Fetch specific user by ID (from frontend auth store)
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          nama: true,
          role: true,
          email: true,
          phone: true,
          bio: true,
          nidn: true,
          faculty: true,
          institution: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true
        }
      });
    } else {
      // Fallback: return first user found
      user = await prisma.user.findFirst({
        select: {
          id: true,
          username: true,
          nama: true,
          role: true,
          email: true,
          phone: true,
          bio: true,
          nidn: true,
          faculty: true,
          institution: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true
        }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Gagal mengambil profil' });
  }
});

// PUT /profile/:id — update user profile fields
router.put('/profile/:id', async (req, res) => {
  try {
    const { nama, email, phone, bio, nidn, faculty, institution } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(nidn !== undefined && { nidn }),
        ...(faculty !== undefined && { faculty }),
        ...(institution !== undefined && { institution })
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        email: true,
        phone: true,
        bio: true,
        nidn: true,
        faculty: true,
        institution: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Gagal mengupdate profil' });
  }
});

// PUT /change-password — change password with JWT verification
router.put('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (jwtError: any) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    const v = validate(changePasswordSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(v.data.currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Password saat ini salah' });

    const hashed = await bcrypt.hash(v.data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Gagal mengubah password' });
  }
});

export default router;
