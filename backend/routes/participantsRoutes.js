const express = require("express");
const {
  getParticipantsOverview,
} = require("../controllers/participantsController");

const router = express.Router();

router.get("/", getParticipantsOverview);

module.exports = router;
