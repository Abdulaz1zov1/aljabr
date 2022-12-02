const {Schema, model} = require('mongoose')
const user = new Schema({
    login: {
        type: String,
        unique:true,
    },
    password: {
        type: String,
    },
    name:String,
    role: {
        type: String,
        
        // 0 -> superAdmin
        // 1 -> Boss
        // 2 -> Little Boss
        // 3 -> Capitan
        // 4 -> Sergant
        // 5 -> Soldier
    },
    createdAt: Date,
    loginAt:[Date],
    status: {
        type: Number,
        default: 1,
    },
})
module.exports = model('User',user)