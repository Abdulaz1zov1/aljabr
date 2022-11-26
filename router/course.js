const {Router} = require('express')
const router = Router()
const Course = require('../modeles/course')
const auth = require('../middleware/auth')
const { route } = require('./page')

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let course = await Course.find().where({'userId':user}).sort({_id:-1}).lean()
    course = course.map((cours, index) => {
        cours.class = cours.status == 0 ? 'bg-danger' : 'bg-success'
        cours.status = (cours.status == 0) ? 'Отключено' : 'Активный'
        cours.index = index + 1
        return cours 
    })
    res.render('cours/index',{
        title: 'Список направление',
        course,
        isCourse:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/',auth,async(req,res)=>{
    try {
        let {title,status} = req.body
        status = status || 0
        let userId = req.session.user._id
        const course = await new Course({userId:userId,title,status})
            await course.save()
        req.flash('success','Направление добавлено')
        res.redirect('/course')
    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    try {
        let _id = req.body._id
        let {title,status} = req.body
        status = status || 0
        const course = await Course.findByIdAndUpdate(_id,{title,status})
            await course.save()
        req.flash('success','Направление сохранено')
        res.redirect('/course')
    } catch (error) {
        console.log(error)
    }
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Course.findByIdAndDelete(req.params.id)
    req.flash('success','Направление удалено!')
    res.redirect('/course')
})


module.exports = router