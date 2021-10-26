'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
    initializer = require('./init.server.controller.js'),
	mongoose = require('mongoose'),
	Frequency = mongoose.model('Frequency'),
    Repeat = mongoose.model('Repeat'),
	_ = require('lodash');


exports.removeAll = function(req, res) {
	console.log('remove called');
	Repeat.remove({}, function(err) {
		if (err) {
  			return res.status(400).send({
  				message: errorHandler.getErrorMessage(err)
  			});
  		} else {
  			res.json('successfully removed');
  		}
	})
};

/**
 * Retrieve all repeats
 */
exports.all = function(req, res) {
  	initializer.initRepeats(function () {
	    Repeat.find()
	  	.exec(function(err, repeats) {
	  		if (err) {
	  			return res.status(400).send({
	  				message: errorHandler.getErrorMessage(err)
	  			});
	  		} else {
	  			res.json(repeats);
	  		}
	  	});
  	})

};
