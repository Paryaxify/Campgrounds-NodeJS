const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': 'Should not contain any html tags.',
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				console.log(clean);
				console.log(value);
				if (clean !== value) {
					return helpers.error('string.escapeHTML', { value });
				}
				return clean;
			}
		}
	}
})
const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		location: Joi.string().required().escapeHTML(),
		price: Joi.number().min(0).required(),
		// image: Joi.string().required(),
		description: Joi.string().required().escapeHTML(),
	}).required(),
	deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().required(),
		body: Joi.string().required().escapeHTML(),
	}).required(),
});
