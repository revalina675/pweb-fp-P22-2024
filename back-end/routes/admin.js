// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const Room = require("../models/Rooms");
const Payment = require("../models/Payment");
const User = require("../models/User"); // Impor User

// Route untuk mendapatkan data okupansi
router.get("/occupancy", auth, adminCheck, async (req, res) => {
  try {
    const rooms = await Room.find();
    const occupied = rooms.filter((room) => room.is_occupied).length;
    const empty = rooms.length - occupied;

    res.json({ empty, filled: occupied });
  } catch (error) {
    console.error("Error fetching occupancy:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/penghuni", auth, adminCheck, async (req, res) => {
  try {
    // Mengambil semua pengguna dengan role 'USER'
    const penghuniList = await User.find({ role: "USER" }).select(
      "username _id"
    ); // Sesuaikan field yang diperlukan
    res.json(penghuniList);
  } catch (error) {
    console.error("Error fetching penghuni list:", error);
    res.status(500).json({ message: "Error fetching penghuni list", error });
  }
});

// Route untuk mendapatkan detail penghuni
router.get("/penghuni/:id", auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const payment = await Payment.findOne({ user: req.params.id });

    res.json({
      username: user.username,
      payment: payment,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error });
  }
});

router.get("/payment-status", auth, adminCheck, async (req, res) => {
  try {
    const paymentStatusCounts = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Mengonversi hasil agregasi ke format yang lebih mudah digunakan di frontend
    const statusData = {
      PAID: 0,
      UNPAID: 0,
      OVERDUE: 0,
    };

    paymentStatusCounts.forEach((status) => {
      statusData[status._id] = status.count;
    });

    res.json(statusData);
  } catch (error) {
    console.error("Error fetching payment status counts:", error);
    res
      .status(500)
      .json({ message: "Error fetching payment status counts", error });
  }
});

router.delete("/penghuni/:id", auth, adminCheck, async (req, res) => {
  try {
    const userId = req.params.id;

    // Cari dan hapus pengguna
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hapus pembayaran terkait
    await Payment.findOneAndDelete({ user: userId });

    // **Tambahkan Kode Berikut: Memperbarui Status Kamar**
    const room = await Room.findOne({ current_occupant: userId });
    if (room) {
      room.is_occupied = false;
      room.current_occupant = null;
      await room.save();
    }

    res.json({ message: "Penghuni berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting penghuni:", error);
    res.status(500).json({ message: "Error deleting penghuni", error });
  }
});

module.exports = router;
