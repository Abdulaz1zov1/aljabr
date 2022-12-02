const {Schema, model} = require('mongoose')

const group = new Schema({
    userId: String,
    filial: {
        type: Schema.Types.ObjectId,
        ref: 'Filial',
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        
    },
    typegroup: {
        type: Schema.Types.ObjectId,
        ref: 'TypeGroup',
        
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    maxpupils: {
        type: Number,
    },
    status: {
        type: Number,
        default: 1,
    },
    numberclass:Number,
    typeclass:String,
    price: Number,
    start: Date,
    pupils: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Pupil',
        }
    ],
})


module.exports = model('Group',group)