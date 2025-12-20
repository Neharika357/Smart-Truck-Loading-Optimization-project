var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var Order = require('./models/Orders.js')
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

app.post('/accept-order', async (req, res) => {
    try {
        const { sid, tid } = req.body;

        await Order.findOneAndUpdate({ sid: sid }, { status: "Accepted" });

        const trackingEntry = new AcceptedOrder({
            sid: sid,
            tid: tid,
            status: "Assigned" 
        });
        await trackingEntry.save();

        await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { status: "Assigned" }
        );
        await TruckInfo.findOneAndUpdate(
            {truckId : tid},
            {status: "In use"}
        )
        res.status(200).json({ message: "Order Accepted & Tracking Started" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to accept order" });
    }
});

app.post('/update-tracking', async (req, res) => {
    try {
        const { sid, newStatus } = req.body; // newStatus could be "Picked", "In Transit", "Delivered"

        // 1. Update the Tracking Table
        await AcceptedOrder.findOneAndUpdate({ sid: sid }, { status: newStatus });

        // 2. Sync with Shipment Info (So Warehouse User sees it too)
        await ShipmentInfo.findOneAndUpdate({ sid: sid }, { status: newStatus });

        res.status(200).json({ message: "Tracking Updated" });

    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});