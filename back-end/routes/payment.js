const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const Payment = require("../models/Payment");

router.get("/:userId", auth, adminCheck, async (req, res) => {
  try {
    const payment = await Payment.findOne({ user: req.params.userId })
      .populate("user", "username")
      .sort({ created_at: -1 });

    if (!payment) {
      return res.status(404).json({ message: "Payment details not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details", error });
  }
});

router.post("/", auth, adminCheck, async (req, res) => {
  try {
    const payment = new Payment({
      user: req.body.userId,
      total_bill: req.body.total_bill,
      payment_method: req.body.payment_method,
      rent_periods: req.body.rent_periods,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
