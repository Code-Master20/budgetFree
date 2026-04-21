const express = require("express");
const {
  requestReward,
  sendGiftCard,
} = require("../controllers/rewardController");

const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request", protect, requestReward);
router.patch("/send", protect, admin, sendGiftCard);

module.exports = router;
