'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller');
	var reports = require('../../app/controllers/reports.server.controller');

	app.route('/reports')
		.get(users.requiresLogin, reports.all)
		.post(users.requiresLogin, reports.create);

 	app.route('/reports/companies')
		.get(users.requiresLogin, reports.distinctCompanies);

	app.route('/reports/checklists')
		.get(users.requiresLogin, reports.checklistsByCompany);

	app.route('/reports/inspections')
		.get(users.requiresLogin, reports.getInspections);

	app.route('/reports/:reportId')
		.get(users.requiresLogin, reports.read)
		.put(users.requiresLogin, reports.update)
		.delete(users.requiresLogin, reports.delete);

	app.route('/reports/company/:companyId')
		.get(users.requiresLogin, reports.reportsByCompanyID);

	// Finish by binding the article middleware
	app.param('reportId', reports.reportByID);
	app.param('companyId', function(req, res, next, id) {
		req.companyId = id;
		next();
	});
};
