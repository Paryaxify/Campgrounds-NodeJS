const Campground = require('../models/campground');
const Review = require('../models/review');

const isOwner = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission for this');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

const isReviewOwner = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission for this');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports = { isOwner, isReviewOwner };
