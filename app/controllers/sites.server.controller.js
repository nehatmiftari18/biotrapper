'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Site = mongoose.model('Site'),
	_ = require('lodash');

/**
 * Create a site
 */
exports.create = function(req, res) {
	var site = new Site(req.body);

	site.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(site);
		}
	});
};

/**
 * Retrieve all sites
 */
exports.all = function(req, res) {
	Site.find()
	.populate('company')
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
	Site.find({status: true})
	.populate('company')
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
 * Show the current site
 */
exports.read = function(req, res) {
	res.json(req.site);
};

/**
 * Update a site
 */
exports.update = function(req, res) {
	var site = req.site;

	site = _.extend(site, req.body);

	site.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(site);
		}
	});
};

/**
 * Delete an site
 */
exports.delete = function(req, res) {
	var site = req.site;

	site.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(site);
		}
	});
};

/**
 * Site middleware
 */
exports.siteByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Site is invalid'
		});
	}

	Site.findById(id)
	.populate('company')
	.populate('editor')
	.exec(function(err, site) {
		if (err) return next(err);
		if (!site) {
			return res.status(404).send({
				message: 'Site not found'
			});
		}
		req.site = site;
		next();
	});
};

exports.siteByCompanyID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Site is invalid'
		});
	}
	Site.find({
		company: mongoose.Types.ObjectId(id),
		status: true
	})
	.populate('company')
	.populate('editor')
	.exec(function(err, site) {
		if (err) return next(err);
		if (!site) {
			return res.status(404).send({
				message: 'Site not found'
			});
		}
		req.site = site;
		next();
	});
};