const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const morgan = require("morgan"); // Logging HTTP requests

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const reportsRoutes = require("./routes/reports");
const paymentsRoutes = require("./routes/payment");

// Konfigurasi dotenv
dotenv.config();

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk logging dan lainnya
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Koneksi MongoDB
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 50000 })
    .then(() => {
      console.log(`Connected to MongoDB at: ${process.env.MONGODB_URI}`);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      console.log("Retrying to connect in 10 seconds...");
      setTimeout(connectWithRetry, 10000);
    });
};

connectWithRetry();

// Route untuk root
app.get("/", (req, res) => {
  res.send("Welcome to the Manajemen Kos API!");
});

// Routes untuk aplikasi
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // Pastikan rute admin menggunakan base path /api/admin
app.use("/api/reports", reportsRoutes);
app.use("/api/payments", paymentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});