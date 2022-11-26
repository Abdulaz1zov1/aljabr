const {Schema, model} = require('mongoose')

const worker = new Schema({
    userId: String,
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
    gender: {
        type: Number,
        default: 0,
    },
    salary: {
        type: Number,
        default: 0,
    },
    telegram: String,
    
    history: [
        {
            type:{
                type:Number,
                default:0
            },
            date:Date,
            getsalary:Number,
            createdAt:Date,
        }
    ],
    status:{
        type:Number,
        default:0
    }
})


module.exports = model('Worker',worker)