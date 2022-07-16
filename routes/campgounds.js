const express = require('express')
const router = express.Router()

// import schema
const Campground = require('../models/campground')

//mongoose error handling wrapper
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

// schema validation
const { campgroundSchema } = require('../JoiSchemas.js')

// login middleware
const isLoggedIn = require('../middleware/isLoggedIn')

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        throw new ExpressError(error, 400)
    }
    next()
}

router.get('/', catchAsync(async (req, res, next) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}))

// create new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    if (!req.body.campground) {
        throw new ExpressError("Invalid Data", 400)
    }
    const data = req.body.campground
    const newcamp = new Campground(data);
    await newcamp.save()
    req.flash('success', 'Successfully created a new campground')
    res.redirect(`/campgrounds/${newcamp._id}`)
}))

router.get('/:id/update', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const findCamp = await Campground.findById(id);
    res.render('campgrounds/update', { findCamp })
}))

router.patch('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params
    const data = req.body.campground
    const updateCamp = await Campground.findByIdAndUpdate(id, data, { runValidators: true })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${updateCamp._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))

router.get('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/details', { campground })
}))

module.exports = router