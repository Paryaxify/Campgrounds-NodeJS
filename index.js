// import packages
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const engine = require('ejs-mate')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const flash = require('connect-flash') 
const passport = require('passport')
const LocalStrategy = require('passport-local')

//models
const User = require('./models/user')

//routes
const userRoutes = require("./routes/users")
const campgroundsRoute = require('./routes/campgounds')
const reviewsRoute = require('./routes/reviews')

//mongoose error handling wrapper
const ExpressError = require('./utils/ExpressError')

//connect to mongoDB database
async function db() {
    await mongoose.connect('mongodb://127.0.0.1:27017/CampGround');
}

db()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => handleError(err));

// init express app
const app = express()
// set port
const PORT = 3000

const sessionConfig = {
    secret: 'keyboard cat', //temporary development secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true, //only sends cookies over HTTPS. use in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
// setup app
// ejs engine -> ejs-mate
app.engine('ejs', engine)
app.set('view engine', 'ejs')
// set views directory
app.set('views', path.join(__dirname, 'views'))
// set public directory
app.use(express.static(path.join(__dirname, 'public')))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
// method override
app.use(methodOverride('_method'))
// morgan console logger
app.use(morgan('tiny'))
// express-session 
app.use(session(sessionConfig))
// flash messages
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=> {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.errors = req.flash('error')
    next()
})

// home page
app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)
// campgrounds route
app.use('/campgrounds', campgroundsRoute)
// reviews route
app.use('/campgrounds/:id/reviews', reviewsRoute)

app.all('*', (req, res, next) => {
    next(new ExpressError('Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) {
        err.message = 'Oh No, Something Went Wrong'
    }
    res.status(statusCode).render('campgrounds/error', { err })
})

// Listen to port
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})



