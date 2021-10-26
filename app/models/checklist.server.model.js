'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
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
var ChecklistSchema = new Schema({
	name: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in the question text.']
	},
	company: { type: Schema.Types.ObjectId, ref: 'Company' },
	keywords: {
		type: [String],
		trim: true,
	},
	citation: {
		type: String,
		default: ''
	},
	note: {
		type: String,
		default: ''
	},
	site: { type: Schema.Types.ObjectId, ref: 'Site' },
	frequency: { type: Schema.Types.ObjectId, ref: 'Frequency' },
	questions: [{
		order: Number,
		mandatory: Boolean,
		question: {
			type: Schema.Types.ObjectId, ref: 'Question'
		}
	}],
	updated: {
		type: Date,
		default: Date.now
	},
	primary_inspector: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	secondary_inspector: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	tertiary_inspector: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	primary_supervisor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	secondary_supervisor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	tertiary_supervisor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	primary_supervisor_email: {
		type: String,
		default: ''
	},
	secondary_supervisor_email: {
		type: String,
		default: ''
	},
	tertiary_supervisor_email: {
		type: String,
		default: ''
	},
	reminders:[],
	editor: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	created: {
		type: Date,
		default: Date.now
	},
	answers: []
});

mongoose.model('Checklist', ChecklistSchema);
