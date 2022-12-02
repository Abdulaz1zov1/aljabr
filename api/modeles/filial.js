const {Schema, model} = require('mongoose')

const filial = new Schema({
    userId: String,
    province: {
        type: String,
        required: true
    },
    adress: {
        type:String,
        required: true
    },
    title: {
        type:String,
        required: true
    },
    status: {
        type: Number,
        default: 1,
    },

})


module.exports = model('Filial',filial)