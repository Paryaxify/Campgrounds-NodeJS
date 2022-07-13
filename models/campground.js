// define a campground model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');

const campgroundSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
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
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
});

campgroundSchema.post('findOneAndDelete', async (camp) => {
	if (camp.reviews.length) {
		const res = await Review.deleteMany({ _id: { $in: camp.reviews } });
                console.log(res)
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
