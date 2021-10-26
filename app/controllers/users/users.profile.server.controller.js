'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Show user
 */
exports.read = function(req, res) {
	res.json(req.user);
};

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	// delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;
		delete user.password;
		delete user.salt;
		// console.log('update user: ', user);
		user.save(function(err) {
			if (err) {
				console.log('update error: ', err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Edit an user
 */
exports.editUser = function(req, res) {
	// console.log('editing user: ', user);
	// delete req.body.salt;
	// delete req.body.password;
	console.log('update user: ', req.body);
	var user = req.user;

	user.update(req.body,
		function(err, numberAffected, rawResponse) {
	    	if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json({message: 'success'});
			}
	});
};

exports.deactivateUser = function(req, res) {
	var user = req.user;
	user = _.extend(user, _.pick({status: false}, ['status']));
	user.updated = Date.now();

	// console.log('update user: ', user);
	user.save(function(err) {
		if (err) {
			console.log('update error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(user);
		}
	});
};

exports.activateUser = function(req, res) {
	var user = req.user;
	user = _.extend(user, _.pick({status: true}, ['status']));
	user.updated = Date.now();

	// console.log('update user: ', user);
	user.save(function(err) {
		if (err) {
			console.log('update error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(user);
		}
	});
};

/**
 * Delete an user
 */
exports.delete = function(req, res) {
	var user = req.user;

	user.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(user);
		}
	});
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/**
 * Send All Users
 */
exports.all = function(req, res) {
	User.find({})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		if (err) {
			console.log('user fetch error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			_.each(users, function(item) {
				if (item.supervisor && item.supervisor.status === false) {
					item.supervisor = null;
				}
			});
			res.json(users);
		}
	});
};

/**
 * Send All Active Users
 */
exports.allActive = function(req, res) {
	User.find({status: true})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		console.log('user fetch error: ', err);
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			_.each(users, function(item) {
				if (item.supervisor.status === false) {
					item.supervisor = null;
				}
			});
			res.json(users);
		}
	});
};

/**
 * Users by company
 */
exports.getUsersByCompany = function(req, res) {
	var id = req.companyId;
	console.log('id: ', req);
	User.find({
		company: mongoose.Types.ObjectId(id),
		role: {$nin: ['superadmin', 'administrator']}
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		console.log('user fetch error: ', err);
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			_.each(users, function(item) {
				if (item.supervisor && item.supervisor.status === false) {
					item.supervisor = null;
				}
			});
			res.json(users);
		}
	});
};

/**
 * Inspectors by company
 */
exports.getInspectorsByCompany = function(req, res) {
	var id = req.companyId;
	User.find({
		company: mongoose.Types.ObjectId(id),
		role: 'inspector',
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		console.log('user fetch error: ', err);
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			res.json(users);
		}
	});
};

/**
 * Inspectors by company
 */
exports.getSupervisorsByCompany = function(req, res) {
	var id = req.companyId;
	User.find({
		company: mongoose.Types.ObjectId(id),
		role: 'supervisor',
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		console.log('user fetch error: ', err);
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			res.json(users);
		}
	});
};

/*
 * inspectors by checklist
 */
exports.getInspectorsByChecklist = function(req, res) {
	var id = req.checklistId;
	User.find({
		role: 'inspector',
		status: true,
		checklists: id
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, users) {
		if (err) {
			console.log('user fetch error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err),
				users: JSON.stringify(users)
			});
		} else {
			res.json(users);
		}
	});
};
