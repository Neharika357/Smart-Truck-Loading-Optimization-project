const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },

    companyName: String,

    // Warehouse
    managerName: String,
    location: String,

    // Dealer (SINGLE service area)
    contactNumber: String,
    serviceArea: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
