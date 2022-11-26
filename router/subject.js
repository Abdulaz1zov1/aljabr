const {Router} = require('express')
const router = Router()
const Subject = require('../modeles/subject')
const Course = require('../modeles/course')
const auth = require('../middleware/auth')
const { route } = require('./page')

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let subject = await Subject.find().populate('course').sort({_id:-1}).lean()
    let course = await Course.find().lean()
    subject = subject.map((cours, index) => {
        cours.class = cours.status == 0 ? 'bg-danger' : 'bg-success'
        cours.status = (cours.status == 0) ? 'Отключено' : 'Активный'
        cours.index = index + 1
        return cours
    })
    res.render('subject',{
        title: 'Список предметов',
        subject,
        course,
        isSubject:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})

router.get('/get/:id',auth,async (req,res)=>{
    try {
        if (req.params){
            let _id = req.params.id
            let subject = await Subject.findOne({_id})
            if (subject){
                res.send(subject)
            }
        }
    } catch (e) {
        res.send(e)
    }
})

router.post('/',auth,async(req,res)=>{
    try {
        let {title,course,status} = req.body
        status = status || 0
        let userId = req.session.user._id
        const subject = await new Subject({userId:userId,course,title,status})
        await subject.save()
        req.flash('success','Направление добавлено')
        res.redirect('/subject')
    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    try {
        let _id = req.body._id
        let {title,status} = req.body
        status = status || 0
        const subject = await Subject.findByIdAndUpdate(_id,{title,status})
        await subject.save()
        req.flash('success','Предмет сохранено')
        res.redirect('/subject')
    } catch (error) {
        console.log(error)
    }
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Subject.findByIdAndDelete(req.params.id)
    req.flash('success','Предмет удалено!')
    res.redirect('/subject')
})


module.exports = router