import mongoose from 'mongoose';

export const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({ message: 'Database is unavailable. Check the MongoDB connection configuration.' });
};

export const requireAuthConfig = (_req, res, next) => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) return next();
  return res.status(503).json({ message: 'JWT_SECRET is not configured. Add a secure secret to server/.env.' });
};
