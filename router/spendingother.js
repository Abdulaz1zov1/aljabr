const {Router} = require('express')
const router = Router()
const Spendingother = require('../modeles/spendingother')
const auth = require('../middleware/auth')
const { route } = require('./page')


router.get('/',auth,async(req,res)=>{
    let spendingother = await Spendingother.find().sort({_id:-1}).lean()
    let summaSum = 0
    spendingother = spendingother.map((s,index) => {
        summaSum +=s.summa
        s.index = index + 1
        s.summa = s.summa.toLocaleString('fr')
        s.createdAt = (s.createdAt.getDate() + '/' + (s.createdAt.getUTCMonth()+1) + '/' + s.createdAt.getFullYear() + ' ' + s.createdAt.getHours() + ':' + s.createdAt.getMinutes() + ':' + s.createdAt.getSeconds())
        return s
    })
    summaSum = summaSum.toLocaleString('fr')
    res.render('spendingother/index',{
        title: 'Список  расходы',
        spendingother,summaSum,
        isSpendingother:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/',auth,async(req,res)=>{
    try {
        let {summa,comment} = req.body
        let createdAt = new Date()
        const spendingother = await new Spendingother({summa,createdAt,comment})
            await spendingother.save()
            req.flash('success','Добавлено')
            res.redirect('/spendingother')
    } catch (error) {
        console.log(error)
    }
    
})


router.post('/save',auth,async(req,res)=>{
    let {_id,summa,comment} = req.body
    let createdAt = new Date()
    const spendingother = await Spendingother.findByIdAndUpdate(_id,{summa,createdAt,comment})
    await spendingother.save()
    req.flash('success','Сохранено')
    res.redirect('/spendingother')
    
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Spendingother.findByIdAndDelete(req.params.id)
    res.redirect('/spendingother')
})


router.get('/excell',auth,async(req,res)=>{
    let spendingother = await Spendingother.find().sort({_id:-1}).lean()
    let summaSum = 0;
    spendingother = spendingother.map((spen,index) => {
        summaSum +=spen.summa
        spen.summa = spen.summa.toLocaleString()
        spen.index = index + 1
        // spen.createdAt = spen.createdAt.toLocaleString('fr')
        // spen.createdAt = (spen.createdAt.getDate() + '/' + (spen.createdAt.getUTCMonth()+1) + '/' + spen.createdAt.getFullYear() + ' ' + spen.createdAt.getHours() + ':' + spen.createdAt.getMinutes() + ':' + spen.createdAt.getSeconds())
        return spen
    })
    summaSum = summaSum.toLocaleString()
    res.render('spendingother/excell',{
        spendingother,summaSum,
        isSpendingother:true,
        title: 'Список расходы',
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.get('/get/:month',auth,async(req,res)=>{
    let month = req.params.month
    let spending = await Spendingother.find().lean()
    let monthsumma = 0;
    spending = spending.map(spen => {
        
        if ((spen.createdAt.getMonth()+1)==month){
            
            monthsumma +=spen.summa
            
        }
        
        return spen
    })
    monthsumma = monthsumma.toLocaleString()
    res.send({spending,monthsumma})
})


module.exports = router