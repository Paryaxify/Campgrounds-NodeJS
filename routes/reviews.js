const express = require('express')
const router = express.Router({ mergeParams: true })

// import models
const Campground = require('../models/campground')
const Review = require('../models/review')

// error handlers
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../JoiSchemas.js')


function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        throw new ExpressError(error, 400)
    }
    next()
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params
    const data = req.body.review
    const review = new Review(data)
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${campground._id}`)
}))


module.exports = router