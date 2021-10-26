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


/**
 * Site Schema
 */
var CompanySchema = new Schema({
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
 * Find possible not used companyname
 */
CompanySchema.statics.findUniqueSitename = function(companyname, suffix, callback) {
	var _this = this;
	var possibleCompanyname = companyname + (suffix || '');

	_this.findOne({
		name: possibleCompanyname
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleCompanyname);
			} else {
				return _this.findUniqueSitename(companyname, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('Company', CompanySchema);
