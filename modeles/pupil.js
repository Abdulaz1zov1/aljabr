const {Schema, model} = require('mongoose')
const pupil = new Schema({
    userId: String,
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    group: {
        type:Schema.Types.ObjectId,
        ref:'Group'
    },
    address:String,
    month:Number,
    name: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
    },
    gender: {
        type: Number,
        default: 0,
    },
    pricetype: Number,
    price: Number,
    telegram: String,
})
module.exports = model('Pupil',pupil)