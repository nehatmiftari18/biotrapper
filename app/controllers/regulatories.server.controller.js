'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Regulatory = mongoose.model('Regulatory'),
	_ = require('lodash');

/**
 * Create a regulatory
 */
exports.create = function(req, res) {
	var regulatory = new Regulatory(req.body);

	regulatory.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(regulatory);
		}
	});
};

/**
 * Retrieve all regulatories
 */
exports.all = function(req, res) {
	Regulatory.find()
	.populate('company')
	.populate('editor')
	.exec(function(err, regulatories) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(regulatories);
		}
	});
};

/**
 * Retrieve all active regulatories
 */
exports.allActive = function(req, res) {
	Regulatory.find({status: true})
	.populate('company')
	.populate('editor')
	.exec(function(err, regulatories) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(regulatories);
		}
	});
};


/**
 * Show the current regulatory
 */
exports.read = function(req, res) {
	res.json(req.regulatory);
};

/**
 * Update a regulatory
 */
exports.update = function(req, res) {
	var regulatory = req.regulatory;

	regulatory = _.extend(regulatory, req.body);

	regulatory.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(regulatory);
		}
	});
};

/**
 * Delete an regulatory
 */
exports.delete = function(req, res) {
	var regulatory = req.regulatory;

	regulatory.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(regulatory);
		}
	});
};

/**
 * Regulatory middleware
 */
exports.regulatoryByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Regulatory is invalid'
		});
	}

	Regulatory.findById(id)
	.populate('company')
	.populate('editor')
	.exec(function(err, regulatory) {
		if (err) return next(err);
		if (!regulatory) {
			return res.status(404).send({
				message: 'Regulatory not found'
			});
		}
		req.regulatory = regulatory;
		next();
	});
};

exports.regulatoryByCompanyID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Regulatory is invalid'
		});
	}
	Regulatory.find({
		company: mongoose.Types.ObjectId(id),
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, regulatory) {
		if (err) return next(err);
		if (!regulatory) {
			return res.status(404).send({
				message: 'Regulatory not found'
			});
		}
		req.regulatory = regulatory;
		next();
	});
};