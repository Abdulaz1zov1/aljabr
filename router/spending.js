const {Router} = require('express')
const router = Router()
const Spending = require('../modeles/spending')
const User = require('../modeles/user')
const Worker = require('../modeles/workers')
const auth = require('../middleware/auth')
const { route } = require('./page')


router.get('/',auth,async(req,res)=>{
    let currentMonth = req.query.month || new Date().getMonth()

    let status = req.query.status || 2
    let currentYear = new Date().getFullYear()
    let workers = []
    if (status == -1){
        workers  = await Worker.find().sort({name:1}).lean()
    } else {
        workers = await Worker.find({status}).sort({name:1}).lean()
    }
    let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
    let allSummaMonth = 0
    let mustSummaMonth = 0
    let resSummaMonth = 0
    console.log("s",currentMonth)
    workers = workers.map((worker, index) => {
        worker.index = index+1
        worker.all = 0
        mustSummaMonth += worker.salary
        worker.history = worker.history.filter(item => {
            let itemDate = new Date(item.date)
            console.log("11",itemDate.getMonth())
            console.log("22",currentMonth)
            if (itemDate.getMonth() == currentMonth && itemDate.getFullYear() == currentYear) {
                worker.all += item.getsalary
                allSummaMonth += item.getsalary
                return item
            }
        })
        
        worker.must = worker.salary - worker.all
        worker.salary = worker.salary ? worker.salary.toLocaleString('fr') : 0
        worker.all = worker.all ? worker.all.toLocaleString('fr') : 0
        worker.must = worker.must ? worker.must.toLocaleString('fr') : 0
        worker.phone = worker.phone ? worker.phone.toLocaleString('fr') : 0
        

        return worker

    })
    resSummaMonth = mustSummaMonth - allSummaMonth
    allSummaMonth = allSummaMonth.toLocaleString()
    
    let monthRes = months[currentMonth]
    
    res.render('spending/index',{
        title: 'Список зарплаты',
        isSpending:true,
        allSummaMonth,monthRes,
        mustSummaMonth: mustSummaMonth.toLocaleString(),
        resSummaMonth: resSummaMonth.toLocaleString(),
        workers,
        error: req.flash('error'),
        success: req.flash('success')
    })

})



router.get('/excell',auth,async (req,res)=> {
    let currentMonth = req.query.month || new Date().getMonth()
    let status = req.query.status || 2
    let currentYear = new Date().getFullYear()
    let workers = []
    if (status == -1){
        workers  = await Worker.find().sort({name:1}).lean()
    } else {
        workers = await Worker.find({status}).sort({name:1}).lean()
    }
    let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
    let allSummaMonth = 0
    let mustSummaMonth = 0
    let resSummaMonth = 0
    workers = workers.map((worker, index) => {
        worker.index = index+1
        worker.all = 0
        mustSummaMonth += worker.salary
        worker.history = worker.history.filter(item => {

            let itemDate = new Date(item.date)
            if (itemDate.getMonth() == currentMonth && itemDate.getFullYear() == currentYear) {
                worker.all += item.getsalary
                allSummaMonth += item.getsalary
                return item
            }
        })
        
        worker.must = worker.salary - worker.all
        worker.salary = worker.salary.toLocaleString()
        worker.all = worker.all.toLocaleString()
        worker.must = worker.must.toLocaleString()
        worker.phone = worker.phone.toLocaleString()
        
        return worker
    })
    resSummaMonth = mustSummaMonth - allSummaMonth
    allSummaMonth = allSummaMonth.toLocaleString()

    let monthExcell = months[currentMonth]
    res.render('spending/excell',{
        title: 'Сотрудники',
        isWorkers:true,
        allSummaMonth,
        mustSummaMonth: mustSummaMonth.toLocaleString(),
        resSummaMonth: resSummaMonth.toLocaleString(),
        workers,monthExcell,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.get('/show/:id',auth,async(req,res)=>{
    let _id = req.params.id
    let worker = await Worker.findOne({_id}).lean()
    let summa = 0
    worker.history = worker.history.map(el => {
        summa += el.getsalary
        el.type = el.type == 0 ? 'Аванс' : 'Оклад'
        el.getsalary = el.getsalary.toLocaleString()
        el.createdAt = (el.createdAt.getDate() + '/' + (el.createdAt.getUTCMonth()+1) + '/' + el.createdAt.getFullYear() + ' ' + el.createdAt.getHours() + ':' + el.createdAt.getMinutes() + ':' + el.createdAt.getSeconds())
        let dateVal = new Date(el.date)
        el.date = (dateVal.getUTCMonth()+1) + '/' + dateVal.getFullYear()
        return el
    })

   

    summa = summa.toLocaleString()
    worker.salary = worker.salary ? worker.salary.toLocaleString() : 0
    res.render('spending/show',{
        title: `Подробная информация о сотрудники: ${worker.name} ${worker.lname}`,
        worker,summa, id:worker._id
    })
})




module.exports = router