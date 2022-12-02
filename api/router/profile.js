const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const User = require('../modeles/user')
router.get('/',auth,async(req,res)=>{
    const user = req.session.user
    const ads = await Ads.find({userId:user._id}).populate('userId').lean()
    res.render('profile/index',{
        title: `Страница ${user.name} пользователья`, user,
        ads, 
        error: req.flash('error'), success: req.flash('success')
    })
})
router.post('/save',auth,async(req,res)=>{
    const {_id,name,lname,email} = req.body
    const checkUser = await User.findOne({email,_id: {$ne: _id}})
    if (checkUser){
        req.flash('error','Пользователь с таким почтой уже имеется. Выберите другую')
        res.redirect('/profile/')
    } else {
        const user = await User.findOne({_id})
        if (req.file){
            const img = req.file.path
            user.img = img }
        user.name = name
        user.email = email
        await user.save()
        req.session.user = user
        req.flash('success','Все обновлено!')
        res.redirect('/profile/')
    }
})
module.exports = router