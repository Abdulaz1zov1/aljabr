const {Schema, model} = require('mongoose')

const Journal = new Schema({
    group: {
        type:Schema.Types.ObjectId,
        ref:'Group'
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    subject: {
        type:Schema.Types.ObjectId,
        ref:'Subject'
    },
    marks:[{
        pupil: {
            type:Schema.Types.ObjectId,
            ref:'Pupil'
        },
        created:Date,
        mark: Number,
        hwmark: Number,
    }],
    average:Number,
    fquarter:Date,
    // squarter:Date,
    status: {
        type: Number,
        default: 1,
    },
})


module.exports = model('Journal',Journal)