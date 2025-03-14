const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const {
  validateSignUpData,
  validateLoginPassword,
  validatePasswordResetRequest,
  validateResetPassword,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;
    console.log("Password during sign-up:", password);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password, // Let the pre-save middleware handle hashing
    });
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    console.log("Generated token:", token);

    res.cookie("token", token);
    res.json({ message: "User added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginPassword(req);

    const { emailId, password } = req.body;
    console.log("Login attempt with email:", emailId);
    console.log("Password provided during login:", password);

    const user = await User.findOne({ emailId });
    if (!user) {
      console.log("User not found with email:", emailId);
      throw new Error("Invalid credentials!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials!");
    }

    const token = await user.getJWT();
    console.log("Generated token:", token);

    res.cookie("token", token);
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .send("Logout Successful!!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/password-reset/request", async (req, res) => {
  try {
    validatePasswordResetRequest(req);
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("User not found!");

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset token via email (example setup)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "your-email@gmail.com", pass: "your-email-password" },
    });

    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: user.emailId,
      subject: "Password Reset",
      text: `Here is your password reset link: http://yourapp.com/reset-password?token=${resetToken}`,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/password-reset/confirm", async (req, res) => {
  try {
    validateResetPassword(req);
    const { resetToken, newPassword } = req.body;

    const user = await User.findOne({
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user || !user.verifyResetToken(resetToken))
      throw new Error("Invalid or expired reset token!");

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = authRouter;
