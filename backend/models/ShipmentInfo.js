const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var shipmentInfoschema = new Schema({
    sid:{type:String, required: true},
    weight:{type: Number, required:true},
    volume :{type: Number, required:true},
    origin :{type: String, required:true},
    destination :{type: String, required:true},
    deadline :{type: Date, required:true},
    warehouseUser :{type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseUser', required: true},
    AssignedTruck : {type: String},
    status :{type: String, required:true},
}, {timestamps: true});

var shipmentInfo = mongoose.model('ShipmentInfo', shipmentInfoschema);

module.exports = shipmentInfo;
