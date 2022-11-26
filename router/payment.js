const {Router} = require('express')
const router = Router()
const Group = require('../modeles/group')
const Payment = require('../modeles/payment')
const Pupil = require('../modeles/pupil')
const Filial = require('../modeles/filial')
const auth = require('../middleware/auth')
const { route } = require('./page')
let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
let pricetype = [
    {title:'годовой',rate:1},
    {title:'полгодовой',rate:2},
    {title:'ежемесячные',rate:10},
    {title:'кварталный',rate:5}
]

router.get('/',auth,async(req,res)=>{
    let currentMonth = req.query.month || new Date().getMonth()
    let filtersumma = req.query.filtersumma || -1
    let currentYear = new Date().getFullYear()
    let filial = await Filial.find().where({'status':1}).lean()
    let payment = await Payment.find().sort({_id:-1}).populate('pupil').populate('group').populate('filial').lean()



    if (payment) {
        if (filtersumma == -1) {

            payment = payment.map((pay, index) => {
                pay.allsumma = 0
                pay.summaEnd = 0
                pay.index = index + 1

                // pay.historysumma = pay.historysumma.filter(item => {
                //
                //     let itemDate = new Date(item.data)
                //     if (itemDate.getMonth() == currentMonth && itemDate.getFullYear() == currentYear) {
                //         pay.allsumma += item.summa
                //         return item
                //     }
                //
                // })
                pay.historysumma = pay.historysumma.forEach(item => {
                    pay.allsumma += item.summa
                })

                if (pay.group) {
                    if (pay.pupil){
                        pay.summaEnd = pay.pupil.price - pay.allsumma
                    }

                } else {
                    pay.summaEnd = 0
                }

                return pay

                // pay.summaEnd = pay.summaEnd.toLocaleString("en-GB")
                // pay.group.price = pay.group.price.toLocaleString("en-GB")
                // pay.allsumma = pay.allsumma.toLocaleString("en-GB")
                // pay.summa = pay.summa.toLocaleString()
            })
        }
        else {
            payment = payment.map((pay, index) => {
                pay.allsumma = 0
                pay.summaEnd = 0
                pay.index = index + 1

                pay.historysumma = pay.historysumma.filter(item => {

                    let itemDate = new Date(item.data)
                    if (itemDate.getMonth() == currentMonth && itemDate.getFullYear() == currentYear) {
                        pay.allsumma += item.summa
                        return item
                    }

                })

                if (pay.group) {
                    pay.summaEnd = pay.pupil.price - pay.allsumma
                } else {
                    pay.summaEnd = 0
                }


                if (filtersumma <= pay.allsumma / pay.pupil.price) {
                    return pay
                } else {
                    return
                }

                // pay.summaEnd = pay.summaEnd.toLocaleString("en-GB")
                // pay.group.price = pay.group.price.toLocaleString("en-GB")
                // pay.allsumma = pay.allsumma.toLocaleString("en-GB")
                // pay.summa = pay.summa.toLocaleString()
            })
        }
    }


    let monthRes = months[currentMonth]
    res.render('payment/index',{
        title: 'Все оплаты',
        isPayment:true,
        filial,
        payment,
        monthRes,
        error: req.flash('error'),
        
        success: req.flash('success')
    })
})

router.get('/excellcheck/:id/:summa',auth,async(req,res)=>{
    const _id = req.params.id 
    let summa = req.params.summa
    let data = new Date()
    // console.log("sana",new Date())
    const payment = await Payment.findOne({_id}).populate('pupil').populate('group').lean()
    data = data.toLocaleString("en-GB")
    res.render('payment/excellcheck',{
        title: 'Туланганлиги хакида чек',
        isPayment:true,
        payment,
        summa,
        data,
        error: req.flash('error'),
        success: req.flash('success')
    })
})

router.post('/',auth,async(req,res)=>{
    let {filial,pupil,data,summa,group,typepayment,comment} = req.body
    let checkPayment = await Payment.findOne({pupil,group})
    // console.log(data)
    if (checkPayment){
        data = data || Date.now()
        
        checkPayment.historysumma.push({summa,data,typepayment,comment})
        checkPayment.allsumma += parseInt(summa)
        await Payment.findByIdAndUpdate(checkPayment._id,checkPayment)
        req.flash('success','Добавлено')
        res.redirect(`/payment/excellcheck/${checkPayment._id}/${summa}`)
    } else {
        data = data || Date.now()
        let allsumma = 0
        allsumma += summa
        allsumma = parseInt(allsumma)
        let userId = req.session.user._id
        const payment = await new Payment({userId:userId,filial,pupil,group,allsumma})
        payment.historysumma.push({summa,data,typepayment,comment})
            await payment.save()
            req.flash('success','Добавлено')
            res.redirect(`/payment/excellcheck/${payment._id}/${summa}`)
    }
    // let createdAt = Date.now()
    // let userId = req.session.user._id
    // const payment = await new Payment({userId:userId,pupil,summa,group,createdAt})
        // await payment.save()
        
})

router.get('/pay/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    const payment = await Payment.findOne({_id}).populate('pupil').populate('group').populate('filial').lean()
    payment.historysumma = payment.historysumma.map((pay, index) => {
        pay.index = index + 1
        pay.summa = pay.summa.toLocaleString('fr')
        let date  = new Date(pay.data)
        pay.data = `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()} г`
        return pay
    })
    payment.pupil.mustprice = Math.round(payment.pupil.price / pricetype[payment.pupil.pricetype].rate)
    payment.pupil.pricetype = pricetype[payment.pupil.pricetype].title
    payment.historysumma = payment.historysumma.reverse()
    res.render('payment/pay',{
        isPayment:true,
        payment,id:payment._id,
        error: req.flash('error'),
        success: req.flash('success')
    })
})



router.get('/paydelete/:id/:index',auth,async (req,res)=>{
    let _id = req.params.id
    let index = req.params.index

    let payment = await Payment.findOne({_id}).lean()
    let pupil = payment.pupil
    payment.historysumma.splice(index,1)
    await Payment.findByIdAndUpdate(_id,payment)
    res.redirect(`/pupils/more/${pupil}`)
})

// router.get('/delete/:id',auth,async(req,res)=>{
//     await Payment.findByIdAndDelete(req.params.id)
//     req.flash('success','Удалено!')
//     res.redirect('/payment')
// })

// router.post('/save',auth,async(req,res)=>{
//     let {_id,filial,pupil,summa,group} = req.body
//     let createdAt = Date.now()
//     await Payment.findByIdAndUpdate(_id,{pupil,filial,summa,group,createdAt})
//
//     req.flash('success','Сохранено')
//     res.redirect('/payment')
//
// })

module.exports = router