import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';



const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET belum diset di .env — server tidak bisa berjalan dengan aman.');
  process.exit(1);
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        nama: string;
        role: string;
      };
    }
  }
}

/**
 * Generate JWT token for a user
 */
export const generateToken = (user: { id: string; username: string; nama: string; role: string }) => {
  return jwt.sign(
    { id: user.id, username: user.username, nama: user.nama, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Authentication middleware — validates JWT Bearer token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check Authorization header first (JWT)
    const authHeader = req.headers['authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; nama: string; role: string };
        
        // Verify user still exists in DB
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, username: true, nama: true, role: true }
        });

        if (!user) {
          return res.status(401).json({ error: 'Unauthorized — user tidak ditemukan' });
        }

        req.user = user;
        return next();
      } catch (jwtError) {
        return res.status(401).json({ error: 'Unauthorized — token tidak valid atau expired' });
      }
    }

    return res.status(401).json({ error: 'Unauthorized — token tidak ditemukan' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Authorization middleware — checks if user has one of the allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden — role ${req.user.role} tidak memiliki akses` });
    }
    next();
  };
};
