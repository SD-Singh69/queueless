import { Router } from "express";
import Shop from "../models/Shop.js";
import QueueEntry from "../models/QueueEntry.js";
import { requireAuth, allow } from "../middleware/auth.js";
const router = Router();

const emitQueueChange = (req, shopId) => {
  const io = req.app.get("io");
  if (io) io.to(`shop:${shopId}`).emit("queue:changed");
};

router.post("/join", requireAuth, allow("customer"), async (req, res, next) => {
  try {
    const shopId = req.body.shopId || req.params.shopId;
    if (!shopId)
      return res.status(400).json({ message: "Shop ID is required" });

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isOpen)
      return res.status(404).json({ message: "This queue is unavailable" });

    const existing = await QueueEntry.findOne({
      shop: shop._id,
      customer: req.user._id,
      status: { $in: ["waiting", "serving"] },
    });
    if (existing)
      return res.status(409).json({ message: "You are already in this queue" });

    const last = await QueueEntry.findOne({ shop: shop._id }).sort("-token");
    const waiting = await QueueEntry.countDocuments({
      shop: shop._id,
      status: "waiting",
    });

    const entry = await QueueEntry.create({
      shop: shop._id,
      customer: req.user._id,
      customerName: req.body.customerName || req.user.name,
      customerPhone: req.body.customerPhone || req.user.phone || "",
      token: (last?.token || 0) + 1,
      estimatedWait: waiting * shop.averageServiceMinutes,
    });

    emitQueueChange(req, shop._id);
    return res.status(201).json(entry);
  } catch (e) {
    next(e);
  }
});

router.get("/my", requireAuth, allow("customer"), async (req, res, next) => {
  try {
    const entries = await QueueEntry.find({ customer: req.user._id })
      .populate("shop")
      .sort("-createdAt");
    res.json(entries);
  } catch (e) {
    next(e);
  }
});

router.get(
  "/status/:id",
  requireAuth,
  allow("customer"),
  async (req, res, next) => {
    try {
      const entry = await QueueEntry.findById(req.params.id).populate("shop");
      if (!entry)
        return res.status(404).json({ message: "Queue entry not found" });

      const aheadCount = await QueueEntry.countDocuments({
        shop: entry.shop._id,
        status: "waiting",
        token: { $lt: entry.token },
      });

      return res.json({
        ...entry.toObject(),
        aheadCount,
        estimatedWaitMinutes: aheadCount * entry.shop.averageServiceMinutes,
      });
    } catch (e) {
      next(e);
    }
  },
);

router.patch(
  "/:id/status",
  requireAuth,
  allow("owner"),
  async (req, res, next) => {
    try {
      const entry = await QueueEntry.findById(req.params.id).populate("shop");
      if (!entry || entry.shop.owner.toString() !== req.user.id)
        return res.status(404).json({ message: "Queue entry not found" });

      entry.status = req.body.status;
      if (req.body.status === "completed") entry.servedAt = new Date();
      await entry.save();

      emitQueueChange(req, entry.shop._id);
      return res.json(entry);
    } catch (e) {
      next(e);
    }
  },
);

export default router;
