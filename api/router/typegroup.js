const {Router} = require('express')
const router = Router()
const TypeGroup = require('../modeles/typegroup')
const auth = require('../middleware/auth')

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let typegroup = await TypeGroup.find().where({'userId':user}).sort({_id:-1}).lean()
    typegroup = typegroup.map((t, index) => {
        t.class = t.status == 0 ? 'bg-danger' : 'bg-success'
        t.status = (t.status == 0) ? 'Отключено' : 'Активный'
        t.index = index + 1
        return t 
    })
    res.render('typegroup/index',{
        title: 'Список тип классы',
        typegroup,
        isTypeGroup:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/',auth,async(req,res)=>{
    try {
        let {title,status} = req.body
        status = status || 0
        let userId = req.session.user._id
        const typegroup = await new TypeGroup({userId:userId,title,status})
            await typegroup.save()
            req.flash('success','Добавлено')
            res.redirect('/typegroup')
    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    let _id = req.body._id
    let {title,status} = req.body
    status = status || 0
    await TypeGroup.findByIdAndUpdate(_id,{title,status})
    req.flash('success','Сохранено')
    res.redirect('/typegroup')
    
})


router.get('/delete/:id',auth,async(req,res)=>{
    await TypeGroup.findByIdAndDelete(req.params.id)
    req.flash('success','Удалено!')
    res.redirect('/typegroup')
})


// router.get('/gettypegroup/:id',auth,async(req,res)=>{
//     const _id = req.params.id 
//     const typegroup = await TypeGroup.findOne({_id})
//     res.send(typegroup)
// })

// router.get('/alltypegroup/', async(req,res) =>{
//     const typegroup = await TypeGroup.find().lean()
    
//     res.send(typegroup)
// })





module.exports = router