'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Report = mongoose.model('Report'),
	Company = mongoose.model('Company'),
	Checklist = mongoose.model('Checklist'),
	Inspection = mongoose.model('Inspection'),
	_ = require('lodash');

/**
 * Create a report
 */
exports.create = function(req, res) {
	var report = new Report(req.body);
	console.log(report);
	report.save(function(err) {
		if (err) {
			console.log('save error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(report);
		}
	});
};

/**
 * Show the current report
 */
exports.read = function(req, res) {
	res.json(req.report);
};

/**
 * Update a report
 */
exports.update = function(req, res) {
	var report = req.report;

	report = _.extend(report, req.body);

	report.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(report);
		}
	});
};

/**
 * Delete an report
 */
exports.delete = function(req, res) {
	var report = req.report;

	report.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(report);
		}
	});
};

/**
 * Retrieve all reports
 */
exports.all = function(req, res) {
	Report.find({name: {$ne: ''}})
	.populate('company')
	.populate('checklist')
	.populate('inspectors')
	.populate('regulatories')
	.populate('editor')
	.exec(function(err, reports) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(reports);
		}
	});
};

/**
 * Report middleware
 */
exports.reportByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Report is invalid'
		});
	}

	Report.findById(id)
	.populate('company')
	.populate('checklist')
	.populate('inspectors')
	.populate('regulatories')
	.populate('editor')
	.exec(function(err, report) {
		if (err) return next(err);
		if (!report) {
			return res.status(404).send({
				message: 'Report not found'
			});
		}
		req.report = report;
		next();
	});
};

exports.reportsByCompanyID = function(req, res) {
	var id = req.companyId;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Report is invalid'
		});
	}
	Report.find({
		company: mongoose.Types.ObjectId(id)
	})
	.populate('company')
	.populate('checklist')
	.populate('inspectors')
	.populate('regulatories')
	.populate('editor')
	.exec(function(err, report) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!report) {
			return res.status(404).send({
				message: 'Report not found'
			});
		} else {
			res.json(report);
		}
	});
};

exports.distinctCompanies = function(req, res) {
	Report.distinct('company', function(err, docs) {
		Company.find({_id: {$in: docs}})
		.populate('editor')
		.exec(function(err, companies) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(companies);
			}
		});
	});
};

exports.getInspections = function(req, res) {
	console.log('params: ', req.query);
	var filters = req.query;
	var from_date = new Date(filters.fromDate);
	var to_date = new Date(filters.toDate);
	to_date.setDate(to_date.getDate() + 1);

	var queries = {
		checklist: filters.checklist,
		// editor: filters.inspectors,
		// editor: {$in: filters.inspectors},
		isSubmitted: true,
		date: {
			$gte: from_date,
			$lt: to_date
		}
	};
	if (Array.isArray(filters.inspectors)) {
		queries.editor = {$in: filters.inspectors};
	} else {
		queries.editor = filters.inspectors;
	}
	Inspection.find(queries)
	.populate('checklist')
	.populate('site')
	.populate('editor')
	.populate('answers.question')
	.sort([[filters.sortBy, -1]])
	.sort([['date', -1]])
	.sort([['updated', -1]])
	.exec(function(err, inspections) {
		if (err) {
			console.log('fetch error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var options = [
				{
			      	path: 'answers.question.regulatory_framework',
			      	model: 'Regulatory'
			    },
			    {
			    	path: 'editor.supervisor',
			    	model: 'User'
			    }
			];
			Inspection.populate(inspections, options, function (err, inspections) {
		      	res.json(inspections);
		    });
		 // res.json(inspections);
		}
	});
};

exports.checklistsByCompany = function(req, res) {
	console.log('***************', req.query);
	var id = req.query.companyId;
	var queries = {};
	if (id !== 'all') {
		queries = {
			company: mongoose.Types.ObjectId(id)
		};
	}
	Report.distinct('checklist', queries, function(err, docs) {
		Checklist.find({_id: {$in: docs}})
		.populate('company')
		.populate('site')
		.populate('frequency')
		.populate('questions.question')
		.populate('editor')
		.exec(function(err, checklists) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(checklists);
			}
		});
	});
};

/**
 * Report authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.report.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
