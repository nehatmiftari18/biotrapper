'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var questions = require('../../app/controllers/questions.server.controller');

	app.route('/questions')
		.get(users.requiresLogin, questions.all)
		.post(users.requiresLogin, questions.create);
	app.route('/questions/:questionId')
		.get(users.requiresLogin, questions.read)
		.put(users.requiresLogin, questions.update)
		.delete(users.requiresLogin, questions.delete);

	app.route('/questions/company/:companyId')
		.get(users.requiresLogin, questions.questionsByCompanyID);

	// Finish by binding the article middleware
	app.param('questionId', questions.questionByID);
	app.param('companyId', function(req, res, next, id) {
		req.companyId = id;
		next();
	});
};
