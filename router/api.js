const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const AdminCenter = require('../modeles/adminCenter')
const Filial = require('../modeles/filial')
const Course = require('../modeles/course')
const Workers = require('../modeles/workers')
const Group = require('../modeles/group')
const Typegroup = require('../modeles/typegroup')
const Pupil = require('../modeles/pupil')
const Spendingother = require('../modeles/spendingother')
const Spending = require('../modeles/spending')
const Payment = require('../modeles/payment')
const User = require('../modeles/user')
const Test = require('../modeles/test')



// ADMINCENTER

//admincenter edit
router.get('/admincenter/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let adminCenter = await AdminCenter.findOne({_id}).populate('user').lean()
    res.send(adminCenter)
})



// FILIAL

//for filial edit
router.get('/filial/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let filial = await Filial.findOne({_id}).lean()
    res.send(filial)
})


// COURSE

//for course edit
router.get('/course/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let course = await Course.findOne({_id}).lean()
    res.send(course)
})


// WORKERS

//for worker edit
router.get('/workers/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let worker = await Workers.findOne({_id}).populate('user').lean()
    res.send(worker)
})


// GROUP

//for group edit
router.get('/group/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let group = await Group.findOne({_id}).lean()
    res.send(group)
})


// TYPEGROUP

//for typegroup edit
router.get('/typegroup/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let typegroup = await Typegroup.findOne({_id}).lean()
    res.send(typegroup)
})


// PUPIL

//for pupil edit
router.get('/pupils/edit/:id',async(req,res)=>{
    const _id = req.params.id
    let pupil = await Pupil.findOne({_id}).populate('user').lean()
    res.send(pupil)
})


// SPENDINGOTHER

// for spendingother edit
router.get('/spendingother/edit/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    const spendingother = await Spendingother.findOne({_id})
    res.send(spendingother)
})


// SPENDING

// for spending edit
router.get('/spending/edit/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    const spending = await Spending.findOne({_id})
    res.send(spending)
})


// PAYMENT

// for payment edit
router.get('/payment/edit/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    const payment = await Payment.findOne({_id}).populate('pupil').populate('group').populate('filial').lean()
    res.send(payment)
})

// payment filial for select
router.get('/payment/filial/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    let groups = await Group.find({filial:_id}).lean()
    res.send(groups)
})
// payment group for select
router.get('/payment/group/:id',auth,async(req,res)=>{
    const _id = req.params.id 
    let groups = await Group.findOne({_id:_id}).populate('pupils').lean()
    res.send(groups.pupils)
})

// payment group for select
router.get('/payment/pupil/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let pupil = await Pupil.findOne({_id:_id}).lean()
    res.send(pupil)
})

// for filterdata
// router.get('/payment/filterdata/search/',async (req,res)=>{
//     let {filtersumma} = req.query
//     let prosent = 0
//     let payments = []
//     console.log(filtersumma)
//     filtersumma = parseInt(filtersumma)
//
//     let payment = await Payment.find().populate('filial').populate('group').populate('pupil').lean()
//     console.log("query",payments)
//     payment = payment.map (pay => {
//         prosent = pay.allsumma * filtersumma
//         prosent = parseInt(prosent)
//         return pay
//     })
//
//     payments = await Payment.find({"allsumma":{"$lte": "prosent"}}).populate('filial').populate('group').populate('pupil').lean()
//     payments = payments.map((pay, index) => {
//
//         pay.allsumma = 0
//         pay.summaEnd = 0
//         pay.index = index + 1
//         pay.historysumma = pay.historysumma.filter(item => {
//             pay.allsumma += item.summa
//             return item
//
//         })
//
//         pay.summaEnd = pay.group.price-parseInt(pay.allsumma)
//         // pay.summaEnd = pay.summaEnd.toLocaleString('fr')
//         // pay.group.price = pay.group.price.toLocaleString('fr')
//         // pay.allsumma = pay.allsumma.toLocaleString('fr')
//         // pay.summa = pay.summa.toLocaleString()
//
//
//
//         return pay
//     })
//
//
//
//     res.send(JSON.stringify(payments))
// })



//  USERS

// for user edit
router.get('/users/editlogin/:userid',auth,async(req,res)=>{
    const _id = req.params.userid
    const user = await User.findOne({_id})

    res.send(user)
})

// TESTS

// for user edit
router.get('/test/edit/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const test = await Test.findOne({_id})

    res.send(test)
})



module.exports = router