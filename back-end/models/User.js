const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Skema User
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    email: { type: String, unique: true }, // Pastikan email tidak null
  });  

// Middleware untuk hash password sebelum menyimpan user
userSchema.pre("save", async function (next) {
  // Jika password tidak dimodifikasi, lewati proses hashing
  if (!this.isModified("password")) return next();

  // Hash password dengan bcrypt
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Fungsi untuk membandingkan password input dengan password di database
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Ekspor model User
module.exports = mongoose.model("User", userSchema);