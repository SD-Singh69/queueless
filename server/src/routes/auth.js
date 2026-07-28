import mongoose from "mongoose";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const demoUsers = {
  "demo@queueless.app": {
    id: "demo-customer",
    name: "Aarav Sharma",
    email: "demo@queueless.app",
    role: "customer",
  },
  "owner@queueless.app": {
    id: "demo-owner",
    name: "Maya Kapoor",
    email: "owner@queueless.app",
    role: "owner",
  },
};
const isDemoLogin = (email, password) =>
  password === "demo1234" && Object.hasOwn(demoUsers, email);
const tokenFor = (user) =>
  jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("role").isIn(["customer", "owner"]),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res
          .status(422)
          .json({ message: "Please correct the highlighted details" });
      if (mongoose.connection.readyState !== 1)
        return res
          .status(503)
          .json({
            message:
              "Database is unavailable right now. Please try again later.",
          });
      if (await User.exists({ email: req.body.email }))
        return res
          .status(409)
          .json({ message: "An account with this email already exists" });
      const user = await User.create(req.body);
      res
        .status(201)
        .json({
          token: tokenFor(user),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        if (isDemoLogin(req.body.email, req.body.password)) {
          const user = demoUsers[req.body.email];
          return res.json({
            token: tokenFor(user),
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
        return res
          .status(503)
          .json({
            message:
              "Database is unavailable right now. Please try again later.",
          });
      }
      const user = await User.findOne({ email: req.body.email }).select(
        "+password",
      );
      if (!user || !(await user.comparePassword(req.body.password)))
        return res.status(401).json({ message: "Invalid email or password" });
      res.json({
        token: tokenFor(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e) {
      next(e);
    }
  },
);
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
router.patch(
  "/me",
  requireAuth,
  [
    body("name").optional().trim().isLength({ min: 2, max: 70 }),
    body("phone").optional().trim().isLength({ max: 20 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res
          .status(422)
          .json({ message: "Please provide valid profile details" });
      if (mongoose.connection.readyState !== 1)
        return res
          .status(503)
          .json({
            message:
              "Database is unavailable right now. Please try again later.",
          });
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (typeof req.body.phone === "string") updates.phone = req.body.phone;
      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });
      res.json({ user });
    } catch (e) {
      next(e);
    }
  },
);
export default router;
