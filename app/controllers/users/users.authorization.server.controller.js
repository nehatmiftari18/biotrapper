'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findById(id)
	.populate('company')
	.populate('editor')
	.exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.user = user;
		next();
	});
};

exports.userByCompanyID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'User is invalid'
		});
	}
	User.find({
		company: mongoose.Types.ObjectId(id),
		role: {$nin: ['superadmin', 'administrator']},
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, user) {
		if (err) return next(err);
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			});
		}
		req.user = user;
		next();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}
	next();
};

exports.requiresLoginAndPage = function(req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/#!/signin');
	}
	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
		});
	};
};
