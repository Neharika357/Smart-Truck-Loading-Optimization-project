var express = require('express')
var TruckDealer = require('./models/TruckDealer.js')
var TrucksInfo = require('./models/TrucksInfo.js')
var WarehouseUser = require('./models/WarehouseUser.js')
var ShipmentInfo = require('./models/ShipmentInfo.js')
var ShipmentOrder = require('./models/OrdersShipment.js')
var TruckOrder = require('./models/OrdersTrucks.js')
var AcceptedOrder = require('./models/AcceptedOrders.js');
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

app.get('/truck-details/:tid', async (req, res) => {
    try {
        const truck = await TrucksInfo.findOne({ truckId: req.params.tid });
        if (!truck) return res.status(404).json({ error: "Truck not found" });
        res.status(200).json(truck);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.get('/shipment-details/:sid', async (req, res) => {
    try {
        const shipment = await ShipmentInfo.findOne({ sid: req.params.sid });
        if (!shipment) return res.status(404).json({ error: "Shipment not found" });
        res.status(200).json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

app.post('/decline-request', async (req, res) => {
    const { sid, tid } = req.body;
    try {
        await ShipmentOrder.deleteOne({ sid: sid, tid: tid });

        await TruckOrder.deleteOne({ sid: sid, tid: tid });

        await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { status: "Pending" }
        );

        res.status(200).json({ message: "Request declined and cleanup complete" });
    } catch (err) {
        console.error("Decline Error:", err);
        res.status(500).json({ error: "Failed to decline request" });
    }
});

app.post('/update-truck-status', async (req, res) => {
    try {
        const { sid, tid, status } = req.body;

        if (!sid || !tid || !status) {
            return res.status(400).json({ error: "Missing sid, tid, or status" });
        }

        const updateShipping = ShipmentOrder.findOneAndUpdate(
            { sid: sid, tid: tid },
            { status: status }
        );

        const updateTrucks = TruckOrder.findOneAndUpdate(
            { sid : sid, tid: tid },
            { status: status }
        );

        const updateAccepted = AcceptedOrder.findOneAndUpdate(
            { sid : sid, tid: tid },
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});