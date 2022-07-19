const express = require('express')
const router = express.Router({ mergeParams: true })

// error handlers
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../JoiSchemas.js')

const isLoggedIn = require('../middleware/isLoggedIn')
const { isReviewOwner } = require('../middleware/isOwner')

const reviews = require('../controllers/reviews')

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        let errorMessages = error.details.map(el => el.message)
        req.flash('error', errorMessages)
        throw new ExpressError(errorMessages, 400)
    }
    next()
}

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewOwner, catchAsync(reviews.deleteReview))


module.exports = router