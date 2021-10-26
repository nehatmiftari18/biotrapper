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
 * Site Schema
 */
var SiteSchema = new Schema({
	name: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in site name']
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
 * Find possible not used sitename
 */
SiteSchema.statics.findUniqueSitename = function(sitename, suffix, callback) {
	var _this = this;
	var possibleSitename = sitename + (suffix || '');

	_this.findOne({
		name: possibleSitename
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleSitename);
			} else {
				return _this.findUniqueSitename(sitename, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('Site', SiteSchema);
