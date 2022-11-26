module.exports = (req,res,next)=>{
    res.locals.isAuth = req.session.isAuthed
    res.locals.csrf = req.csrfToken()
    res.locals.user = req.session.user
    
    
    if (req.session.user){
        res.locals.layout = req.session.user.role
        switch(req.session.user.role){
            case 'superadmin': 
                res.locals.statusOnline = "Супер Админ"
                res.locals.name = req.session.user.name
                res.locals.userid = req.session.user._id
                break
            case 'admin': 
                res.locals.statusOnline = "Админ"
                res.locals.name = req.session.user.name
                res.locals.userid = req.session.user._id
                break
            case 'cash': 
                res.locals.statusOnline = "Кассир"
                res.locals.name = req.session.user.name
                res.locals.userid = req.session.user._id
                break
            case 'teacher': 
                res.locals.statusOnline = "Преподаватель"
                res.locals.name = req.session.user.name
                res.locals.userid = req.session.user._id
                break
            case 'pupil': 
                res.locals.statusOnline = "Ученик"
                res.locals.name = req.session.user.name
                res.locals.userid = req.session.user._id
                break
            default:
        }
    }
    next()
}