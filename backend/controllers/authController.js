const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); 
const sendEmail = require("../utils/sendEmail");

/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "ALL FIELDS ARE REQUIRED" });
    }
    const usernameRegex = /^[a-z](?=.*[0-9._-])[a-z0-9._-]*$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          "USERNAME MUST START WITH LOWERCASE AND INCLUDE A NUMBER OR SYMBOL (._-)",
      });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "USER ALREADY EXIST" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPass,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "ALL FIELDS REQUIRED" });
    }
    const usernameRegex = /^[a-z](?=.*[0-9._-])[a-z0-9._-]*$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          "USERNAME MUST START WITH LOWERCASE AND INCLUDE A NUMBER OR SYMBOL (._-)",
      });
    }

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "INVALID CREDENTIALS" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate plain token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token in DB
    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 15*60*1000;
    await user.save();
    console.log("RESET LINK:", `http://localhost:3000/reset-password/${resetToken}`);

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset",
      `Click the link to reset your password:\n${resetUrl}`
    );

    res.json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Error sending email" });
  }
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
    resetToken: hashedToken,
    resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Token invalid or expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ 
        message: "Password reset successful" 
    });
  } catch (error) {
    console.error("RESET ERROR:", error);
    res.status(500).json({ 
        message: error.message 
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
