const {Router} = require('express')
const router = Router()

router.get('/',async(req,res)=>{
    const settings = await Settings.find().lean()
    res.render('settings/index',{
        title: 'Sozlamalar ro`yhati',
        settings,
        isSettings:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.get('/show/:id',async(req,res)=>{
    const _id = req.params.id
    const settings = await Settings.findOne({_id}).lean()
    res.render('settings/view',{
        title: `${settings.title}`,
        settings,
        isSettings:true,
    })
})

router.get('/create',(req,res)=>{
    res.render('settings/create',{
        title: 'Yangi sozlamalar',
        error: req.flash('error'),
        success: req.flash('success')
    })
})

router.post('/',async(req,res)=>{
    const {title,key,status,value} = req.body
    if (status == undefined) status = 1
    const havesettings = await Settings.findOne({key})
    if (havesettings){
        req.flash('error','Bunday sozlama bor!')
        let backURL=req.header('Referer') || '/'
        res.redirect(backURL)
    } else {
        const settings = await new Settings({title,key,status,value})
        console.log(settings)
        await settings.save()
        req.flash('success','Yangi sozlama ro`yhatdan o`tkazildi')
        res.redirect('/settings')
    }
})

router.get('/edit/:id',async(req,res)=>{
    const _id = req.params.id
    const settings = await Settings.findOne({_id}).lean()
    res.render('settings/edit',{
        settings,
        isSettings:true,
        error: req.flash('error'),
        success: req.flash('success'),
        title: `${settings.title} ni tahrirlash`
    })
})

router.post('/save',async(req,res)=>{
    let {_id,title,slug,status,text} = req.body
    // console.log(typeof status)
    // let img = 'no-image'
    if (req.file){  
        img = req.file.path
    }
    if (status == undefined) status = 1
    const havesettings = await Settings.findOne({slug,_id: {$ne:_id}})
    if (havesettings){
        req.flash('error','Bunday settings bor!')
        res.redirect(`/settings/edit/${_id}`)
    } else {
        const settings = await Settings.findByIdAndUpdate(_id,{title,slug,status,text,img})
        console.log(settings)
        await settings.save()
        req.flash('success','settings muvaffaqiyatli o`zgardi')
        res.redirect('/settings')
    }
})

router.get('/change/:id/:status',async(req,res)=>{
    const _id = req.params.id
    let status = req.params.status
    status = (parseInt(status)==0)?1:0
    let settings = await Settings.findByIdAndUpdate(_id,{status})
    settings.save()
    res.redirect('/settings')
})

router.get('/delete/:id',async(req,res)=>{
    await Settings.findByIdAndDelete(req.params.id)
    res.redirect('/settings')
})


router.get('/all',async(req,res)=>{
    const settings = await Settings.find().lean()
    res.send(settings)
})

module.exports = router