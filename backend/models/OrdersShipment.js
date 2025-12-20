const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var orderShipmentschema = new Schema({
    tid:{type:String, required: true},
    sid:{type: String, required:true},
    status :{type: String, required:true},
}, {timestamps: true});

var orderShipment = mongoose.model('OrderShipment', orderShipmentschema);

module.exports = orderShipment;
