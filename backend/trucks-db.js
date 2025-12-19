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
var url = "mongodb+srv://clpro_123:Pramodha123@cluster0.k9kjmxq.mongodb.net/";
mongoose.connect(url)
.then((res)=> console.log('Connected to db'))
.catch((err) => console.log(err));

app.post("/truck", async (req, res) => {
  try {
    const {truckId, dealerId, capacityWeight, capacityVolume, route, pricePerKm, status} = req.body;
    const newTruck = new Truck({ scantype, pid, status: "Uploaded", image, note});
    await newRecord.save();

    res.json({ message: "Record added successfully" });
  } catch (err) {
    console.error("Error in adding record :", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/record", async (req, res) => {
  try {
    const records = await Record.find();
    res.json(records);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});