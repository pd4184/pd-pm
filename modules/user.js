const mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useCreateIndex: true});
mongoose.connect('mongodb://pd4184:Pd41849630#@172.30.168.219:27017/pmdb', {useNewUrlParser: true, useCreateIndex: true});
var conn = mongoose.Collection;
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        inbox:{
            unique: true
        }
    },
    email: {
        type: String,
        required: true,
        inbox:{
            unique: true
        }
    },
    password: {
        type: String,
        required: true
       
    },
    date: {
        type: Date,
        default: Date.now
    }
});

var userModel = mongoose.model('users', userSchema);
module.exports = userModel;