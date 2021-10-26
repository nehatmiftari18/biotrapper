'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Frequency = mongoose.model('Frequency'),
	_ = require('lodash');

/**
 * Create a frequency
 */
exports.create = function(req, res) {
	var frequency = new Frequency(req.body);

	frequency.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(frequency);
		}
	});
};

/**
 * Retrieve all frequencies
 */
exports.all = function(req, res) {
	Frequency.find()
	.populate('company')
	.populate('editor')
	.exec(function(err, frequencies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(frequencies);
		}
	});
};

/**
 * Retrieve all active frequencies
 */
exports.allActive = function(req, res) {
	Frequency.find({status: true})
	.populate('company')
	.populate('editor')
	.exec(function(err, frequencies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(frequencies);
		}
	});
};

/**
 * Show the current frequency
 */
exports.read = function(req, res) {
	res.json(req.frequency);
};

/**
 * Update a frequency
 */
exports.update = function(req, res) {
	var frequency = req.frequency;

	frequency = _.extend(frequency, req.body);

	frequency.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(frequency);
		}
	});
};

/**
 * Delete an frequency
 */
exports.delete = function(req, res) {
	var frequency = req.frequency;

	frequency.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(frequency);
		}
	});
};

/**
 * Frequency middleware
 */
exports.frequencyByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Frequency is invalid'
		});
	}

	Frequency.findById(id)
	.populate('company')
	.populate('editor')
	.exec(function(err, frequency) {
		if (err) return next(err);
		if (!frequency) {
			return res.status(404).send({
				message: 'Frequency not found'
			});
		}
		req.frequency = frequency;
		next();
	});
};

exports.frequencyByCompanyID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Frequency is invalid'
		});
	}
	Frequency.find({
		company: mongoose.Types.ObjectId(id),
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, frequency) {
		if (err) return next(err);
		if (!frequency) {
			return res.status(404).send({
				message: 'Frequency not found'
			});
		}
		req.frequency = frequency;
		next();
	});
};