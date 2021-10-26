'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	async = require('async'),
	Repeat = mongoose.model('Repeat');

function createRepeats() {
	async.waterfall([
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Daily",
				displayOrdinal: 1,
				every: "Day",
				ranges: 1,
				rangeType: "time",
				dueBy: "time"
			}, function(err, model) {
				callback(err);
			})
		},
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Weekly",
				every: "Week",
				displayOrdinal: 2,
				ranges: 1,
				rangeType: "day of week",
				incrementDays: 7,
				dueBy: "day of week"
			}, function(err, model) {
				callback(err);
			})
		},
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Bi-weekly",
				every: "Other Week",
				displayOrdinal: 3,
				ranges: 1,
				rangeType: "day of week",
				incrementDays: 14,
				dueBy: "day of week"
			}, function(err, model) {
				callback(err);
			})
		},
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Monthly",
				every: "Month",
				displayOrdinal: 4,
				ranges: 1,
				rangeType: "day of month",
				incrementDays: 30,
				dueBy: "week of month and day of week"
			}, function(err, model) {
				callback(err);
			})
		},
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Quarterly",
				every: "Quarter",
				displayOrdinal: 5,
				ranges: 4,
				rangeType: "month and day",
				incrementDays: 90,
				dueBy: "day of quarter"
			}, function(err, model) {
				callback(err);
			})
		},
		function(callback) {
			Repeat.create({
				_id: mongoose.Types.ObjectId(),
				name: "Annually",
				every: "Year",
				displayOrdinal: 6,
				ranges: 1,
				rangeType: "month and day",
				incrementDays: 365
			}, function(err, model) {
				callback(err);
			})
		}
	], function(err, result) {
		// console.log(result);
	});
}

exports.initRepeats = function(next) {
	Repeat.find().exec(function(err, docs) {
	  	console.log(err);
		if (docs.length === 0) {
			createRepeats();
		}
		next();
	});
};
