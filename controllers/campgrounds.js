const Campground = require('../models/campground')

module.exports.index = async (req, res, next) => {
    const camps = await Campground.find({})
    res.render('campgrounds/index', { camps })
}

module.exports.renderNewCampground = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createNewCampground = async (req, res, next) => {
    if (!req.body.campground) {
        throw new ExpressError("Invalid Data", 400)
    }
    const data = req.body.campground
    const newcamp = new Campground(data);
    newcamp.author = req.user._id
    await newcamp.save()
    req.flash('success', 'Successfully created a new campground')
    res.redirect(`/campgrounds/${newcamp._id}`)
}

module.exports.renderUpdateCampground = async (req, res, next) => {
    const { id } = req.params;
    const findCamp = await Campground.findById(id);
    res.render('campgrounds/update', { findCamp })
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params
    const data = req.body.campground
    const updateCamp = await Campground.findByIdAndUpdate(id, data, { runValidators: true })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${updateCamp._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}

module.exports.detailsCampground = async(req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    res.render('campgrounds/details', { campground })
}