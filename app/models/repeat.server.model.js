'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

var RepeatSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: ''
	},
	every: {
		type:String,
		default: ''
	},
	displayOrdinal: {
		type: Number,
		default: 99
	},
	ranges: {
		type: Number
	},
	rangeType: {
		type: String,
		default: ''
	},
	incrementDays: {
		type: Number,
		default: 0
	},
	dueBy: {
		type: String,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Repeat', RepeatSchema);
