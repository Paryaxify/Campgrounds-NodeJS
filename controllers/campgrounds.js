const { cloudinary } = require('../cloudinaryConfig');
const Campground = require('../models/campground');

module.exports.index = async (req, res, next) => {
	const camps = await Campground.find({});
	res.render('campgrounds/index', { camps });
};

module.exports.renderNewCampground = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createNewCampground = async (req, res) => {
	if (!req.body.campground) {
		throw new ExpressError('Invalid Data', 400);
	}
	const data = req.body.campground;
	const newcamp = new Campground(data);
	newcamp.images = req.files.map((file) => ({ url: file.path, filename: file.filename }));
	newcamp.author = req.user._id;
	console.log(newcamp);
	await newcamp.save();
	req.flash('success', 'Successfully created a new campground');
	res.redirect(`/campgrounds/${newcamp._id}`);
};

module.exports.renderUpdateCampground = async (req, res) => {
	const { id } = req.params;
	const findCamp = await Campground.findById(id);
	res.render('campgrounds/update', { findCamp });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const data = req.body.campground;
	const imgs = req.files.map((file) => ({ url: file.path, filename: file.filename }));
	const updateCamp = await Campground.findByIdAndUpdate(id, data, { runValidators: true });
	updateCamp.images.push(...imgs);
	await updateCamp.save();
	if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
		await updateCamp.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
	}
	req.flash('success', 'Successfully updated campground');
	res.redirect(`/campgrounds/${updateCamp._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground');
	res.redirect('/campgrounds');
};

module.exports.detailsCampground = async (req, res) => {
	const id = req.params.id;
	const campground = await Campground.findById(id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	res.render('campgrounds/details', { campground });
};
