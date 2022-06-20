const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    sid : {
        type:String,
        required:true
    }
})

module.exports  = mongoose.model('admin', schema)