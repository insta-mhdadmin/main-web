const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    pass : {
        type:String,
        required:true
    }
})

module.exports  = mongoose.model('config', schema)