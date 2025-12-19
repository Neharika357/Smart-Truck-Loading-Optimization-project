var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var WarehouseUser = require('./models/WarehouseUser.js');
var ShipmentInfo = require('./models/ShipmentInfo.js');

var app = express();

app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true                 
}));
app.use(express.json()); 

var url = "mongodb+srv://clpro_123:Pramodha123@cluster0.k9kjmxq.mongodb.net/SmartTruckDB?retryWrites=true&w=majority";

mongoose.connect(url)
  .then(() => console.log('✅ Connected to MongoDB (SmartTruckDB)'))
  .catch((err) => console.log('❌ DB Connection Error:', err));


app.post('/create-shipment', async (req, res) => {
    try {
        const { weight, volume, origin, destination, deadline, username } = req.body;
        const user = await WarehouseUser.findOne({ username: username });
        
        if (!user) {
            return res.status(404).json({ error: "Warehouse User not found. Please login first." });
        }
        const randomID = "#S" + Math.floor(1000 + Math.random() * 9000);

        const newShipment = new ShipmentInfo({
            sid: randomID,
            weight: weight,
            volume: volume,
            origin: origin,
            destination: destination,
            deadline: new Date(deadline),
            warehouseUser: user._id,      
            status: "Pending"            
        });

        await newShipment.save();
        
        console.log(`Shipment ${randomID} created for ${user.username}`);
        res.status(200).json({ message: "Shipment created successfully", shipment: newShipment });

    } catch (err) {
        console.error("Error creating shipment:", err);
        res.status(500).json({ error: "Failed to create shipment" });
    }
});

app.post('/get-shipments', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await WarehouseUser.findOne({ username: username });
        if (!user) return res.status(404).json({ error: "User not found" });
        const shipments = await ShipmentInfo.find({ warehouseUser: user._id }).sort({ createdAt: -1 });

        res.status(200).json(shipments);

    } catch (err) {
        res.status(500).json({ error: "Could not fetch shipments" });
    }
});

// ROUTE C: Create a Dummy Warehouse User (Run this once via Postman to test)
// You need at least one user in the DB to create shipments
// app.post('/register-warehouse-user', async (req, res) => {
//     try {
//         const { username, email } = req.body;
//         const newUser = new WarehouseUser({ username, email });
//         await newUser.save();
//         res.json({ message: "User created!", user: newUser });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});