// create a seed file to simulate fake data for a database
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const mongoose = require('mongoose');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

// import files
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

// connect to mongoDB database
async function db() {
	await mongoose.connect('mongodb://127.0.0.1:27017/CampGround');
}
db()
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => handleError(err));

// return any random array value
const sample = (array) => {
	return array[Math.floor(Math.random() * array.length)];
};

// function to create 50 campground objects at random
const seedDB = async () => {
	// delete all database
	await Campground.deleteMany({});

	// fill database with new campground entries
	for (let i = 0; i < 100; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			author: '62d279d965cb28e516c8eb34', //admin user id temporary to fill seeds
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url: 'https://res.cloudinary.com/prxfy/image/upload/v1658056816/CampGround/yzzylgk6ovs6uno1ivgz.jpg',
					filename: 'CampGround/yzzylgk6ovs6uno1ivgz',
				},
				{
					url: 'https://res.cloudinary.com/prxfy/image/upload/v1658056828/CampGround/rqlp9rmjnh0bmiruja2l.jpg',
					filename: 'CampGround/rqlp9rmjnh0bmiruja2l',
				},
			],
			price: Math.floor(Math.random() * 50) + 10,
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nulla lectus, condimentum a commodo vel, congue eu felis. Proin eget nunc ullamcorper, faucibus metus eu, maximus risus. Phasellus ante sapien, fermentum id blandit vitae, eleifend vel ante. Duis sit amet blandit leo. Ut varius fringilla aliquam. In consectetur ante orci, eu eleifend neque interdum sed. Donec luctus dolor in felis accumsan, sed condimentum quam volutpat. Suspendisse laoreet vestibulum sem. In vestibulum suscipit pretium.',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
		});
		await camp.save();
	}
};

// run the database and close db connection
seedDB().then(() => mongoose.connection.close());
