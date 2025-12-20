var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var ShipmentOrder = require('./models/OrdersShipment.js')
var TruckOrder = require('./models/OrdersTrucks.js')
var AcceptedOrder = require('./models/AcceptedOrders.js');
var ShipmentInfo = require('./models/ShipmentInfo.js')
var TrucksInfo  = require('./models/TrucksInfo.js')

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

app.post('/accept-order', async (req, res) => {
    try {
        const { sid, tid } = req.body;

        console.log(`Accepting Order: Shipment ${sid} <-> Truck ${tid}`);

        await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { status: "Assigned" } 
        );

        await TrucksInfo.findOneAndUpdate(
            { truckId: tid },
            { status: "In Use" }
        );

        await ShipmentOrder.findOneAndUpdate(
            { sid: sid, tid: tid },
            { status: "Accepted" }
        );

        await TruckOrder.findOneAndUpdate(
            { sid: sid, tid: tid },
            { status: "Assigned" }
        );

        const newAcceptedOrder = new AcceptedOrder({
            sid: sid,
            tid: tid,
            status: "Assigned" 
        });
        await newAcceptedOrder.save();

        const finalShipmentLog = new ShipmentOrder({
            sid: sid,
            tid: tid,
            status: "Assigned"
        });
        await finalShipmentLog.save();

        res.status(200).json({ message: "Order Accepted. Truck and Shipment assigned successfully." });

    } catch (err) {
        console.error("Error accepting order:", err);
        res.status(500).json({ error: "Failed to accept order" });
    }
});

app.post('/update-truck-status', async (req, res) => {
    try {
        const { sid, tid, status } = req.body;

        if (!sid || !tid || !status) {
            return res.status(400).json({ error: "Missing sid, tid, or status" });
        }

        const updateShipping = ShipmentOrder.findOneAndUpdate(
            { sid: sid },
            { status: status }
        );

        const updateTrucks = TruckOrder.findOneAndUpdate(
            { tid: tid },
            { status: status }
        );

        const updateAccepted = AcceptedOrder.findOneAndUpdate(
            { $or: [{ sid: sid }, { tid: tid }] },
            { status: status }
        );

        await Promise.all([updateShipping, updateTrucks, updateAccepted]);

        if (status === "Delivered") {
            await ShipmentInfo.findOneAndUpdate(
                { sid: sid },
                { status: "Delivered" }
            );

            await TruckInfo.findOneAndUpdate(
                {truckId : tid},
                {status : "Available"}
            )
        }

        console.log(`Status updated to ${status} for Shipment ${sid} / Truck ${tid}`);
        res.status(200).json({ message: `Status successfully updated to ${status}` });

    } catch (err) {
        console.error("Error updating multi-collection status:", err);
        res.status(500).json({ error: "Failed to update status across collections" });
    }
});

app.get('/order-shipping/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        const shipment = await ShipmentOrder.findOne({ sid: sid });

        if (!shipment) {
            return res.status(404).json({ error: "Shipment record not found" });
        }

        res.status(200).json(shipment);
    } catch (err) {
        res.status(500).json({ error: "Error fetching shipment data" });
    }
});

app.get('/order-trucks/:tid', async (req, res) => {
    try {
        const { tid } = req.params;
        const truckOrder = await TruckOrder.findOne({ tid: tid });

        if (!truckOrder) {
            return res.status(404).json({ error: "Truck assignment record not found" });
        }

        res.status(200).json(truckOrder);
    } catch (err) {
        res.status(500).json({ error: "Error fetching truck order data" });
    }
});

app.get('/accepted-order/shipment/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        const acceptedOrder = await AcceptedOrder.findOne({ sid: sid });

        if (!acceptedOrder) {
            return res.status(404).json({ error: "No accepted order found for this shipment" });
        }

        res.status(200).json(acceptedOrder);
    } catch (err) {
        res.status(500).json({ error: "Error fetching accepted order by SID" });
    }
});

app.get('/accepted-order/truck/:tid', async (req, res) => {
    try {
        const { tid } = req.params;
        const acceptedOrder = await AcceptedOrder.findOne({ tid: tid });

        if (!acceptedOrder) {
            return res.status(404).json({ error: "No accepted order found for this truck" });
        }

        res.status(200).json(acceptedOrder);
    } catch (err) {
        res.status(500).json({ error: "Error fetching accepted order by TID" });
    }
});