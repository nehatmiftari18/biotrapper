'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Question = mongoose.model('Question'),
	_ = require('lodash');

/**
 * Create a question
 */
exports.create = function(req, res) {
	var question = new Question(req.body);
	console.log('request body: ', req.body);
	question.save(function(err) {
		if (err) {
			console.log('save error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Show the current question
 */
exports.read = function(req, res) {
	res.json(req.question);
};

/**
 * Update a question
 */
exports.update = function(req, res) {
	var question = req.question;

	question = _.extend(question, req.body);

	question.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Delete an question
 */
exports.delete = function(req, res) {
	var question = req.question;

	question.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(question);
		}
	});
};

/**
 * Retrieve all questions
 */
exports.all = function(req, res) {
	Question.find({text: {$ne: ''}, questionType: {$ne: 'none'}})
	.populate('company')
	.populate('checklists')
	.populate('regulatory_framework')
	.populate('editor')
	.exec(function(err, questions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(questions);
		}
	});
};

/**
 * Question middleware
 */
exports.questionByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		console.log('id is invalid: ', err);
		return res.status(400).send({
			message: 'Question is invalid'
		});
	}

	Question.findById(id)
	.populate('company')
	.populate('checklists')
	.populate('regulatory_framework')
	.populate('editor')
	.exec(function(err, question) {
		if (err) return next(err);
		if (!question) {
			return res.status(404).send({
				message: 'Question not found'
			});
		}
		req.question = question;
		next();
	});
};

exports.questionsByCompanyID = function(req, res) {
	var id = req.companyId;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Question is invalid'
		});
	}
	Question.find({
		company: mongoose.Types.ObjectId(id)
	})
	.populate('company')
	.populate('checklists')
	.populate('regulatory_framework')
	.populate('editor')
	.exec(function(err, question) {
		console.log('question: ', question);
		if (err) {
			console.log('error: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if (!question) {
			return res.status(404).send({
				message: 'Question not found'
			});
		}
		res.json(question);
	});
};

/**
 * Question authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.question.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};

/**
 * Retrieve all keywords available
 */
exports.getKeywords = function(req, res) {

};
