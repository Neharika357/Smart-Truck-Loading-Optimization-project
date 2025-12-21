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

        const randomID = "T" + Math.floor(1000 + Math.random() * 9000);

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

app.get('/available-trucks', async (req, res) => {
    try {
        const trucks = await TrucksInfo.find({ status: "Available" });
        res.status(200).json(trucks);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.post('/create-shipment', async (req, res) => {
    try {
        const { weight, volume, origin, destination, deadline, username } = req.body;
        const user = await WarehouseUser.findOne({ username: username });
        
        if (!user) {
            return res.status(404).json({ error: "Warehouse User not found. Please login first." });
        }
        const randomID = "S" + Math.floor(1000 + Math.random() * 9000);

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

        const shipmentDoc = await ShipmentInfo.findOne({ sid: sid });
        const truckDoc = await TrucksInfo.findOne({ truckId: tid });

        if (!shipmentDoc || !truckDoc) {
            return res.status(404).json({ error: "Shipment or Truck not found" });
        }
        
        const newShipmentOrder = new ShipmentOrder({
            sid: sid,
            tid: tid,
            warehouse: shipmentDoc.warehouseUser,
            status: "Requested"
        });
        await newShipmentOrder.save();

        const newTruckOrder = new TruckOrder({
            sid: sid,
            tid: tid,
            dealer: truckDoc.dealerId,
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

        const shipmentDoc = await ShipmentInfo.findOne({ sid });
        const truckDoc = await TrucksInfo.findOne({ truckId: tid });

        if (!shipmentDoc || !truckDoc) {
            return res.status(404).json({ error: "Shipment or Truck not found" });
        }

        if (truckDoc.assignedShipment || truckDoc.status === "In Use") {
            return res.status(400).json({ error: "Truck is already assigned to another shipment." });
        }

        await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { 
                status: "Assigned",
                AssignedTruck: truckDoc.truckId 
            } 
        );

        await TrucksInfo.findOneAndUpdate(
            { truckId: tid },
            { 
                status: "In Use",
                assignedShipment: shipmentDoc.sid
            }
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
            warehouse: shipmentDoc.warehouseUser,
            dealer: truckDoc.dealerId,
            status: "Assigned" 
        });
        await newAcceptedOrder.save();

        res.status(200).json({ message: "Order Accepted and cross-references updated." });

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

        const updateShipping = ShipmentOrder.findOneAndUpdate({ sid, tid }, { status });
        const updateTrucks = TruckOrder.findOneAndUpdate({ sid, tid }, { status });
        const updateAccepted = AcceptedOrder.findOneAndUpdate({ sid, tid }, { status });

        await Promise.all([updateShipping, updateTrucks, updateAccepted]);

        if (status === "Delivered") {
            await ShipmentInfo.findOneAndUpdate(
                { sid: sid },
                { 
                    status: "Delivered"
                }
            );

            await TrucksInfo.findOneAndUpdate(
                { truckId: tid },
                { 
                    status: "Available",
                    assignedShipment: null 
                }
            );
        }

        console.log(`Lifecycle status: ${status} for S:${sid} | T:${tid}`);
        res.status(200).json({ message: `Status updated to ${status}. References cleared if delivered.` });

    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: "Failed to update status across collections" });
    }
});

app.get('/dealer-requests/:username', async (req, res) => {
    try {
        const user = await TruckDealer.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: "Dealer not found" });

        const orders = await TruckOrder.find({ dealer: user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: "Error fetching dealer orders" });
    }
});

app.get('/warehouse-orders/:username', async (req, res) => {
    try {
        const user = await WarehouseUser.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: "Warehouse user not found" });

        const orders = await ShipmentOrder.find({ warehouse: user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: "Error fetching warehouse orders" });
    }
});

app.get('/accepted-orders/:role/:username', async (req, res) => {
    try {
        const { role, username } = req.params;
        let query = {};

        if (role === 'dealer') {
            const user = await TruckDealer.findOne({ username });
            query = { dealer: user._id };
        } else {
            const user = await WarehouseUser.findOne({ username });
            query = { warehouse: user._id };
        }

        const orders = await AcceptedOrder.find(query).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: "Error fetching accepted orders" });
    }
});

app.delete('/delete-dealer-order-request', async (req, res) => {
    try {
        const { sid, tid } = req.body;

        if (!sid || !tid) {
            return res.status(400).json({ error: "Missing sid or tid for deletion" });
        }

        console.log(`🗑️ Deleting Request Tuples: S:${sid} | T:${tid}`);

        const deletionResult = await TruckOrder.deleteMany({ sid: sid, tid: tid });

        res.status(200).json({ 
            message: "Order tuples deleted successfully", 
            details: {
                truckOrdersDeleted: deletionResult.deletedCount,
            }
        });

    } catch (err) {
        console.error("Error deleting order tuples:", err);
        res.status(500).json({ error: "Failed to delete order records" });
    }
});

app.delete('/delete-warehouse-order-request', async (req, res) => {
    try {
        const { sid, tid } = req.body;

        if (!sid || !tid) {
            return res.status(400).json({ error: "Missing sid or tid for deletion" });
        }

        console.log(`🗑️ Deleting Request Tuples: S:${sid} | T:${tid}`);

        const deletionResult = await ShipmentOrder.deleteMany({ sid: sid, tid: tid });

        res.status(200).json({ 
            message: "Order tuples deleted successfully", 
            details: {
                truckOrdersDeleted: deletionResult.deletedCount,
            }
        });

    } catch (err) {
        console.error("Error deleting order tuples:", err);
        res.status(500).json({ error: "Failed to delete order records" });
    }
});

app.get('/truckdealer/:username', async(req, res) =>{
    try{
         const truckdealer = await TruckDealer.find({username: req.params.username});
         if (!truckdealer) return res.status(404).json({ error: "Truckdealer not found" });
         res.status(200).json(truckdealer);
    }catch (err) {
        res.status(500).json({ error: "Error fetching truckdealer details" });
    }
   
})

app.get('/user/:username', async(req, res) =>{
    try{
         const user = await WarehouseUser.find({username: req.params.username});
         if (!user) return res.status(404).json({ error: "Warehouse user not found" });
         res.status(200).json(user);
    }catch (err) {
        res.status(500).json({ error: "Error fetching Warehouse User details" });
    }
   
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});