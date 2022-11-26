const {Schema, model} = require('mongoose')

const payment = new Schema({
    userId: String,
    filial: {
        type: Schema.Types.ObjectId,
        ref: 'Filial'
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    pupil: {
        type: Schema.Types.ObjectId,
        ref: 'Pupil'
    },
    summaEnd: Number,
    allsumma: Number,
    historysumma: [
        {
            summa: Number,
            data: Date,
            typepayment:String,
            comment:String,
        }
        
    ]
})


module.exports = model('Payment',payment)