'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Answer Schema
 */
var AnswerSchema = new Schema({
	question: {
		type: Schema.Types.ObjectId,
		ref: 'Question'
	},
	checklist: {
		type: Schema.Types.ObjectId,
		ref: 'Checklist'
	},
	site: {
		type: Schema.Types.ObjectId,
		ref: 'Site'
	},
	answer: Object,
	updated: {
		type: Date,
		default: Date.now
	},
	editor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Answer', AnswerSchema);
