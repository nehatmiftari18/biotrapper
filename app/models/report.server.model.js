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
 * Report Schema
 */
var ReportSchema = new Schema({
	name: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in the name field.']
	},
	company: { type: Schema.Types.ObjectId, ref: 'Company' },
	checklist: { type: Schema.Types.ObjectId, ref: 'Checklist' },
	inspectors: [{ 
		type: Schema.Types.ObjectId, 
		ref: 'User' 
	}],
	regulatories: [{ 
		type: Schema.Types.ObjectId, 
		ref: 'Regulatory' 
	}],
	fromDate: Date,
	toDate: Date,
	groupBy: String,
	type: String,
	description: String,
	updated: {
		type: Date,
		default: Date.now
	},
	editor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Report', ReportSchema);
