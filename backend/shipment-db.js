var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');

// --- 1. IMPORT YOUR MODELS ---
// Make sure these paths match where you saved the model files
var WarehouseUser = require('./models/WarehouseUser.js');
var ShipmentInfo = require('./models/ShipmentInfo.js');

var app = express();

// --- 2. MIDDLEWARE ---
app.use(cors({
  origin: "http://localhost:3000",  // Allow requests from your React Frontend
  credentials: true                 
}));
app.use(express.json()); // Parses JSON data sent from frontend

// --- 3. DATABASE CONNECTION ---
// Your MongoDB Connection String
var url = "mongodb+srv://clpro_123:Pramodha123@cluster0.k9kjmxq.mongodb.net/SmartTruckDB?retryWrites=true&w=majority";

mongoose.connect(url)
  .then(() => console.log('✅ Connected to MongoDB (SmartTruckDB)'))
  .catch((err) => console.log('❌ DB Connection Error:', err));


// --- 4. API ROUTES ---

// ROUTE A: Create a New Shipment
// This is called when you click "Add Shipment" on the frontend
app.post('/create-shipment', async (req, res) => {
    try {
        const { weight, volume, origin, destination, deadline, email } = req.body;

        // Step 1: Find the Warehouse User who is creating this shipment
        // (We need their _id to link in the database)
        const user = await WarehouseUser.findOne({ email: email });
        
        if (!user) {
            return res.status(404).json({ error: "Warehouse User not found. Please login first." });
        }

        // Step 2: Generate a random Shipment ID (e.g., #S1234)
        const randomID = "#S" + Math.floor(1000 + Math.random() * 9000);

        // Step 3: Create the Shipment Object
        const newShipment = new ShipmentInfo({
            sid: randomID,
            weight: weight,
            volume: volume,
            origin: origin,
            destination: destination,
            deadline: new Date(deadline), // Ensure date format
            warehouseUser: user._id,      // Link to the user's ID
            status: "Pending"             // Default status
        });

        // Step 4: Save to Database
        await newShipment.save();
        
        console.log(`Shipment ${randomID} created for ${user.username}`);
        res.status(200).json({ message: "Shipment created successfully", shipment: newShipment });

    } catch (err) {
        console.error("Error creating shipment:", err);
        res.status(500).json({ error: "Failed to create shipment" });
    }
});


// ROUTE B: Get All Shipments for a Specific User
// This is used to display the "Active Shipments" list on the dashboard
app.post('/get-shipments', async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Find user
        const user = await WarehouseUser.findOne({ email: email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 2. Find all shipments linked to this user's ID
        const shipments = await ShipmentInfo.find({ warehouseUser: user._id }).sort({ createdAt: -1 });

        res.status(200).json(shipments);

    } catch (err) {
        res.status(500).json({ error: "Could not fetch shipments" });
    }
});


// ROUTE C: Create a Dummy Warehouse User (Run this once via Postman to test)
// You need at least one user in the DB to create shipments
app.post('/register-warehouse-user', async (req, res) => {
    try {
        const { username, email } = req.body;
        const newUser = new WarehouseUser({ username, email });
        await newUser.save();
        res.json({ message: "User created!", user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. START SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});