const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const Group = require('../modeles/group')
const Payment = require('../modeles/payment')
const Filial = require('../modeles/filial')
const User = require('../modeles/user')
const Course = require('../modeles/course')
const Typegroup = require('../modeles/typegroup')
const Pupil = require('../modeles/pupil')
const typeList = ['годовой','полгодовой','ежемесячные','кварталный']


router.get('/',auth,async(req,res)=>{
    if (req.session.user.role == 'admin') {
        let user = req.session.user._id
        let group = await Group.find().where({'userId':user}).populate('filial').populate('course').populate('typegroup').populate('teacher').populate('pupils').sort({_id:-1}).lean()
        let filial = await Filial.find().where({'userId':user}).lean()
        let course = await Course.find().where({'userId':user}).where({'userId':user}).lean()
        let typegroup = await Typegroup.find().where({'userId':user}).lean()
        let users = await User.find().where({role:'teacher'}).lean()
        group = group.map( (gr, index) => {
            gr.students = gr.pupils.length

            if (gr.status == 0) gr.status = '<span class="badge bg-danger">Отключено</span>'
            else  gr.status = '<span class="badge bg-success">Активный</span>'


            if(gr.pupils && gr.pupils.length == gr.maxpupils) {
                gr.status = `<a href="/group/full/${gr._id}"><span class="badge bg-info">Заполнено</span></a>`
            }

            gr.index = index + 1
            return gr
        })
        res.render('group/index',{
            title: 'Список группы',
            group,
            filial,
            course,
            typegroup,
            users,
            isGroup:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }
    if (req.session.user.role == 'teacher') {
        let user = req.session.user._id
        let group = await Group.find().where({'teacher':user}).populate('filial').populate('course').populate('typegroup').populate('teacher').populate('pupils').sort({_id:-1}).lean()

        group = group.map((gr, index) => {

            if (gr.status == 0) gr.status = '<span class="badge bg-danger">Отключено</span>'
            else  gr.status = '<span class="badge bg-success">Активный</span>'


            if(gr.pupils && gr.pupils.length == gr.maxpupils) {
                gr.status = `<a href="/group/full/${gr._id}"><span class="badge bg-info">Заполнено</span></a>`
            }

            gr.index = index + 1
            return gr
        })
        res.render('group/teacher',{
            title: 'Список группы',
            group,
            isGroup:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }

})


router.post('/',auth,async(req,res)=>{
    try {
        let {filial,course,typegroup,teacher,numberclass,typeclass,maxpupils,status} = req.body
        status = status || 0
        let userId = req.session.user._id
        const group = await new Group({userId:userId,filial,course,typegroup,teacher,numberclass,typeclass,maxpupils,status})
        await group.save()
        req.flash('success','Добавлено')
        res.redirect('/group')
    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    let _id = req.body._id
    let {filial,course,typegroup,teacher,numberclass,typeclass,maxpupils,price,status} = req.body
    status = status || 0
    await Group.findByIdAndUpdate(_id,{filial,course,typegroup,teacher,numberclass,typeclass,maxpupils,price,status})
    req.flash('success','Сохранено')
    res.redirect('/group')
    
})



router.get('/delete/:id',auth,async(req,res)=>{
    await Group.findByIdAndDelete(req.params.id)
    req.flash('success','Удалено!')
    res.redirect('/group')
})



router.post('/data',auth,async(req,res)=>{
    let {_id,start} = req.body
    let group =await Group.findByIdAndUpdate(_id,{start})
    
        await group.save()
        req.flash('success','Добавлено')
        res.redirect('/group')
})


router.get('/full/:id', async(req,res)=> {
    let user = req.session.user._id
    const _id = req.params.id
    let group = await Group.findOne({_id}).populate('pupils').lean()
    let allgroup = await Group.find().where({'userId':user}).lean()
    let startdata = ''
    if(group.start) {
        startdata = (group.start.getDate() + '/' + (group.start.getUTCMonth()+1) + '/' + group.start.getFullYear() + ' ' + group.start.getHours() + ':' + group.start.getMinutes() + ':' + group.start.getSeconds())
    }
    let allSumma = 0
    let allMust = 0
    let allPrice = 0
    group.pupils = await Promise.all(group.pupils.map(async (item,index) =>  {
        let payments = await Payment.find({pupil:item._id}).lean()
        item.payments = payments
        // let payment = payments.at(-1)
        item.summa = 0
        item.index = index + 1
        item.must = 0
        if (payments){
            let summa = 0
            payments.forEach(pay => {
                pay.historysumma.forEach(his=>{
                    item.summa += his.summa

                })
            })
            // if (payment.historysumma){
            //     payment.historysumma.forEach(his => {
            //         summa += his.summa
            //     })
            // }
            // item.summa = summa
            item.must  = item.price - item.summa
            allMust   += item.must
            allSumma  += item.summa
            allPrice  += item.price
        }
        item.pricetype = typeList[item.pricetype]
        item.gender = item.gender == 0 ? '<span class="badge bg-primary">М</span>' : '<span class="badge bg-danger">Ж</span>'
        return item
    }))
    res.render('group/full',{
        title: 'Список студенты',
        group, allSumma, allMust, allPrice,
        startdata, allgroup,
        isGroup:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})

router.get('/full/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let groups = await Group.find().populate('pupils').lean()
    
    groups.map(async group => {
        let index = group.pupils.findIndex(pupil => pupil._id == _id)
        if (index !== -1) {
            group.pupils.splice(index,1)
            let _id = group._id 
            await Group.findByIdAndUpdate(_id,group)
            
        }
        return group
    }) 
    res.redirect('/group/')
})

module.exports = router