const {Schema, model} = require('mongoose')

const spendingother = new Schema({
    summa: {
        type: Number,
        required: false
    },
    createdAt: Date,
    comment: {
        type: String,
        required: false
    },
    // month: {
    //     type: Date,
    //     default: 1,
    // },
})


module.exports = model('Spendingother',spendingother)