const express = require("express");
const router = express.Router();
const QueueEntry = require("../models/QueueEntry");
const { sendSMSNotification } = require("../utils/notifications");

// Helper: Calculate average service duration in minutes based on last 20 served tokens
async function calculateAverageServiceTime(shopId) {
  const completedEntries = await QueueEntry.find({
    shopId,
    status: "served",
    servedAt: { $exists: true },
    createdAt: { $exists: true },
  })
    .sort({ servedAt: -1 })
    .limit(20);

  if (!completedEntries.length) return 5; // Default 5 mins fallback

  const totalDurationMs = completedEntries.reduce((acc, entry) => {
    return acc + (new Date(entry.servedAt) - new Date(entry.createdAt));
  }, 0);

  const avgMinutes = totalDurationMs / completedEntries.length / (1000 * 60);
  return Math.max(1, Math.round(avgMinutes));
}

// Helper: Check position changes & send SMS alerts
async function processQueueAlerts(shopId) {
  const waitingTokens = await QueueEntry.find({
    shopId,
    status: "waiting",
  }).sort({ createdAt: 1 });

  for (let index = 0; index < waitingTokens.length; index++) {
    const entry = waitingTokens[index];
    const position = index + 1;

    // Alert when 3rd in line
    if (position === 3 && !entry.notifiedPosition3) {
      if (entry.customerPhone) {
        await sendSMSNotification(
          entry.customerPhone,
          `Queueless Update: You are now #3 in line! Please prepare to head towards the counter.`,
        );
      }
      entry.notifiedPosition3 = true;
      await entry.save();
    }

    // Alert when 1st in line / next up
    if (position === 1 && !entry.notifiedTurn) {
      if (entry.customerPhone) {
        await sendSMSNotification(
          entry.customerPhone,
          `Queueless Update: You are next in line! Please step up to the counter.`,
        );
      }
      entry.notifiedTurn = true;
      await entry.save();
    }
  }
}

// GET: Get Token Status + Dynamic ETA
router.get("/status/:tokenId", async (req, res) => {
  try {
    const token = await QueueEntry.findById(req.params.tokenId);
    if (!token) return res.status(404).json({ message: "Token not found" });

    const aheadCount = await QueueEntry.countDocuments({
      shopId: token.shopId,
      status: "waiting",
      createdAt: { $lt: token.createdAt },
    });

    const avgServiceTime = await calculateAverageServiceTime(token.shopId);
    const estimatedWaitMinutes = aheadCount * avgServiceTime;

    res.json({
      token,
      aheadCount,
      avgServiceTime,
      estimatedWaitMinutes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Join Queue
router.post("/join", async (req, res) => {
  try {
    const { shopId, customerName, customerPhone } = req.body;

    const lastToken = await QueueEntry.findOne({ shopId }).sort({
      tokenNumber: -1,
    });
    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const newEntry = new QueueEntry({
      shopId,
      customerName,
      customerPhone,
      tokenNumber: nextTokenNumber,
    });

    await newEntry.save();
    await processQueueAlerts(shopId);

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Update Token Status (e.g. served, serving, cancelled)
router.patch("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === "served") {
      updateData.servedAt = new Date();
    }

    const updatedEntry = await QueueEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedEntry)
      return res.status(404).json({ message: "Entry not found" });

    // Recheck alerts for remaining customers
    await processQueueAlerts(updatedEntry.shopId);

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
