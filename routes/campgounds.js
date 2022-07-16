const express = require('express')
const router = express.Router()

//mongoose error handling wrapper
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

// schema validation
const { campgroundSchema } = require('../JoiSchemas.js')

// login middleware
const isLoggedIn = require('../middleware/isLoggedIn')
// author middleware
const { isOwner } = require('../middleware/isOwner')

// controllers
const campgrounds = require('../controllers/campgrounds')

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        throw new ExpressError(error, 400)
    }
    next()
}

// show all campgrounds
router.get('/', catchAsync(campgrounds.index))
// render new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewCampground)
// create new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createNewCampground))
// render update camp form
router.get('/:id/update', isLoggedIn, isOwner, catchAsync(campgrounds.renderUpdateCampground))
// update campground
router.patch('/:id', isLoggedIn, isOwner, validateCampground, catchAsync(campgrounds.updateCampground))
// delete campground
router.delete('/:id', isLoggedIn, isOwner, catchAsync(campgrounds.deleteCampground))
// detials
router.get('/:id', catchAsync(campgrounds.detailsCampground))

module.exports = router;