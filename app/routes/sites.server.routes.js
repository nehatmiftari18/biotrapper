'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var sites = require('../../app/controllers/sites.server.controller');

	app.route('/sites')
		.get(users.requiresLogin, sites.allActive)
		.post(users.requiresLogin, sites.create);
	app.route('/sites/all').get(users.requiresLogin, sites.all);
	app.route('/sites/:siteId')
		.get(users.requiresLogin, sites.read)
		.put(users.requiresLogin, sites.update)
		.delete(users.requiresLogin, sites.delete);

	app.route('/sites/company/:companyId')
		.get(users.requiresLogin, sites.read);

	// Finish by binding the article middleware
	app.param('siteId', sites.siteByID);
	app.param('companyId', sites.siteByCompanyID);
};
