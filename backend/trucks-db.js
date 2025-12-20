var express = require('express')
var TruckDealer = require('./models/TruckDealer.js')
var TrucksInfo = require('./models/TrucksInfo.js')
const cors = require('cors');
const mongoose = require('mongoose');

var app = express();
app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true                 
}));
app.use(express.json());

var url = "mongodb+srv://clpro_123:Pramodha123@cluster0.k9kjmxq.mongodb.net/SmartTruckDB?retryWrites=true&w=majority";
mongoose.connect(url)
.then((res)=> console.log('Connected to db'))
.catch((err) => console.log(err));

app.post('/create-truck', async (req, res) => {
    try {
        const { weight, volume,type,  from, to, price, username } = req.body;
        const user = await TruckDealer.findOne({ username: username });
        
        if (!user) {
            return res.status(404).json({ error: "Warehouse User not found. Please login first." });
        }

        const randomID = "#T" + Math.floor(1000 + Math.random() * 9000);

        const newTruck = new TrucksInfo({
            truckId: randomID,
            dealerId: user._id,   
            capacityWeight: weight,
            capacityVolume: volume,
            truckType : type,
            route: {from: from, to: to},
            pricePerKm: price,
            status: "Available"           
        });

        await newTruck.save();
        console.log(`Truck ${randomID} created for ${user.username}`);
        res.status(200).json({ message: "Truck created successfully", TrucksInfo: newTruck });
    } catch (err) {
        console.error("Error creating Truck:", err);
        res.status(500).json({ error: "Failed to create Truck" });
    }
});

app.get('/truck', async (req, res) => {
    try {
        const { username } = req.query; 

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const user = await TruckDealer.findOne({ username: username });
      
        if (!user) {
            console.log("User not found, returning empty fleet");
            return res.status(200).json([]);
        }

        const trucks = await TrucksInfo.find({ dealerId: user._id }).sort({ createdAt: -1 });
        res.status(200).json(trucks);

    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: "Could not fetch trucks" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});