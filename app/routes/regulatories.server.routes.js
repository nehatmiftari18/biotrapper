'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var regulatories = require('../../app/controllers/regulatories.server.controller');

	app.route('/regulatories')
		.get(users.requiresLogin, regulatories.allActive)
		.post(users.requiresLogin, regulatories.create);
	app.route('/regulatories/all').get(users.requiresLogin, regulatories.all);
	app.route('/regulatories/:regulatoryId')
		.get(users.requiresLogin, regulatories.read)
		.put(users.requiresLogin, regulatories.update)
		.delete(users.requiresLogin, regulatories.delete);

	app.route('/regulatories/company/:companyId')
		.get(users.requiresLogin, regulatories.read);

	// Finish by binding the article middleware
	app.param('regulatoryId', regulatories.regulatoryByID);
	app.param('companyId', regulatories.regulatoryByCompanyID);
};
