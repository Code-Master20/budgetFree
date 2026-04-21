const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

//====================================Routes=================================
//imported here
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const pointsRoutes = require("./routes/pointsRoutes");
//used here
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/points", pointsRoutes);

// ✅ Root route LAST
app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
