'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Company = mongoose.model('Company'),
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * Question Schema
 */
var QuestionSchema = new Schema({
	text: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in the question text.']
	},
	company: { type: Schema.Types.ObjectId, ref: 'Company' },
	regulatory: {
		type: Boolean,
		default: true,
	},
	regulatory_framework: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Regulatory' }],
		default: []
	},
	keywords: [{
		type: String,
		trim: true,
	}],
	citation: {
		type: String,
		default: ''
	},
	note: {
		type: String,
		default: ''
	},
	checklists: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Checklist' }],
		default: []
	},
	questionType: {
		type: String,
		validate: [validateLocalStrategyProperty, 'Please select question type.']
	},
	numericUnit: String,
	conditionalActions: Array,
	subQuestions: Array,
	isComment: Boolean,
	isPhoto: Boolean,
	isGeoTag: Boolean,
	isMedia: Boolean,
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

mongoose.model('Question', QuestionSchema);
