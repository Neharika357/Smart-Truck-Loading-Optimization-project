const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  truckId: { // Matches 'Tid' in diagram
    type: String,
    required: true
  },
  dealerId: { // Matches 'TdealerUserName' (Linked to Dealer Model)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TruckDealer',
    required: true
  },
  capacityWeight: { // Matches 'Tweight'
    type: Number,
    required: true
  },
  capacityVolume: { // Matches 'Tvolume'
    type: Number,
    required: true
  },
  truckType :{
    type: String,
    required: true
  },
  route: { // Matches 'route'
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  pricePerKm: { // Matches 'price per km'
    type: Number,
    required: true
  },
  assignedShipment: {
    type: String
  },
  status: { // Matches 'status'
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Truck', truckSchema);