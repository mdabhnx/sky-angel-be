require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const mongoURI = process.env.MONGO_DB_CONNECTION_URL;
mongoose
  .connect(mongoURI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    time: { type: Number, required: true },
    stars: { type: Number, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

app.use(cors());

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    timestamps: new Date(),
  });
});

app.post("/register", async (req, res) => {
  const { name, time, stars } = req.body;
  const user = new User({ name, time, stars });

  try {
    await user.save();
    const leaderboard = await User.find()
      .sort({ time: 1, stars: -1 })
      .select("id name time stars");
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
