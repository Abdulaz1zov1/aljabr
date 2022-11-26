const {Schema, model} = require('mongoose')

const typegroup = new Schema({
    userId: String,
    title: {
        type: String,
    },
    status: {
        type: Number,
        default: 1,
    },
})


module.exports = model('TypeGroup',typegroup)