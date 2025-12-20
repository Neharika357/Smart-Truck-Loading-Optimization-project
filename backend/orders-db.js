var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var ShipmentOrder = require('./models/OrdersShipment.js')
var TruckOrder = require('./models/OrdersTrucks.js')
var AcceptedOrder = require('./models/AcceptedOrders.js');
var ShipmentInfo = require('./models/ShipmentInfo.js')
var TruckInfo  = require('./models/TrucksInfo.js')

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

app.post('/request-truck', async (req, res) => {
    try {
        const { sid, tid } = req.body;

        console.log(`Processing Booking: Shipment ${sid} -> Truck ${tid}`);

        
        const newShipmentOrder = new ShipmentOrder({
            sid: sid,
            tid: tid,
            status: "Requested"
        });
        await newShipmentOrder.save();

        const newTruckOrder = new TruckOrder({
            sid: sid,
            tid: tid,
            status: "Requested"
        });
        await newTruckOrder.save();

        await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { 
                status: "Requested"
            }
        );
        res.status(200).json({ message: "Booking Request Sent Successfully!" });

    } catch (err) {
        console.error("Error in request-truck:", err);
        res.status(500).json({ error: "Failed to process booking request" });
    }
});