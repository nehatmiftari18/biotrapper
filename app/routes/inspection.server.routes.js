'use strict';

module.exports = function(app) {
	// Root routing
	var users = require('../../app/controllers/users.server.controller'),
		inspections = require('../../app/controllers/inspection.server.controller'),
		multiparty = require('connect-multiparty'),
		multipartyMiddleware = multiparty();

	app.route('/inspections')
		.get(users.requiresLogin, inspections.allActive)
		.post(users.requiresLogin, inspections.create);
	app.route('/inspections/all').get(users.requiresLogin, inspections.all);

	app.route('/inspections/savePicture')
		.post(users.requiresLogin, multipartyMiddleware, inspections.savePicture);

	app.route('/pictures/:filename')
		.get(inspections.getImageData);

	app.route('/inspections/:inspectionId')
		.get(users.requiresLogin, inspections.read)
		.put(users.requiresLogin, inspections.update)
		.delete(users.requiresLogin, inspections.delete);

	app.route('/inspections/answer')
		.post(users.requiresLogin, inspections.saveQuestionAnswer);

	app.route('/inspections/duedates/:checklistId/:isSubmitted')
		.get(users.requiresLogin, inspections.getDueDates);
	app.route('/inspections/company/:companyId')
		.get(users.requiresLogin, inspections.read);
	app.route('/inspections/user/:userId')
		.get(users.requiresLogin, inspections.read);

	app.route('/inspections/full_inspection/:inspectionId')
		.get(users.requiresLoginAndPage, inspections.fullInspectionView);

	app.route('/full_inspection/:checklistId')
		.get(users.requiresLoginAndPage, inspections.getLatestInspection);

	app.route('/check_reminder')
		.get(users.requiresLoginAndPage, inspections.checkReminders);

	// Finish by binding the article middleware
	app.param('inspectionId', inspections.inspectionByID);
	app.param('userId', inspections.inspectionByUserID);
	app.param('checklistId', function(req, res, next, id) {
	    req.checklistId = id;
	    next();
	});
};
