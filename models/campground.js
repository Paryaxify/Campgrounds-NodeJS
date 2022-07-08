// define a campground model
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const campgroundSchema = new Schema(
    {
        title: {
                type:String,
                required: true
        },
        image: {
                type:String,
                required: true
        },
        price: {
                type:Number,
                min: 0,
                required: true
        },
        description: {
                type: String
        },
        location: {
                type:String,
                required: true
        }
    }
)

module.exports = mongoose.model('Campground', campgroundSchema)