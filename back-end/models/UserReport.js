// backend/models/UserReport.js
const mongoose = require("mongoose");

const userReportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserReport", userReportSchema);
