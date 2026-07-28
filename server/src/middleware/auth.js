import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const demoUsers = {
  "demo-customer": {
    id: "demo-customer",
    name: "Aarav Sharma",
    email: "demo@queueless.app",
    role: "customer",
  },
  "demo-owner": {
    id: "demo-owner",
    name: "Maya Kapoor",
    email: "owner@queueless.app",
    role: "owner",
  },
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Authentication required" });

    const decoded = jwt.decode(token);
    if (!decoded)
      return res.status(401).json({ message: "Invalid or expired session" });

    if (mongoose.connection.readyState === 1) {
      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(verified.id);
        if (!req.user)
          return res.status(401).json({ message: "Account not found" });
        return next();
      } catch {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
    }

    const demoUser =
      demoUsers[decoded.id] ||
      (decoded.role
        ? {
            id: decoded.id,
            name: decoded.name || "Demo User",
            email: decoded.email || "demo@queueless.app",
            role: decoded.role,
          }
        : null);
    if (!demoUser)
      return res.status(401).json({ message: "Account not found" });

    req.user = { ...demoUser, _id: demoUser.id, id: demoUser.id };
    return next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};

export const allow =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ message: "Not authorized" });
