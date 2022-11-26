const {Router} = require('express')
const router = Router() 
const auth = require('../middleware/auth')
const Category = require('../modeles/filial')
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })
const User = require('../modeles/user')
const Group = require('../modeles/group')
const Course = require('../modeles/course')
const Payment = require('../modeles/payment')
const Worker = require('../modeles/workers')
const Pupil = require('../modeles/pupil')


router.get('/', auth,async(req,res)=>{
    let user = req.session.user._id
    let workersCount = await Worker.find().where({'userId':user}).lean().count()
    let pupilCount = await Pupil.find().where({'userId':user}).lean().count()
    let groupCount = await Group.find().where({'userId':user}).lean().count()
    let courseCount = await Course.find().where({'userId':user}).lean().count()
    let workers = await Worker.find().where({'userId':user}).limit(10).lean()
    res.render('index',{
        title: 'Главная страница',
        isHome:true,
        workersCount,
        pupilCount,
        groupCount,
        courseCount,
        workers
    })
})




module.exports = router