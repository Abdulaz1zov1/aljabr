const {Schema, model} = require('mongoose')

const Subject = new Schema({
    title: {
        type: String,
        required: true
    },
    course: {
        type:Schema.Types.ObjectId,
        ref:'Course'
    },
    status: {
        type: Number,
        default: 1,
    },
})


module.exports = model('Subject',Subject)