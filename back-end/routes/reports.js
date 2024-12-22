// backend/routes/reports.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const DamageReport = require("../models/DamageReport");
const User = require("../models/User"); // Pastikan User diimpor jika diperlukan
const UserReport = require("../models/UserReport");

// Get all facility reports
router.get("/facility", auth, adminCheck, async (req, res) => {
  try {
    const reports = await DamageReport.find()
      .populate("user", "username")
      .sort({ created_at: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching facility reports", error });
  }
});

// Remove Route Duplikat Berikut Ini:
/*
// Create new facility report
router.get('/facility', auth, adminCheck, async (req, res) => {
  try {
    // Mengambil semua laporan dan mempopulasi field 'user'
    const reports = await Report.find()
      .populate('user', 'username') // Memasukkan field 'username' dari user
      .exec();
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching facility reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
*/

// Pastikan hanya ada satu route GET /facility

// Create new facility report
router.post("/facility", auth, async (req, res) => {
  try {
    const { room_number, message } = req.body;
    const userId = req.userData.userId;

    // Cari pengguna yang membuat laporan
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buat laporan kerusakan dengan menyertakan username
    const newReport = new DamageReport({
      room_number,
      user: userId,
      username: user.username, // Simpan username
      message,
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error creating facility report:", error);
    res.status(500).json({ message: "Error creating facility report", error });
  }
});

// Update facility report status
router.patch("/facility/:id", auth, adminCheck, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await DamageReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "username");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error });
  }
});

// Get all user reports
router.get("/user", auth, adminCheck, async (req, res) => {
  try {
    const reports = await UserReport.find().sort({ created_at: -1 });
    res.json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Error fetching user reports", error });
  }
});

// Create new user report (anonymous)
router.post("/user", auth, async (req, res) => {
  try {
    const { message } = req.body;
    const report = new UserReport({
      message,
      created_at: new Date(),
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error creating user report", error });
  }
});

module.exports = router;
