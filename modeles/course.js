const {Schema, model} = require('mongoose')

const course = new Schema({
    userId: String,
    title: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1,
    },
    
})


module.exports = model('Course',course)