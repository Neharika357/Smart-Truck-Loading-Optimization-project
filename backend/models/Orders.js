const mongoose = require('mongoose')

var Schema = mongoose.Schema;

var orderschema = new Schema({
    tid:{type:String, required: true},
    sid:{type: String, required:true},
    status :{type: String, required:true},
}, {timestamps: true});

var order = mongoose.model('Order', orderschema);

module.exports = order;
