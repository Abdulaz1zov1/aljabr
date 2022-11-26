const {Schema, model} = require('mongoose')

const adminCenter = new Schema({
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    name: {
        type: String,
        
    },
    phone: {
        type: String,
        
    },
})


module.exports = model('AdminCenter',adminCenter)