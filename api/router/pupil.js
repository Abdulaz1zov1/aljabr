const {Router} = require('express')
const router = Router()
const csrf = require('csurf')
const bcrypt = require('bcryptjs')
const csrfProtection = csrf({ cookie: true })
const auth  = require('../middleware/auth')
const Pupil = require('../modeles/pupil')
const Payment = require('../modeles/payment')
const Group = require('../modeles/group')
const User = require('../modeles/user')
let months = ['Январ','Феврал','Март','Апрел','Май','Июн','Июл','Август','Сентябр','Октябр','Ноябр','Декабр']
let pricetype = [
    {title:'годовой',rate:1},
    {title:'полгодовой',rate:2},
    {title:'ежемесячные',rate:10},
    {title:'кварталный',rate:5}
]

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let pupils = await Pupil.find().where({'userId':user}).populate('user').populate('group').sort({name:1}).lean()
    let group = await Group.find().where({'userId':user}).lean()

    pupils = pupils.map((pupil, index) => {
        pupil.gender = (pupil.gender == 0) ? 'Мужской' : 'Женщина'
        pupil.index = index + 1
        if(pupil.price)
            pupil.price= pupil.price.toLocaleString()
        else
            pupil.price = 0
        return pupil 
    })
    res.render('pupils/index',{
        title: 'Все ученики',
        isPupil:true,
        pupils,
        group,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/', async (req, res) => {
    let {login,password,name,phone,gender,month,address,group,telegram,price,pricetype} = req.body
    pricetype = pricetype || 0
    const reallyPupil = await Pupil.findOne({phone})
    if (reallyPupil) {
        req.flash('error', 'Пользователь с таким номер телефоном уже имеется!')
        res.redirect('/pupils/')
    } else {    
        const hashPass = await bcrypt.hash(password, 10)
        let role = "pupil"
        let checkUser = await User.findOne({login})
        if (checkUser){
            req.flash('error','Пользователь с таким ЛОгИнОМ уже имеется! НАПИШИТЕ ДРУГУЮ!!!!')
            res.redirect('/pupils/')
            return false
        }
        let newUser = await new User({login,password:hashPass,role:role})
            await newUser.save()
        let userId = req.session.user._id
        const pupil = await new Pupil({user:newUser._id,userId:userId,name,pricetype,phone,group,month,address,gender,telegram,price})
        await pupil.save()

        let groupOne = await Group.findOne({_id:group}).lean()
        
        groupOne.pupils.push(pupil._id)
        await Group.findByIdAndUpdate(group,groupOne)
        req.flash('success', 'Успешно!')
        res.redirect('/pupils/')

    }
})

router.post('/save',auth,async(req,res)=>{
    let _id = req.body._id
    let {login,password,name,month,address,phone,gender,group,telegram,price,pricetype} = req.body
    pricetype = pricetype || 0
    let pupil = await Pupil.findOne({_id}).lean()
    let oldgroup = await Group.findOne({pupils: {$in: [_id]}})
    if (oldgroup){
        let index = oldgroup.pupils.findIndex(p => p == _id)
        if (index !== -1){
            oldgroup.pupils.splice(index,1)
        }
        await oldgroup.save()
    }
    let newgroup = await Group.findOne({_id:group})
    if (newgroup){
        let newIndex = newgroup.pupils.findIndex(g => g == _id)
        if (newIndex == -1){
            newgroup.pupils.push(pupil._id)
            await newgroup.save()
        }
    }
    await Pupil.findByIdAndUpdate(_id,{login,password,name,phone,month,address,gender,group,telegram,pricetype,price})

    let user = await User.findOne({_id: pupil.user})
    let upUser = {login}
    if(password) {
        const hashPass = await bcrypt.hash(password, 10)
        upUser.password = hashPass
    }
    await User.findByIdAndUpdate(user._id,upUser)
    req.flash('success','Сохранено')
    res.redirect('/pupils/')

})

router.post('/savegroup',auth,async(req,res)=>{
    let _id = req.body._id
    let {login,password,name,month,address,phone,gender,group,telegram,price,pricetype} = req.body
    pricetype = pricetype || 0
    let pupil = await Pupil.findOne({_id})
    let oldgroup = await Group.findOne({pupils: {$in: [_id]}})
    if (oldgroup){
        let index = oldgroup.pupils.findIndex(p => p == _id)
        if (index !== -1){
            oldgroup.pupils.splice(index,1)
        }
        await oldgroup.save()
    }
    let newgroup = await Group.findOne({_id:group})
    if (newgroup){
        let newIndex = newgroup.pupils.findIndex(g => g == _id)
        if (newIndex == -1){
            newgroup.pupils.push(pupil._id)
            await newgroup.save()
        }
    }
    await Pupil.findByIdAndUpdate(_id,{login,password,name,phone,month,address,gender,group,telegram,pricetype,price})
    let user = await User.findOne({_id: pupil.user})
    let upUser = {login}
    if(password) {
        const hashPass = await bcrypt.hash(password, 10)
        upUser.password = hashPass
    }
    await User.findByIdAndUpdate(user._id,upUser)
    req.flash('success','Сохранено')
    res.redirect(`/group/full/${group}`)

})

router.get('/more/:id',auth,async(req,res)=>{
    if (req.params){
        let _id = req.params.id
        let pupil = await Pupil.findOne({_id}).populate(['group']).lean()
        let group = await Group.findOne({pupils: {$in: [_id]}}).lean()
        // let payment = await Payment.findOne({pupil: _id}).populate('pupil').lean()
        let payments = await Payment.find({pupil: _id}).populate('pupil').lean()
        if (pupil.pricetype){
            pupil.mustprice = Math.round(pupil.price / pricetype[pupil.pricetype].rate)
            pupil.pricetype = pricetype[pupil.pricetype].title
        } else {
            pupil.mustprice = 0
            pupil.pricetype = 0
        }
        pupil.allpay = 0
        if (payments){
            payments = payments.map(payment => {
                payment.historysumma = payment.historysumma.map((his,index) => {
                    let date  = new Date(his.data)
                    pupil.allpay += his.summa
                    his.data= `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()} г`
                    his.index = index + 1
                    return his
                })
                return payment
            })
        }
        pupil.mprice = pupil.price - pupil.allpay
        // console.log(payment)
        res.render('pupils/more',{
            payments,
            pupil, group,
            title: 'Подробно',
            isPupil:true,
        })
    }
})


router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let groups = await Group.find().populate('pupils').lean()   
    groups.map(async group => {
        let index = group.pupils.findIndex(pupil => pupil._id == _id)
        if (index !== -1) {
            group.pupils.splice(index,1)
            let _id = group._id 
            await Group.findByIdAndUpdate(_id,group)
        }
        return
    })
    let pupil = await Pupil.findOne({_id})
    await User.findByIdAndRemove(pupil.user)
    await Pupil.findByIdAndRemove({_id})
    req.flash('success','Удалено')
    res.redirect('/pupils')
})




// router.get('/get/:id',auth,async(req,res)=>{
//     const _id = req.params.id 
//     const student = await Student.findOne({_id}).lean()
//     res.send(student)
// })



module.exports = router