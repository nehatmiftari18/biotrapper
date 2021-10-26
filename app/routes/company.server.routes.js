'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var company = require('../../app/controllers/company.server.controller');

	app.route('/companies')
		.get(users.requiresLogin, company.allActive)
		.post(users.requiresLogin, company.create);
	app.route('/companies/all').get(users.requiresLogin, company.all);
	app.route('/companies/:companyId')
		.get(users.requiresLogin, company.read)
		.put(users.requiresLogin, company.update)
		.delete(users.requiresLogin, company.delete);

	// Finish by binding the article middleware
	app.param('companyId', company.companyByID);
};
