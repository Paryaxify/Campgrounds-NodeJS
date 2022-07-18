// import packages
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL //'mongodb://127.0.0.1:27017/CampGround'
//models
const User = require('./models/user')

//routes
const userRoutes = require("./routes/users")
const campgroundsRoute = require('./routes/campgounds')
const reviewsRoute = require('./routes/reviews')

//mongoose error handling wrapper
const ExpressError = require('./utils/ExpressError')

//connect to mongoDB database
// 
async function db() {
    await mongoose.connect(dbUrl);
}

db()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => handleError(err));

// init express app
const app = express()
// set port
const PORT = 8080

const sessionConfig = {
    name: 'session',
    secret: process.env.SESSION_SECRET || 'keyboard cat', //temporary development secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true, //only sends cookies over HTTPS. use in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600,
    })
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
// To remove data using these defaults:
app.use(mongoSanitize());
// morgan console logger
app.use(morgan('tiny'))
// express-session 
app.use(session(sessionConfig))
// flash messages
app.use(flash())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
app.use(passport.session())
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.errors = req.flash('error')
    next()
})

// home page
app.get('/', (req, res) => {
    console.log(req.query)
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



