const {Router} = require('express')
const bcrypt = require('bcryptjs')
const auth  = require('../middleware/auth')
const router = Router()
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })
const User = require('../modeles/user')
const Worker = require('../modeles/workers')


router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let workers = await Worker.find().where({'userId':user}).populate('user').sort({_id:-1}).lean()
    workers = workers.map((worker, index) => {
        worker.gender = (worker.gender == 0) ? 'Мужской' : 'Женщина'
        worker.index = index + 1
        if (worker.salary) {
            worker.salary = worker.salary.toLocaleString()
        } else {
            worker.salary = 0
        }
        
        return worker 
        
    })
    res.render('worker/index',{
        title: 'Сотрудники',
        isWorkers:true,
        workers,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/', async (req, res) => {
    try {
        let {login,password,role,name,phone,gender,telegram,salary,status} = req.body
        status = status || 0
        const hashPass = await bcrypt.hash(password, 10)
        let newUser = await new User({login,password:hashPass,role:role,name:name})
            await newUser.save()
            let userId = req.session.user._id
        const worker = await new Worker({user:newUser._id,userId:userId,name,phone,gender,telegram,salary,status})
            await worker.save()
        req.flash('success', 'Добавлено!')
        res.redirect('/workers/')
    } catch (error) {
        console.log(error)
    }
    
})


router.post('/save',auth,async(req,res)=>{
    let _id = req.body._id
    let {login,password,role,name,phone,gender,telegram,salary,status} = req.body
    status = status || 0
    await Worker.findByIdAndUpdate(_id,{name,phone,role,login,password,gender,telegram,salary,status})
    let work = await Worker.findOne({_id})
    let user = await User.findOne({_id: work.user})
    let upUser = {login,name}
    if(password) {
        const hashPass = await bcrypt.hash(password, 10)
        upUser.password = hashPass
    }
    await User.findByIdAndUpdate(user._id,upUser)
    req.flash('success','Сохранено')
    res.redirect('/workers/')
    
    
    
})


router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let work = await Worker.findOne({_id})
    await User.findByIdAndRemove(work.user)
    await Worker.findByIdAndRemove({_id})
    req.flash('success','Удалено')
    res.redirect('/workers')
})


router.post('/salary',auth,async (req,res)=>{
    let {_id,type,date,getsalary} = req.body
    let worker = await Worker.findOne({_id})
    worker.history.push({type,getsalary,date,createdAt:Date.now()})
    await worker.save()
    res.redirect('/spending')
})


router.get('/salary/:id/:index',auth,async (req,res)=>{
    let _id = req.params.id
    let index = req.params.index
    let worker = await Worker.findOne({_id})
    worker.history.splice(index,1)
    await worker.save()
    res.redirect(`/spending/show/${_id}`)
})

module.exports = router