const express = require('express') 
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const csrf = require('csurf')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash') // !
// const helmet = require('helmet')
// const compression = require('compression')




// Routerlar
const pageRouter = require('./router/page')
const workerRouter = require('./router/worker') 
const authRouter  = require('./router/auth')
const adminCenterRouter = require('./router/adminCenter') 
const filialRouter = require('./router/filial')
const apiRouter = require('./router/api')
const courseRouter = require('./router/course')
const groupRouter = require('./router/group')
const typegroupRouter = require('./router/typegroup')
const paymentRouter = require('./router/payment') 
const spendingRouter = require('./router/spending') 
const pupilRouter = require('./router/pupil') 
const spendingotherRouter = require('./router/spendingother')
const settingsRouter = require('./router/settings')
const testRouter = require('./router/test')
const userRouter = require('./router/user')
const reportRouter = require('./router/report')

// middleWare lar
const varMid = require('./middleware/var')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys/dev')

const app = express()
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})
app.engine('hbs',hbs.engine)
app.set('view engine','hbs')
app.set('views','views')
app.use(express.urlencoded({extended:true})) 
app.use(express.static(__dirname+'/public')) 
app.use('/images',express.static('images')) // !

app.use(cors())

const store = new MongoStore({
    collection: 'session',
    uri: keys.MONGODB_URI
})
app.use(session({
    secret: keys.SESSION_SECRET,
    saveUninitialized:false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 10,
        secure: false 
    },
    resave:true,
    store
}))

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrf())

app.use((error,req,res,next)=>{
    const message = `This is the unexpected field -> ${error.field}`
    console.log(message)
    next()
})

app.use(flash()) // !
app.use(varMid)
// app.use(helmet())
// app.use(compression())

app.use(pageRouter)
app.use('/workers',workerRouter) 
app.use('/auth',authRouter) 
app.use('/settings',settingsRouter) 
app.use('/admincenter',adminCenterRouter) 
app.use('/filial',filialRouter)
app.use(apiRouter)
app.use('/course',courseRouter)
app.use('/group',groupRouter)
app.use('/typegroup',typegroupRouter)
app.use('/payment',paymentRouter)
app.use('/spending',spendingRouter)
app.use('/pupils',pupilRouter)
app.use('/spendingother',spendingotherRouter)
app.use('/test',testRouter)
app.use('/users',userRouter)
app.use('/report', reportRouter)
app.use('/subject', require('./router/subject'))
app.use('/journal', require('./router/journal'))
// app.use('/genre',genreRouter)

mongoose.connect(keys.MONGODB_URI,{useNewUrlParser:true})
.then((console.log("mongodb connected")))
.catch((err)=>{console.log("err database")})

const PORT = process.env.PORT || 5003
app.listen(PORT,()=>{
    console.log(`Abco is running. ${PORT}`)
})


