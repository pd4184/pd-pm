const mongoose = require('mongoose');
try{
//mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useCreateIndex: true});
//mongoose.connect('mongodb://pd4184:pd41849630@172.30.168.219:27017/sampledb', {useNewUrlParser: true, useCreateIndex: true});

mongoose.connect('mongodb+srv://pd4184:pd41849630@pandu-m7ddl.mongodb.net/pmdb',{useNewUrlParser: true, useCreateIndex: true});
}catch(e){
    console.error(e);
}
var conn = mongoose.Collection;
var passCatSchema = new mongoose.Schema({
    password_category: {
        type: String,
        required: true,
        inbox:{
            unique: true
        }
    },
    
    date: {
        type: Date,
        default: Date.now
    }
});

var passCatModel = mongoose.model('pass_cat_table', passCatSchema);
module.exports = passCatModel;