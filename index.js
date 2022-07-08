// import packages
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const engine = require('ejs-mate')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const morgan = require('morgan')

// import files
const Campground = require('./models/campground')
//mongoose error handling wrapper
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const campgroundSchema  = require('./JoiSchemas.js')

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

// setup app
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))
// parse application/json
app.use(bodyParser.json())
// method override
app.use(methodOverride('_method'))
app.use(morgan('tiny'))

function validateCampground(req, res, next){
    const {error} = campgroundSchema.validate(req.body)
    if (error){
        throw new ExpressError(error, 400)
    }
    next()
}

// home page
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', {camps})
}))

// create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    if (!req.body.campground) {
        throw new ExpressError("Invalid Data", 400)
    }
    const data = req.body.campground
    const newcamp = new Campground(data);
    await newcamp.save()
    res.redirect(`/campgrounds/${newcamp._id}`)
}))

app.get('/campgrounds/:id/update', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const findCamp = await Campground.findById(id);
    res.render('campgrounds/update', {findCamp})
}))

app.patch('/campgrounds/:id', validateCampground ,catchAsync(async (req, res, next) => {
    const {id} = req.params
    const data = req.body.campground
    const updateCamp = await Campground.findByIdAndUpdate(id, data, {runValidators: true})
    res.redirect(`/campgrounds/${updateCamp._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
    res.render('campgrounds/details', {campground})
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if (!err.message) {
        err.message = 'Oh No, Something Went Wrong'
    }
    res.status(statusCode).render('campgrounds/error', {err})
})

// Listen to port
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})



