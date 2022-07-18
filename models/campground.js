// define a campground model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');

const imageSchema = new Schema({
	url: {
		type: String,
		required: true,
	},
	filename: {
		type: String,
		required: true,
	},
});

imageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_500');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		images: [imageSchema],
		price: {
			type: Number,
			min: 0,
			required: true,
		},
		description: {
			type: String,
		},
		location: {
			type: String,
			required: true,
		},
		geometry: {
			type: {
				type: String,
				enum: ['Point'], // 'location.type' must be 'Point'
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
	},
	opts
);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `<a href=/campgrounds/${this._id}>${this.title}</a><p>${this.location}</p>`
});

campgroundSchema.post('findOneAndDelete', async (camp) => {
	if (camp.reviews.length) {
		const res = await Review.deleteMany({ _id: { $in: camp.reviews } });
		console.log(res);
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
