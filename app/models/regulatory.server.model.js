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
 * Regulatory Schema
 */
var RegulatorySchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in regulatory name']
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
 * Find possible not used regulatory name
 */
RegulatorySchema.statics.findUniqueRegulatoryname = function(regulatoryname, suffix, callback) {
	var _this = this;
	var possibleRegulatoryname = regulatoryname + (suffix || '');

	_this.findOne({
		name: possibleRegulatoryname
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleRegulatoryname);
			} else {
				return _this.findUniqueRegulatoryname(regulatoryname, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('Regulatory', RegulatorySchema);
