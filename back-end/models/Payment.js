const mongoose = require("mongoose");

const invoiceHistorySchema = new mongoose.Schema({
  bill: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_bill: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    enum: ["QRIS", "BANK_TRANSFER"],
    required: true,
  },
  rent_periods: {
    type: Number, // 3 atau 6 (bulan)
    required: true,
  },
  status: {
    // Status Pembayaran
    type: String,
    enum: ["PAID", "UNPAID", "OVERDUE"],
    default: "UNPAID",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
