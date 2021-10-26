'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var checklists = require('../../app/controllers/checklists.server.controller');

	app.route('/checklists')
		.get(users.requiresLogin, checklists.all)
		.post(users.requiresLogin, checklists.create);

	app.route('/checklists/:checklistId')
		.get(users.requiresLogin, checklists.read)
		.put(users.requiresLogin, checklists.update)
		.delete(users.requiresLogin, checklists.delete);

	app.route('/checklists/company/:companyId')
		.get(users.requiresLogin, checklists.read);

	app.route('/checklists/byInspectors/:inspectorId')
		.get(users.requiresLogin, checklists.checklistsByInspector);

	app.route('/inspectors/:checklistId')
		.get(users.requiresLogin, checklists.getInspectors);
	app.route('/checklists/bySites')
		.post(users.requiresLogin, checklists.checklistsBySites);
	app.route('/checklists/bySiteAndFrequencies')
		.post(users.requiresLogin, checklists.checklistsBySiteAndFrequencies);
	// Finish by binding the article middleware
	app.param('checklistId', checklists.checklistByID);
	app.param('companyId', checklists.checklistsByCompanyID);
};
