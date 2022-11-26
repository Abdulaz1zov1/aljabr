const {Router} = require('express')
const router = Router()
const Group = require('../modeles/group')
const Payment = require('../modeles/payment')
const Spendingother = require('../modeles/spendingother')
const Pupil = require('../modeles/pupil')
const Filial = require('../modeles/filial')
const auth = require('../middleware/auth')
const { route } = require('./page')
const typeList = ['yillik','yarim yillik','oylik','kvartallik']
let pricetype = [
    {title:'годовой',rate:1},
    {title:'полгодовой',rate:2},
    {title:'ежемесячные',rate:10},
    {title:'кварталный',rate:5}
]
router.get('/',auth,async(req,res)=>{
    let payment = await Payment.find().sort({_id:-1}).populate('pupil').populate('group').lean()
    let spendingother = await Spendingother.find().sort({_id:-1}).lean()
    let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
    let segoddata = new Date()
    segoddata =  segoddata.toString().slice(8,10)
    let title = 'Отчёты'
    let from = req.query.from ? req.query.from : null
    let to = req.query.to ? req.query.to : null
    let type = req.query.type || null
    let rep = false
    let summaPayment = 0;
    let summaSpend = 0;
    let nalichka = 0
    let clicksumma = 0
    let payme = 0
    let perechisleniya = 0
    let terminal = 0

    if (type){
        from = new Date()
        to = new Date()
        if (type=='day'){
            title = `Сегодняшний отчёт: ${to.getDate()}-${months[to.getMonth()]}-${to.getFullYear()}`
            from.setDate(from.getDate() - 1)
        }
        if (type=='week'){
            title = 'Неделный отчёт'
            from.setDate(from.getDate() - 7)
        }
        if (type=='month'){
            title = 'Отчёт за этот месяц'
            console.log(to.getDate())
            from.setDate(from.getDate() - to.getDate()+1)
        }
        payment = payment.filter(pay => {
            pay.historysumma = pay.historysumma.filter(history => {
                let d = new Date(history.data)

                if (history.data >= from && history.data <= to) {
                    summaPayment += history.summa
                    if (history.typepayment == 'Терминал') {
                        terminal += history.summa
                    }
                    if (history.typepayment == 'Перечисление') {
                        perechisleniya += history.summa
                    }
                    if (history.typepayment == 'Наличие') {
                        nalichka += history.summa
                    }
                    if (history.typepayment == 'Click') {
                        clicksumma += history.summa
                    }
                    if (history.typepayment == 'Payme') {
                        payme += history.summa
                    }

                    history.summa = history.summa.toLocaleString()
                    history.data = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`
                    return history
                }
            })
            if (pay.historysumma.length>0) return pay
        })
        spendingother = spendingother.filter(spend => {
            let sana = new Date(spend.createdAt)
            if (sana >= from && sana <= to) {
                summaSpend += spend.summa
                spend.summa = spend.summa.toLocaleString('fr')
                spend.createdAt = spend.createdAt.toLocaleString('fr')
                return spend
            }
        })
    } else if (from && to) {
        from = new Date(from)
        to = new Date(to)
        payment = payment.filter(pay => {
            pay.historysumma = pay.historysumma.filter(history => {
                let d = new Date(history.data)
                if (history.data >= from && history.data <= to) {
                    summaPayment += history.summa
                    history.summa = history.summa.toLocaleString('fr')
                    history.data = history.data.toLocaleString('fr')
                    return history
                }
            })
            if (pay.historysumma.length>0) return pay
        })
        spendingother = spendingother.filter(spend => {
            let sana = new Date(spend.createdAt)
            if (sana >= from && sana <= to) {
                summaSpend += spend.summa
                spend.summa = spend.summa.toLocaleString('fr')
                spend.createdAt = spend.createdAt.toLocaleString('fr')
                return spend
            }
        })
    } else {
        payment = payment.map(pay => {
            pay.historysumma = pay.historysumma.map(history =>{
                let dd = new Date(history.data)
                history.data = `${dd.getDate()}-${months[dd.getMonth()]}-${dd.getFullYear()}`
                summaPayment += history.summa
                history.summa = history.summa.toLocaleString('fr')
                return history
            })

            return pay
        })
    }
    payment = payment.map((pay,index) => {
        pay.index = index+1
      return pay
    })

    let havenalichka = nalichka - summaSpend
    let allSumma = summaPayment - summaSpend
    summaPayment = summaPayment.toLocaleString('fr')
    summaSpend = summaSpend.toLocaleString('fr')
    allSumma = allSumma.toLocaleString('fr')
    res.render('report/index',{
        terminal, payme, perechisleniya,  clicksumma,  nalichka,
        title, havenalichka,
        isReport:true,
        payment,
        spendingother,
        rep,
        summaPayment,
        summaSpend,
        allSumma,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.get('/pupils',auth,async(req,res)=>{
    let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
    let segoddata = new Date()
    segoddata =  segoddata.toString().slice(8,10)
    let title = 'Отчёты'
    let pupils = await Pupil.find().populate(['user','group']).sort({name:1}).lean()

    pupils = await Promise.all(pupils.map(async (item,index)=> {
        item.index = index+1
        let payments = await Payment.find({pupil:item._id}).lean()
        item.summa = 0
        item.index = index + 1
        item.must = 0
        item.pricemust = item.price
        if (item.pricetype){
            item.pricemust = Math.round(item.price / pricetype[item.pricetype].rate)
        }

        if (payments){
            let summa = 0
            payments.forEach(payment => {
                if (payment.historysumma){
                    payment.historysumma.forEach(his => {
                        summa += his.summa
                    })
                }
            })
            item.summa = summa
            item.must  = item.price - item.summa
            // allMust   += item.must
            // allSumma  += item.summa
            // allPrice  += item.price
        }
        item.pricetype = typeList[item.pricetype]
        item.gender = item.gender == 0 ? '<span class="badge bg-primary">М</span>' : '<span class="badge bg-danger">Ж</span>'

        let group = await Group.findOne({
            _id:item.group,
            pupils:
                {$in: item._id}
        }).lean()

        if (group){
            item.check = true
        } else {
           item.check = false
        }
        return item
    }))

    pupils = pupils.filter(pupil => {
        if (pupil.check) {
            return pupil
        }
    })


    res.render('report/pupils',{
        title,
        pupils,
        isReport:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


module.exports = router