const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var orderTruckSchema = new Schema({
    tid:{type:String, required: true},
    sid:{type: String, required:true},
    status :{type: String, required:true},
}, {timestamps: true});

var orderTruck = mongoose.model('OrderTruck', orderTruckSchema);

module.exports = orderTruck;
