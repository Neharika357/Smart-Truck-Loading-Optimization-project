var express = require('express')
var User = require('./models/User.js')
var Record = require('./models/Records.js')
const bcrypt = require("bcrypt");
const cors = require('cors');
const mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var multer = require('multer')

var app = express();
app.use(cors({
  origin: "http://localhost:3000",  
  credentials: true                 
}));
app.use(express.json());
var url = "mongodb+srv://clpro_123:Pramodha123@cluster0.k9kjmxq.mongodb.net/";
mongoose.connect(url)
.then((res)=> console.log('Connected to db'))
.catch((err) => console.log(err));
