const {Schema, model} = require('mongoose')

const spending = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Worker'
    },
    summa: {
        type: Number,
        required: false
    },
    createdAt: Date,
    comment: {
        type: String,
        required: false
    },
    month: {
        type: Date,
        default: 1,
    },
})


module.exports = model('Spending',spending)