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
 * Frequency Schema
 */
var FrequencySchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in frequency name']
	},
	type: {
		type: String,
		default: 'Daily'				// Daily, Weekly, Bi-weekly, Monthly, Quarterly, Annually
	},
	period: {
		type: String,
		default: 'due'				// between, due, interval
	},
	between: {
		type: Schema.Types.Mixed
	},
	due: {
		type: Schema.Types.Mixed
	},
	interval: {
		type: Number
	},
	status: {
		type: Boolean,
		default: true
	},
	company: {
		type: Schema.Types.ObjectId,
		ref: 'Company'
	},
	updated: {
		type: Date
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


/**
 * Find possible not used frequencyname
 */
FrequencySchema.statics.findUniqueFrequencyname = function(frequencyname, suffix, callback) {
	var _this = this;
	var possibleFrequencyname = frequencyname + (suffix || '');

	_this.findOne({
		name: possibleFrequencyname
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleFrequencyname);
			} else {
				return _this.findUniqueFrequencyname(frequencyname, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('Frequency', FrequencySchema);
