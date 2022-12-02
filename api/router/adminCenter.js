const {Router} = require('express')
const router = Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const User = require('../modeles/user')
const AdminCenter = require('../modeles/adminCenter')


router.get('/',auth,async(req,res)=>{
    let admincenter = await AdminCenter.find().populate('user').sort({_id:-1}).lean()
    admincenter = admincenter.map((admcenter,index) => {
        admcenter.index = index + 1
        return admcenter 
    })
    
    res.render('adminCenter/index',{
        title: 'Список админы',
        admincenter,
        isAdminCenter:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/',auth,async(req,res)=>{
    try {
        let {login,password,name,phone} = req.body
        let role = 'admin'

        const hashPass = await bcrypt.hash(password, 10)
        let newUser = await new User({login,password:hashPass,role:role,name:name})
        await newUser.save()
        const adminCenter = await new AdminCenter({user:newUser._id,name,phone,createdAt:Date.now()})
        await adminCenter.save()

        req.flash('success','Добавлено')
        res.redirect('/admincenter')

    } catch (error) {
        console.log(error)
    }
    
})


router.post('/save',auth,async(req,res)=>{
    let _id = req.body._id
    let {login,password,name,phone} = req.body
    
    let adminCenter = {login,password,name,phone}
    await AdminCenter.findByIdAndUpdate(_id,adminCenter)
    let admcenter = await AdminCenter.findOne({_id})
    let user = await User.findOne({_id: admcenter.user})
    if (password){
        const hashPass = await bcrypt.hash(password, 10)
        user.password = hashPass
    }
    user.login = login
    user.name = name
    await User.findByIdAndUpdate(user._id,user)

    req.flash('success','Обновлено')
    res.redirect('/admincenter')
    
})


router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let adminCenter = await AdminCenter.findOne({_id})
    await User.findByIdAndRemove(adminCenter.user)
    await AdminCenter.findByIdAndDelete(_id)
    req.flash('success','Удалено')
    res.redirect('/admincenter')
})



module.exports = router