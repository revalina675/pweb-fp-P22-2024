// backend/models/DamageReport.js
const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema({
  room_number: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    // Tambahan field username
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "proses", "selesai"],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DamageReport", damageReportSchema);
