// import models
const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const { id } = req.params
    const data = req.body.review
    const review = new Review(data)
    review.author = req.user._id
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${campground._id}`)
}