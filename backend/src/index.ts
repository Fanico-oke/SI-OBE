import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import obeRouter from './routes/obe';
import doRouter from './routes/do';
import laporanRouter from './routes/laporan';
import authRouter from './routes/auth';
import actRouter from './routes/act';
import checkRouter from './routes/check';
import notifikasiRouter from './routes/notifikasi';
import referensiRouter from './routes/referensi';
import materiRouter from './routes/materi';
import settingsRouter from './routes/settings';
import kurikulumRouter from './routes/kurikulum-routes';
import planRouter from './routes/plan-routes';
import pemetaanRouter from './routes/pemetaan';
import dashboardRouter from './routes/dashboard';
import dokumentasiRouter from './routes/dokumentasi';
import { authenticate, authorize } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : true),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- API Status ---
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'SI-OBE Backend API is running' });
});

// --- Public routes ---
app.use('/api/auth', authRouter);

// --- Protected routes ---
app.use('/api/obe', authenticate, obeRouter);
app.use('/api/do', authenticate, doRouter);
app.use('/api/check', authenticate, authorize('KAPRODI', 'ADMIN'), checkRouter);
app.use('/api/act', authenticate, actRouter);
app.use('/api/laporan', authenticate, laporanRouter);
app.use('/api/notifikasi', authenticate, notifikasiRouter);
app.use('/api/referensi', authenticate, authorize('KAPRODI', 'ADMIN'), referensiRouter);
app.use('/api/materi', authenticate, authorize('KAPRODI', 'DOSEN'), materiRouter);
app.use('/api/settings', authenticate, authorize('ADMIN'), settingsRouter);

// --- Extracted route modules ---
app.use('/api/kurikulum', authenticate, kurikulumRouter);
app.use('/api', authenticate, planRouter);
app.use('/api/pemetaan', authenticate, pemetaanRouter);
app.use('/api/dashboard', authenticate, dashboardRouter);
app.use('/api/dokumentasi', authenticate, authorize('KAPRODI', 'ADMIN'), dokumentasiRouter);

// --- Serve frontend static files in production ---
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback to index.html for SPA routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export for Vercel serverless
export default app;
