const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, ".env") });

// MongoDB Connection Config
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/super_kos";
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Price constants
const PRICES = {
  ROOM: {
    THREE_MONTHS: 6000000,
    SIX_MONTHS: 12000000,
  },
  LAUNDRY: {
    THREE_MONTHS: 600000,
    SIX_MONTHS: 1200000,
  },
  CLEANING: {
    THREE_MONTHS: 300000,
    SIX_MONTHS: 600000,
  },
  CATERING: {
    THREE_MONTHS: 3000000,
    SIX_MONTHS: 6000000,
  },
};

// Define Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
});

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  is_occupied: { type: Boolean, default: false },
  current_occupant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_bill: { type: Number, required: true },
  payment_method: {
    type: String,
    enum: ["QRIS", "BANK_TRANSFER"],
    required: true,
  },
  rent_periods: { type: Number, enum: [3, 6], required: true },
  services: [
    {
      type: String,
      enum: ["LAUNDRY", "CLEANING", "CATERING"],
    },
  ],
  status: {
    type: String,
    enum: ["UNPAID", "PAID", "OVERDUE"],
    default: "UNPAID",
  },
});

const damageReportSchema = new mongoose.Schema({
  room_number: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "proses", "selesai"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});

const userReportSchema = new mongoose.Schema({
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model("User", userSchema);
const Room = mongoose.model("Room", roomSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const DamageReport = mongoose.model("DamageReport", damageReportSchema);
const UserReport = mongoose.model("UserReport", userReportSchema);

// Helper function to calculate total bill
const calculateTotalBill = (months, services = []) => {
  const basePrice =
    months === 3 ? PRICES.ROOM.THREE_MONTHS : PRICES.ROOM.SIX_MONTHS;
  return services.reduce((total, service) => {
    return (
      total + PRICES[service][months === 3 ? "THREE_MONTHS" : "SIX_MONTHS"]
    );
  }, basePrice);
};

// Seed function
const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Payment.deleteMany({}),
      DamageReport.deleteMany({}),
      UserReport.deleteMany({}),
    ]);
    console.log("Existing data cleared");

    // Create admin user
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("adminpass", 10);
    const admin = await User.create({
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    });
    console.log("Admin created");

    // Create regular users
    console.log("Creating regular users...");
    const regularUsers = await Promise.all([
      User.create({
        username: "john_doe",
        password: hashedPassword,
        role: "USER",
      }),
      User.create({
        username: "jane_doe",
        password: hashedPassword,
        role: "USER",
      }),
    ]);
    console.log("Regular users created");

    // Create rooms
    console.log("Creating rooms...");
    const rooms = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Room.create({
          number: `${i + 1}`,
          is_occupied: i < 2,
          current_occupant: i < 2 ? regularUsers[i]._id : null,
        })
      )
    );
    console.log("Rooms created");

    // Create payments
    console.log("Creating payments...");
    await Promise.all([
      Payment.create({
        user: regularUsers[0]._id,
        total_bill: calculateTotalBill(3, ["LAUNDRY", "CATERING"]),
        payment_method: "QRIS",
        rent_periods: 3,
        services: ["LAUNDRY", "CATERING"],
        status: "PAID",
      }),
      Payment.create({
        user: regularUsers[1]._id,
        total_bill: calculateTotalBill(6, ["LAUNDRY", "CLEANING", "CATERING"]),
        payment_method: "BANK_TRANSFER",
        rent_periods: 6,
        services: ["LAUNDRY", "CLEANING", "CATERING"],
        status: "UNPAID",
      }),
    ]);
    console.log("Payments created");

    // Create damage reports
    console.log("Creating damage reports...");
    await Promise.all([
      DamageReport.create({
        room_number: "1",
        user: regularUsers[0]._id,
        message: "AC tidak dingin",
        status: "pending",
        created_at: new Date(),
      }),
      DamageReport.create({
        room_number: "1",
        user: regularUsers[0]._id,
        message: "Keran air bocor",
        status: "proses",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }),
      DamageReport.create({
        room_number: "2",
        user: regularUsers[1]._id,
        message: "Lampu kamar mati",
        status: "selesai",
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
      }),
      DamageReport.create({
        room_number: "2",
        user: regularUsers[1]._id,
        message: "Kunci pintu rusak",
        status: "pending",
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000),
      }),
    ]);
    console.log("Damage reports created");

    // Create user reports
    console.log("Creating user reports...");
    await Promise.all([
      UserReport.create({
        message: "Mohon tambah tempat parkir",
        created_at: new Date(),
      }),
      UserReport.create({
        message: "Wifi sering lambat di malam hari",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }),
      UserReport.create({
        message: "Perlu tambahan tempat sampah di koridor",
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
      }),
    ]);
    console.log("User reports created");

    console.log("All data seeded successfully");
    console.log("\nLogin credentials:");
    console.log("Admin - username: admin, password: adminpass");
    console.log("User1 - username: john_doe, password: adminpass");
    console.log("User2 - username: jane_doe, password: adminpass");
  } catch (error) {
    console.error("Error seeding data:", error);
    if (error.name === "MongoNetworkError") {
      console.log(
        "Please check your MongoDB connection and make sure MongoDB is running"
      );
    }
  } finally {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

// Run the seed function
seedData();
