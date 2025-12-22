require('dotenv').config();
var express = require('express')
var TruckDealer = require('./models/TruckDealer.js')
var TrucksInfo = require('./models/TrucksInfo.js')
var WarehouseUser = require('./models/WarehouseUser.js')
var ShipmentInfo = require('./models/ShipmentInfo.js')
var User = require('./models/User.js')
var ShipmentOrder = require('./models/OrdersShipment.js')
var TruckOrder = require('./models/OrdersTrucks.js')
var AcceptedOrder = require('./models/AcceptedOrders.js');
const cors = require('cors');
const mongoose = require('mongoose');

var app = express();
app.use(cors);
app.use(express.json());

var url = process.env.MONGO_URI;
mongoose.connect(url)
.then((res)=> console.log('Connected to db'))
.catch((err) => console.log(err));

app.post('/api/auth/register', async(req, res) =>{
     try {
        const {
          fullName,
          email,
          password,
          role,
          companyName,
          managerName,
          location,
          contactNumber,
          serviceArea,
        } = req.body;
    
        if (!fullName || !email || !password || !role) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
    
        const userData = {
          fullName,
          email,
          password, 
          role,
          companyName,
        };
    
        if (role === 'warehouse') {
          if (!managerName || !location) {
            return res.status(400).json({ message: 'Missing warehouse details' });
          }
    
          const warehouseEntry = new WarehouseUser({
                username: fullName,
                email: email
            });
          await warehouseEntry.save();
          
          userData.managerName = managerName;
          userData.location = location;
        }
    
        if (role === 'dealer') {
          if (!contactNumber || !serviceArea) {
            return res.status(400).json({ message: 'Missing dealer details' });
          }
    
          const dealerEntry = new TruckDealer({
                username: fullName, 
                email: email
            });
           await dealerEntry.save();
    
          userData.contactNumber = contactNumber;
          userData.serviceAreas = [serviceArea];
        }
    
        const newUser = new User(userData);
        const savedUser = await newUser.save();
    
        res.status(201).json({
          message: 'User created successfully',
          token: 'fake-jwt-token-' + savedUser._id,
          role: savedUser.role,
          user: {
            id: savedUser._id,
            email: savedUser.email,
          },
        });
    
      } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
      }
});

app.post('/api/auth/login', async(req, res) =>{
     try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        if (user.password !== password) {
          return res.status(400).json({ message: 'Wrong password' });
        }
    
        res.status(200).json({
          message: 'Login successful',
          token: 'fake-jwt-token-' + user._id,
          role: user.role,
          user: {
            id: user._id,
            fullName: user.fullName,
          },
        });
    
      } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
      }
})

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

        const newOrder = new ShipmentOrder({
            sid:sid,
            tid:tid,
            warehouse: shipmentDoc.warehouseUser,
            status:"Assigned"
        });
        await newOrder.save();

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

app.delete('/delete-warehouse-order-request', async (req, res) => {
    try {
        const { sid, tid, status } = req.body; 

        if (!sid || !tid || !status) {
            return res.status(400).json({ error: "Missing sid, tid, or status for deletion" });
        }

        console.log(`🗑️ Clearing Warehouse Record: S:${sid} | T:${tid} with Status: ${status}`);

        const deletionResult = await ShipmentOrder.deleteOne({ 
            sid: sid, 
            tid: tid, 
            status: status 
        });

        res.status(200).json({ 
            message: "Record cleared successfully", 
            deletedCount: deletionResult.deletedCount
        });

    } catch (err) {
        console.error("Error deleting warehouse record:", err);
        res.status(500).json({ error: "Failed to delete order record" });
    }
});

app.delete('/delete-dealer-order-request', async (req, res) => {
    try {
        const { sid, tid, status } = req.body; 

        if (!sid || !tid || !status) {
            return res.status(400).json({ error: "Missing sid, tid, or status for deletion" });
        }

        console.log(`🗑️ Clearing Dealer Record: S:${sid} | T:${tid} with Status: ${status}`);

        const deletionResult = await TruckOrder.deleteOne({ 
            sid: sid, 
            tid: tid, 
            status: status 
        });

        res.status(200).json({ 
            message: "Record cleared successfully", 
            deletedCount: deletionResult.deletedCount
        });

    } catch (err) {
        console.error("Error deleting dealer record:", err);
        res.status(500).json({ error: "Failed to delete order record" });
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

app.put('/update-shipment/:sid', async (req, res) => {
    try {
        const { sid } = req.params;
        const updateData = req.body;

        delete updateData.sid; 
        delete updateData._id;
        delete updateData.warehouseUser;

        if (updateData.deadline) {
            updateData.deadline = new Date(updateData.deadline);
        }

        const updatedShipment = await ShipmentInfo.findOneAndUpdate(
            { sid: sid },
            { $set: updateData },
            { new: true } 
        );

        if (!updatedShipment) {
            return res.status(404).json({ error: "Shipment not found" });
        }

        console.log(`Shipment ${sid} updated`);
        res.status(200).json({ message: "Shipment updated successfully", shipment: updatedShipment });
    } catch (err) {
        console.error("Error updating shipment:", err);
        res.status(500).json({ error: "Failed to update shipment" });
    }
});

app.delete('/delete-shipment/:sid', async (req, res) => {
    try {
        const { sid } = req.params;

        const deletedShipment = await ShipmentInfo.findOneAndDelete({ sid: sid });

        if (!deletedShipment) {
            return res.status(404).json({ error: "Shipment not found" });
        }

        await ShipmentOrder.deleteMany({ sid: sid });
        await TruckOrder.deleteMany({ sid: sid });
        await AcceptedOrder.deleteMany({ sid: sid });

        console.log(`Shipment ${sid} and all related records deleted`);
        res.status(200).json({ message: "Shipment deleted successfully" });
    } catch (err) {
        console.error("Error deleting shipment:", err);
        res.status(500).json({ error: "Failed to delete shipment" });
    }
});

app.put('/update-truck/:truckId', async (req, res) => {
    try {
        const { truckId } = req.params;
        const updateData = req.body;

        delete updateData.truckId;
        delete updateData._id;
        delete updateData.dealerId;

        const updatedTruck = await TrucksInfo.findOneAndUpdate(
            { truckId: truckId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedTruck) {
            return res.status(404).json({ error: "Truck not found" });
        }

        console.log(`Truck ${truckId} updated`);
        res.status(200).json({ message: "Truck updated successfully", truck: updatedTruck });
    } catch (err) {
        console.error("Error updating truck:", err);
        res.status(500).json({ error: "Failed to update truck" });
    }
});

app.delete('/delete-truck/:truckId', async (req, res) => {
    try {
        const { truckId } = req.params;

        const deletedTruck = await TrucksInfo.findOneAndDelete({ truckId: truckId });

        if (!deletedTruck) {
            return res.status(404).json({ error: "Truck not found" });
        }

        await TruckOrder.deleteMany({ tid: truckId });
        await AcceptedOrder.deleteMany({ tid: truckId });
        await ShipmentOrder.deleteMany({ tid: truckId });

        console.log(`Truck ${truckId} and all related records deleted`);
        res.status(200).json({ message: "Truck deleted successfully" });
    } catch (err) {
        console.error("Error deleting truck:", err);
        res.status(500).json({ error: "Failed to delete truck" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});