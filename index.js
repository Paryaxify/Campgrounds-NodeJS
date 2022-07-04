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
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// method override
app.use(methodOverride('_method'))
app.use(morgan('tiny'))
// home page
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', {camps})
})

// create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) =>{
    // console.log(req)
    const data = req.body
    const newcamp = new Campground(data);
    await newcamp.save()
    res.redirect(`/campgrounds/${newcamp._id}`)
})

app.get('/campgrounds/:id/update', async(req, res) => {
    const {id} = req.params;
    const findCamp = await Campground.findById(id);
    res.render('campgrounds/update', {findCamp})
})

app.patch('/campgrounds/:id', async(req, res) => {
    const {id} = req.params
    const data = req.body
    const updateCamp = await Campground.findByIdAndUpdate(id, data, {runValidators: true})
    res.redirect(`/campgrounds/${updateCamp._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})


app.get('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id)
    res.render('campgrounds/details', {campground})
})


// Listen to port
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
