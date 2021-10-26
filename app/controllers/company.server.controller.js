'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Company = mongoose.model('Company'),
	_ = require('lodash');

/**
 * Create a company
 */
exports.create = function(req, res) {
	var company = new Company(req.body);

	company.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(company);
		}
	});
};

/**
 * Show the current company
 */
exports.read = function(req, res) {
	res.json(req.company);
};

/**
 * Update a company
 */
exports.update = function(req, res) {
	var company = req.company;

	company = _.extend(company, req.body);

	company.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(company);
		}
	});
};

/**
 * Delete an company
 */
exports.delete = function(req, res) {
	var company = req.company;

	company.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(company);
		}
	});
};

/**
 * Retrieve all sites
 */
exports.all = function(req, res) {
	// console.log('logged in user: ', req.user);
	Company.find()
	.populate('editor')
	.exec(function(err, sites) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(sites);
		}
	});
};

/**
 * Retrieve all active sites
 */
exports.allActive = function(req, res) {

	Company.find({status: true})
	.populate('editor')
	.exec(function(err, sites) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(sites);
		}
	});
};

/**
 * Company middleware
 */
exports.companyByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Company is invalid'
		});
	}

	Company.findById(id)
	.populate('editor')
	.exec(function(err, company) {
		if (err) return next(err);
		if (!company) {
			return res.status(404).send({
				message: 'Company not found'
			});
		}
		req.company = company;
		next();
	});
};

