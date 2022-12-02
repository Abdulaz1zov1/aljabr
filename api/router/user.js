const {Router} = require('express')
const router = Router()
const csrf = require('csurf')
const bcrypt = require('bcryptjs')
const csrfProtection = csrf({ cookie: true })
const auth  = require('../middleware/auth')
const User  = require('../modeles/user')



router.get('/',auth,async(req,res)=>{
    let users = await User.find().lean()
    users = users.map((user, index) => {
        user.class = user.status == 0 ? 'bg-danger' : 'bg-success'
        user.status = (user.status == 0) ? 'Отключено' : 'Активный'
        user.index = index + 1
        return user 
    })
    res.render('users/index',{
        title: 'Все users',
        isUser:true,
        users,
    })
})


router.post('/', async (req, res) => {
    let {login,password,name,role,status} = req.body
    status = status || 0
    const hashPass = await bcrypt.hash(password, 10)
    let user = await new User({login,password: hashPass,name,role,status})
    await user.save()

    req.flash('success', 'Успешно!')
    res.redirect('/users/')

    
})



router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    await User.findByIdAndRemove({_id})
    req.flash('success','Удалено')
    res.redirect('/users')
})



router.post('/savelogin',auth,async(req,res)=>{
    let _id = req.body._id
    const {login,password} = req.body
    let user = {login}
    if(password) {
        user.password = await bcrypt.hash(password, 10)
    }

    await User.findByIdAndUpdate(_id,user)

    req.flash('success','Сохранено')
    res.redirect('/')

})
// router.get('/get/:id',auth,async(req,res)=>{
//     const _id = req.params.id 
//     const student = await Student.findOne({_id}).lean()
//     res.send(student)
// })



module.exports = router