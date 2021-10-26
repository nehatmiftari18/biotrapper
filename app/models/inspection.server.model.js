'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};


/**
 * Inspection Schema
 */
var InspectionSchema = new Schema({
	date: {
		type: Date
	},
	dueDates: [],
	site: {
		type: Schema.Types.ObjectId,
		ref: 'Site'
	},
	checklist: {
		type: Schema.Types.ObjectId,
		ref: 'Checklist'
	},
	// framework: {
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Regulatory'
	// },
	answers: [{
		question: {
			type: Schema.Types.ObjectId,
			ref: 'Question'
		},
		data: Object
	}],
	updated: {
		type: Date,
		default: Date.now
	},
	isSubmitted: Boolean,
	editor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	}
});
mongoose.model('Inspection', InspectionSchema);
