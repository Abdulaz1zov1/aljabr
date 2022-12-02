const {Router} = require('express')
const router = Router()
const Journal = require('../modeles/journal')
const Subject = require('../modeles/subject')
const Group = require('../modeles/group')
const User = require('../modeles/user')
// const Journal = require('../modeles/')
const Course = require('../modeles/course')
const auth = require('../middleware/auth')
const { route } = require('./page')
let months = ['Январ','Феврал','Март','Aпрел','Май','Июн','Июл','Aвгуст','Сентябрь','Октябрь','Ноябрь','Декабрь']

router.get('/',auth,async(req,res)=>{
    let user = req.session.user._id
    let journal = await Journal.find().populate(['group','teacher','subject']).sort({_id:-1}).lean()
    journal = journal.map((j,index)=>{
        j.index = index + 1
        return j
    })
    let subject = await Subject.find().lean()
    let group = await Group.find().lean()
    let teachers = await User.find().where({role:'teacher'}).lean()
    res.render('journal',{
        title: 'Журнал',
        journal,
        subject, group, teachers,
        isJournal:true,
        error: req.flash('error'),
        success: req.flash('success')
    })
})

router.get('/check/:group/:subject',auth,async(req,res)=>{
    if (req.params){
        let group = req.params.group
        let subject = req.params.subject
        let checkJournal = await Journal.findOne({group,subject}).lean()
        if (checkJournal){
            res.send(JSON.stringify('exist'))
        } else {
            res.send(JSON.stringify('not exist'))
        }

    }
})

router.post('/mark',auth,async(req,res)=>{
    if (req.body){
        let {_id,pupil,created,mark,hwmark} = req.body
        let journal = await Journal.findOne({_id}).lean()
        if (journal){
            journal.marks.push({pupil,created,mark,hwmark})
            await Journal.findByIdAndUpdate(_id,journal)
        }
        req.flash('success','Оценка добавлено')
        res.redirect(`/journal/more/${_id}`)
    }
})

router.get('/more/:id',auth,async(req,res)=>{
    if (req.params){
        let _id = req.params.id

        let thisDate = new Date()
        let d = new Date(thisDate.getFullYear(),thisDate.getMonth()+1,0) // joriy oy
        let dates = d.getDate() // joriy oydagi kunlar
        let monthTitle = months[thisDate.getMonth()]
        let journal = await Journal.findOne({_id}).populate(['group','teacher','subject','marks.pupil']).lean()
        let average = journal.average == 1 ? true : false
        let group = await Group.findOne({_id:journal.group._id}).populate('pupils').lean()
        let otherSubjects = await Journal.find({
            $and: [
                { _id: {$ne: _id }},
                { group: journal.group._id}
            ]
        }).populate('subject').lean()
        let dateList = []
        for(i=1;i<=dates;i++){
            let checkDate = new Date(thisDate.getFullYear(),thisDate.getMonth(),i)
            if (checkDate.getDay() == 0) continue
            dateList.push(i)
        }
        group.pupils = await Promise.all(group.pupils.map(async (pupil,index)=>{
            pupil.index = index + 1
            pupil.marks = []
            pupil.summaMarks = 0
            for(i=1;i<=dates;i++){
                let checkDate = new Date(thisDate.getFullYear(),thisDate.getMonth(),i)
                let m = journal.marks.find(mark => {
                    let markDate = new Date(mark.created)
                    if (markDate.getDate() == checkDate.getDate() && markDate.getMonth() == checkDate.getMonth() && String(mark.pupil._id) == String(pupil._id)){

                        return mark
                    }
                })
                if (checkDate.getDay() == 0) continue
                pupil.summaMarks += m ? m.mark : 0
                pupil.summaHWMarks += m ? m.hwmark : 0
                pupil.marks.push({
                    day:i,
                    mark: m ? m.mark : '',
                    hwmark: m ? m.hwmark : ''
                })
            }
            return pupil
        }))
        res.render('journal/more',{
            title: `Журнал ${journal.group.numberclass}-${journal.group.typeclass} по предмету "${journal.subject.title}"`,
            journal,
            group,
            monthTitle,
            average,
            dateList,
            otherSubjects,
            isJournal:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
    } else {
        res.redirect('/journal')
    }
})

router.get('/get/:id',auth,async (req,res)=>{

        if (req.params){
            let _id = req.params.id
            let journal = await Journal.findOne({_id}).lean()
            if (journal){
                res.send(journal)
            }
        }

})

router.post('/',auth,async(req,res)=>{
    try {
        let {group,teacher,subject,fquarter,average,status} = req.body
        let checkJournal = await Journal.findOne({group,subject})
        if (checkJournal){
            req.flash('error','Уже есть такой журнал')
            res.redirect('/journal')
        } else {
            status = status || 0
            average = average || 0
            let userId = req.session.user._id
            const journal = await new Journal({group,teacher,subject,average,fquarter,status})
            await journal.save()
            req.flash('success','Журнал добавлено')
            res.redirect('/journal')
        }

    } catch (error) {
        console.log(error)
    }
})


router.post('/save',auth,async(req,res)=>{
    try {
        let _id = req.body._id
        let {group,teacher,subject,average,fquarter,status} = req.body
        status = status || 0
        average = average || 0
        const journal = await Journal.findByIdAndUpdate(_id,{group,teacher,subject,average,fquarter,status})
        await journal.save()
        req.flash('success','Предмет сохранено')
        res.redirect('/journal')
    } catch (error) {
        console.log(error)
    }
})


router.get('/delete/:id',auth,async(req,res)=>{
    await Journal.findByIdAndDelete(req.params.id)
    req.flash('success','Предмет удалено!')
    res.redirect('/journal')
})


module.exports = router