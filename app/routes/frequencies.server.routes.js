'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var frequencies = require('../../app/controllers/frequencies.server.controller');

	app.route('/frequencies')
		.get(users.requiresLogin, frequencies.allActive)
		.post(users.requiresLogin, frequencies.create);
	app.route('/frequencies/all').get(users.requiresLogin, frequencies.all);
	app.route('/frequencies/:frequencyId')
		.get(users.requiresLogin, frequencies.read)
		.put(users.requiresLogin, frequencies.update)
		.delete(users.requiresLogin, frequencies.delete);

	app.route('/frequencies/company/:companyId')
		.get(users.requiresLogin, frequencies.read);

	// Finish by binding the article middleware
	app.param('frequencyId', frequencies.frequencyByID);
	app.param('companyId', frequencies.frequencyByCompanyID);
};
