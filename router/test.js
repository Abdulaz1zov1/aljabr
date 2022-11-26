const {Router} = require('express')
const router = Router()
const Course = require('../modeles/course')
const Test = require('../modeles/test')
const upload = require('../middleware/file')
const auth = require('../middleware/auth')


router.get('/',auth,async(req,res)=>{
    let tests = await Test.find().populate('course').populate('createdwho').lean()
    let course = await Course.find().lean()

    if(req.session.user.role == 'admin') {
        let group = await Course.find().lean()
        group =  await Promise.all(group.map(async (gr) => {

            gr.count = tests = await Test.find({course:gr._id}).populate('course').count().lean()
            return gr
        }))
        res.render('test/index',{
            title: 'Список направление',
            group,
            isTest:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }
    if(req.session.user.role == 'teacher') {
        let user = req.session.user._id
        let test = await Test.find().where({'createdwho':user}).populate('course').sort({_id:-1}).lean()
        test = test.map((t, index) => {
            t.data = (t.data.getDate() + '/' + (t.data.getUTCMonth()+1) + '/' + t.data.getFullYear() + ' ' + t.data.getHours() + ':' + t.data.getMinutes() + ':' + t.data.getSeconds())

            t.index = index + 1
            return t
        })
        res.render('test/teachertest',{
            title: 'Список тестов',
            test,
            course,
            isTest:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }

})

router.post('/',upload.single('img'), auth,async(req,res)=>{
    let {question,course,correctanswer,falseanswer1,falseanswer2,falseanswer3} = req.body

    let img = 'no-image'
    if (req.file){
        img = req.file.path
    }
    let createdwho = req.session.user._id

    let data = new Date()
    let answers = [falseanswer1,falseanswer2,falseanswer3,correctanswer]
    const test = await new Test({question,course,createdwho:createdwho,correctanswer,answers,data,img,falseanswer1,falseanswer2,falseanswer3})
    await test.save()
    req.flash('success','Добавлено')
    res.redirect('/test')
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Test.findByIdAndDelete(req.params.id)
    res.redirect('/test')
})


router.post('/save',upload.single('img'),auth,async(req,res)=>{
    let {_id,question,course,correctanswer,falseanswer1,falseanswer2,falseanswer3} = req.body

    let answers = [falseanswer1,falseanswer2,falseanswer3,correctanswer]
    
    let upTest = {question,course,correctanswer,answers}
    if (req.file){
        upTest.img = req.file.path
    }
    await Test.findByIdAndUpdate(_id,upTest)

    req.flash('success','Сохранено')
    res.redirect('/test')
    
})

router.get('/admintest/:id',auth,async(req,res)=>{
   let _id = req.params.id
    let test = await Test.find().where({'course':_id}).populate('course').populate('createdwho').sort({_id:-1}).lean()
    console.log(test)
    test = test.map((t, index) => {
        t.data = (t.data.getDate() + '/' + (t.data.getUTCMonth()+1) + '/' + t.data.getFullYear() + ' ' + t.data.getHours() + ':' + t.data.getMinutes() + ':' + t.data.getSeconds())

        t.index = index + 1
        return t
    })
    res.render('test/testsadmin',{
        title: 'Список тестов',
        test,
        isTest:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})





module.exports = router