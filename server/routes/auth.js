const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password, instrument, isOnlyVocal } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      passwordHash: hash,
      instrument: instrument || "vocals",
      isOnlyVocal: Boolean(isOnlyVocal),
      isAdmin: false,
    });
    await newUser.save();
    res.json({ message: "Signup successful" });
  } 
  catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin Signup
router.post("/admin-signup", async (req, res) =>{
    try{
        const {username, password, instrument, isOnlyVocal} = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Missing username or password"});
        }
        const existingUser = await User.findOne({username});
        if (existingUser){
            return res.status(400).json({ error: "Username already exists"});
        }
        const hash  = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            passwordHash: hash,
            instrument: instrument || "vocals",
            isOnlyVocal: Boolean(isOnlyVocal),
            isAdmin: true
        });

        await newUser.save();
        res.json({ message: "Admin signup successful"})
    }
    catch (err) {
        console.error("Admin signup error", err);
        res.status(500).json({ error: "server error" });
    }
});

// Combined admin and user Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        instrument: user.instrument,
        isOnlyVocal: user.isOnlyVocal,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "6h" }
    );

    res.json({ token });
  }
  catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
