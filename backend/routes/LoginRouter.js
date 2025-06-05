const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Account = require("../db/accountModel");
const Users = require("../db/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundAccount = await Account.findOne({ username });
    if (!foundAccount || foundAccount.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const foundUser = await Users.findById(foundAccount.user_id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const payload = {
       id: foundUser._id,
      first_name: foundUser.first_name,
      last_name: foundUser.last_name,
      username: foundAccount.username,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, first_name, last_name } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const existingUser = await Account.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const newUser = new Users({
      first_name: first_name || username,
      last_name: last_name || "",
    });
    await newUser.save();

    const newAccount = new Account({
      username,
      password,
      user_id: newUser._id,
    });
    await newAccount.save();

    res.status(201).json({ message: "Account and User created successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
