const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  is_occupied: { type: Boolean, default: false },
  current_occupant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Room", roomSchema);
