const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var acceptedOrderschema = new Schema({
    tid:{type:String, required: true},
    sid:{type: String, required:true},
    warehouse : {type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseUser', required: true},
    dealer: {type: mongoose.Schema.Types.ObjectId,
            ref: 'TruckDealer',
            required: true },
    status :{type: String, required:true},
}, {timestamps: true});

var acceptedOrder = mongoose.model('AcceptedOrder', acceptedOrderschema);

module.exports = acceptedOrder;
