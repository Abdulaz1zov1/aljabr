const {Router} = require('express')
const router = Router()
const Filial = require('../modeles/filial')
const Group = require('../modeles/group')
const auth = require('../middleware/auth')
const { route } = require('./page')

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let filial = await Filial.find().where({'userId':user}).sort({_id:-1}).lean()
    filial = filial.map((fil, index) => {
        fil.class = fil.status == 0 ? 'bg-danger' : 'bg-success'
        fil.status = (fil.status == 0) ? 'Отключено' : 'Активный'
        fil.index = index + 1
        return fil 
    })
    res.render('filial/index',{
        title: 'Список филиалы',
        filial,
        isFilial:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})


router.post('/',auth,async(req,res)=>{
    try {
        let {province,adress,title,status} = req.body
        status = status || 0
        let userId = req.session.user._id
        const filial = await new Filial({userId:userId,province,adress,title,status})
            await filial.save()
            req.flash('success','Филиал добавлено')
            res.redirect('/filial')
    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    try {
        let _id = req.body._id
        let {province,adress,title,status} = req.body
        status = status || 0
        await Filial.findByIdAndUpdate(_id,{province,adress,title,status})
        req.flash('success','Филиал сохранено')
        res.redirect('/filial')
        
    }  catch (error) {
        console.log(error)
    }
    
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Filial.findByIdAndDelete(req.params.id)
    req.flash('success','Филиал удалено!')
    res.redirect('/filial')
})

router.get('/more/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const filial = await Filial.findOne({_id}).lean()
    let group = await Group.find({filial:_id}).populate('filial').populate('pupils').populate('course').populate('typegroup').populate('teacher').lean()

    let allPupilsCount = 0
    let allTeacherArray = []
    let allTeacherCount = 0
    let allGroupCount = group.length
    

    group = group.map(gr=> {
        gr.pupilsCount = gr.pupils.length
        allPupilsCount += gr.pupils.length
        allTeacherArray.push(gr.teacher)
        return gr
    })
    console.log("teach",allTeacherArray)
    
    function removeDuplicates(originalArray, prop) {
        var newArray = [];
        var lookupObject  = {};
        
        for(var i in originalArray) {
            lookupObject[originalArray[i][prop]] = originalArray[i];
        }
        
        for(i in lookupObject) {
            newArray.push(lookupObject[i]);
        }
        return newArray;
    }
    
    let uniqueArray = removeDuplicates(allTeacherArray, _id);

    allTeacherCount = uniqueArray.length
    res.render('filial/more',{
        group,
        allPupilsCount,
        allTeacherCount,
        allGroupCount,
        isFilial:true,
        error: req.flash('error'),
        success: req.flash('success'),
        title: `${filial.title}`,
        adress: `${filial.adress}`
    })
})


router.get('/groupid/:id',auth,async(req,res)=>{
    const _id = req.params.id
    let group = await Group.findOne({_id}).populate('filial').populate('pupils').populate('course').populate('typegroup').lean()
    res.render('filial/groupstudents',{
        group,
        isFilial:true,
        error: req.flash('error'),
        success: req.flash('success'),
    })
})

module.exports = router