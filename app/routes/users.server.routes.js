'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/all').get(users.requiresLogin, users.all);
	app.route('/users/me').get(users.requiresLogin, users.me);
	app.route('/users')
		.get(users.requiresLogin, users.allActive)
		.put(users.requiresLogin, users.update)
		.post(users.requiresLogin, users.createUser);

	app.route('/users/accounts').delete(users.requiresLogin, users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	app.route('/users/:userId')
		.get(users.requiresLogin, users.read)
		.put(users.requiresLogin, users.editUser)
		.post(users.requiresLogin, users.update)
		.delete(users.requiresLogin, users.delete);

	app.route('/users/company/:companyId')
		.get(users.requiresLogin, users.getUsersByCompany);

	app.route('/users/inspector/:companyId')
		.get(users.requiresLogin, users.getInspectorsByCompany);

	app.route('/users/supervisor/:companyId')
		.get(users.requiresLogin, users.getSupervisorsByCompany);

	app.route('/users/inspectors/:checklistId')
		.get(users.requiresLogin, users.getInspectorsByChecklist);

	app.route('/users/deactivate/:userId')
		.post(users.requiresLogin, users.deactivateUser);

	app.route('/users/activate/:userId')
		.post(users.requiresLogin, users.activateUser);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);

	// parameter middleware that will run before the next routes
	app.param('companyId', function(req, res, next, id) {
	    req.companyId = id;
	    next();
	});

	app.param('checklistId', function(req, res, next, id) {
	    req.checklistId = id;
	    next();
	});
};
