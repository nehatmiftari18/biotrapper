'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Checklist = mongoose.model('Checklist'),
	Answer = mongoose.model('Answer'),
	_ = require('lodash');

/**
 * Create a checklist
 */
exports.create = function(req, res) {
	var checklist = new Checklist(req.body);

	checklist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(checklist);
		}
	});
};

/**
 * Show the current checklist
 */
exports.read = function(req, res) {
	res.json(req.checklist);
};

/**
 * Update a checklist
 */
exports.update = function(req, res) {
	var checklist = req.checklist;

	checklist = _.extend(checklist, req.body);
	checklist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(checklist);
		}
	});
};

/**
 * Delete an checklist
 */
exports.delete = function(req, res) {
	var checklist = req.checklist;

	checklist.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(checklist);
		}
	});
};

/**
 * Retrieve all checklists
 */
exports.all = function(req, res) {
	Checklist.find({text: {$ne: ''}, checklistType: {$ne: 'none'}})
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
};

/**
 * Checklist middleware
 */
exports.checklistByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Checklist is invalid'
		});
	}

	Checklist.findById(id)
	.populate('company')
	.populate('site')
	.populate('frequency')
	.populate('primary_inspector')
	.populate('secondary_inspector')
	.populate('tertiary_inspector')
	.populate('questions.question')
	.populate('primary_supervisor')
	.populate('secondary_supervisor')
	.populate('tertiary_supervisor')
	.populate('questions.question')
	.populate('editor')
	.exec(function(err, checklist) {
		if (err) return next(err);
		if (!checklist) {
			return res.status(404).send({
				message: 'Checklist not found'
			});
		}
		var options = [
			{
		      	path: 'questions.question.regulatory_framework',
		      	model: 'Regulatory'
		    }
		];
		Checklist.populate(checklist, options, function (err, populatedChecklist) {
			Answer.find({
				checklist: populatedChecklist._id,
				site: populatedChecklist.site._id,
				editor: req.user
			}).exec(function(err, answers) {
				populatedChecklist.set('answers', answers, { strict: false });
				req.checklist = populatedChecklist;
				next();
			});
	    });
	});
};

exports.checklistsByCompanyID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Checklist is invalid'
		});
	}
	Checklist.find({
		company: mongoose.Types.ObjectId(id)
	})
	.populate('company')
	.populate('site')
	.populate('frequency')
	.populate('questions.question')
	.populate('editor')
	.exec(function(err, checklist) {
		if (err) return next(err);
		if (!checklist) {
			return res.status(404).send({
				message: 'Checklist not found'
			});
		}
		req.checklist = checklist;
		next();
	});
};

exports.checklistsByInspector = function(req, res) {
	var inspectorId = req.params.inspectorId;
	var category = req.query.category;
	var query ={
		$or: [{
			primary_inspector: inspectorId
		}, {
			secondary_inspector: inspectorId
		}, {
			tertiary_inspector: inspectorId
		}]
	};
	if (category == 0) {
		query = { primary_inspector: inspectorId };
	} else if (category == 1) {
		query = { secondary_inspector: inspectorId };
	} else if (category == 2) {
		query = { tertiary_inspector: inspectorId };
	}
	Checklist.find(query)
	.exec(function(err, checklists) {
		if (err) {
			return next(err);
		} else {
			res.json(checklists);
		}
	});
};

exports.getInspectors = function(req, res) {
	var checklistId = req.params.checklistId;
	Checklist.findById(checklistId)
		.populate('primary_inspector')
		.populate('secondary_inspector')
		.populate('tertiary_inspector')
		.populate('questions.question')
		.exec(function(err, checklist) {
			if (err) {
				return next(err);
			} else {
				var inspectors = [];
				if (checklist) {
					if (checklist.primary_inspector) {
						inspectors.push(checklist.primary_inspector);
					}
					if (checklist.secondary_inspector) {
						inspectors.push(checklist.secondary_inspector);
					}
					if (checklist.tertiary_inspector) {
						inspectors.push(checklist.tertiary_inspector);
					}
				}
				res.json(inspectors);
			}

		});
};

exports.checklistsBySites = function(req, res) {
	if(req.body.length === 0) return res.json([]);
	var siteIds = [];
	for(var i=0; i<req.body.length; i++) {
		siteIds.push(mongoose.Types.ObjectId(req.body[i].id));
	}

	Checklist.find({text: {$ne: ''}, checklistType: {$ne: 'none'}, site: {$in: siteIds}})
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
};

exports.checklistsBySiteAndFrequencies = function(req, res) {
	var frequencyIds = [];
	var i = 0;
	var body = req.body;

	if (body.frequencies.length > 0) {
		for(i=0; i<body.frequencies.length; i++) {
			frequencyIds.push(mongoose.Types.ObjectId(body.frequencies[i].id));
		}
	}
	var query = {text: {$ne: ''}, checklistType: {$ne: 'none'}, site: body.site};
	if (frequencyIds.length > 0) {
		query = {text: {$ne: ''}, checklistType: {$ne: 'none'}, site: body.site, frequency: {$in: frequencyIds}};
	}
	if (body.isAll || frequencyIds.length > 0) {
		Checklist.find(query)
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
	} else {
		res.json([]);
	}

};

/**
 * Checklist authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.checklist.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
