const {Schema, model} = require('mongoose')

const test = new Schema({
    userId: String,
    question: {
        type: String,
        
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    correctanswer:String,
    answers : [],
    createdwho: {
        type: Schema.Types.ObjectId,
        ref: 'Worker'
    },
    data: Date,
    img: String,
    falseanswer1: String,
    falseanswer2: String,
    falseanswer3: String,
    status: {
        type: Number,
        defaul: 0,
    }
})


module.exports = model('Test',test)