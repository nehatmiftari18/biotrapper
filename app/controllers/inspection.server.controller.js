'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose'),
	Checklist = mongoose.model('Checklist'),
	Inspection = mongoose.model('Inspection'),
	Site = mongoose.model('Site'),
	Question = mongoose.model('Question'),
	Answer = mongoose.model('Answer'),
	fs = require('fs'),
	path = require('path'),
	uuid = require('uuid'),
	User = mongoose.model('User'),
	nodemailer = require('nodemailer'),
	moment = require('moment-timezone'),
	config = require('../../config/config'),
	async = require('async'),
	Grid    = require('gridfs-stream'),
	sizeOf = require('image-size'),
	sharp = require('sharp'),
	schedule = require('node-schedule'),
	_ = require('lodash');

var zoneOffset = moment.tz.zone('America/New_York').offset(new Date());
var scheduleHour = zoneOffset / 60 + 8;

function validateEmail (email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function getLastInspectionDate (checklist, callback) {
	var query = {isSubmitted: true, checklist: checklist._id};
	Inspection.findOne(query)
		.sort({date: -1})
		.sort({updated: -1})
		.exec(function(err, inspection) {
			if (err) {
				callback(err);
			} else {
				checklist = checklist.toObject();
				if (inspection) {
					checklist.inspection = inspection;
				}
				callback(null, checklist);
			}
		});
}

function getNotifierEmails(checklist, notifiers, callback) {
	User.find({_id: {$in: notifiers}}).select('id email displayName').exec(function(err, users) {
		if (err) {
			callback(err);
		} else {
			checklist.notifiers = users;
			callback(null, checklist);
		}
	});
}

function calculateReminderDueDate(dueDates, reminder) {
	for (var i = 1; i < dueDates.length; i++) {
		var due_date = moment(dueDates[i]).format('YYYY-MM-DD');
		var today = moment().format('YYYY-MM-DD');
		if (reminder.beforeAfterOn == 'On' && moment(today).isSame(moment(due_date))) {
			return due_date
		} else {
			var diff_unit = 'days';
			if (reminder.durationType == 'Week(s)') {
				diff_unit = 'weeks';
			}
			var diff = moment(today).diff(moment(due_date), diff_unit, true);
			if (reminder.beforeAfterOn == 'After' && diff > 0 && diff == reminder.number) {
				return due_date;
			} else if (reminder.beforeAfterOn == 'Before' && diff < 0 && Math.abs(diff) == reminder.number) {
				return due_date;
			}
		}
	}
}

var j = schedule.scheduleJob({hour: scheduleHour, minute: 0}, function(){
	Checklist.find({})
		.populate('site')
		.populate('company')
		.populate('frequency')
		.populate('primary_inspector')
		.populate('secondary_inspector')
		.populate('tertiary_inspector')
		.populate('primary_supervisor')
		.populate('secondary_supervisor')
		.populate('tertiary_supervisor')
		.exec(function(err, checklists) {
		if (checklists && checklists.length > 0) {
			var asyncChecklists = [];
			_.each(checklists, function(checklist) {
				if (checklist.reminders && checklist.reminders.length == 3) {
					asyncChecklists.push(function(cb) {
						getLastInspectionDate(checklist, cb);
					});
				}
			});
			async.parallel(asyncChecklists, function(err, data) {
				var asyncObjs = [];
				_.each(data, function(checklist) {
					var notifier_objIds = [];
					_.each(checklist.reminders, function(reminder) {
						_.each(reminder.notifiers, function(notifier) {
							if (!validateEmail(notifier.id)) {
								notifier_objIds.push(notifier.id);
							}
						});
					});
					asyncObjs.push(function(cb) {
						getNotifierEmails(checklist, notifier_objIds, cb);
					});
				});
				async.parallel(asyncObjs, function(err, final_checklists) {
					_.each(final_checklists, function(checklist) {
						_.each(checklist.reminders, function(reminder) {
							reminder.emails = [];
							_.each(reminder.notifiers, function(notifier) {
								if (!validateEmail(notifier.id)) {
									var notifier_detail = checklist.notifiers.find(function(item) {
										return item._id == notifier.id;
									});
									if (notifier_detail) {
										reminder.emails.push(notifier_detail.email);
									}
								} else {
									reminder.emails.push(notifier.id);
								}
							});
							if (checklist.inspection) {
								var dueDates = checklist.inspection.dueDates;
								var remind_dueDate = calculateReminderDueDate(dueDates, reminder);
								if (remind_dueDate) {
									var dueDateStr = moment(remind_dueDate).format('MM/DD/YYYY');
									var reminder_msg = reminder.customText.replace('[Due Date]', dueDateStr);
									var subject = 'Inspection due today';
									if (reminder.beforeAfterOn == "Before") {
										subject = 'Inspection coming up';
									} else if (reminder.beforeAfterOn == "After") {
										subject = 'Inspection due date passed';
									}
									var siteName = checklist.site.name;
									var frequencyName = checklist.frequency.name;
									var checklistName = checklist.name;
									var primary_inspector = checklist.primary_inspector?checklist.primary_inspector.displayName:'None';
									var secondary_inspector = checklist.secondary_inspector?checklist.secondary_inspector.displayName:'None';
									var tertiary_inspector = checklist.tertiary_inspector?checklist.tertiary_inspector.displayName:'None';
									var primary_supervisor = checklist.primary_supervisor?checklist.primary_supervisor.displayName:'None';
									if (!checklist.primary_supervisor && checklist.primary_supervisor_email != "") {
										primary_supervisor = checklist.primary_supervisor_email;
									}
									var secondary_supervisor = checklist.secondary_supervisor?checklist.secondary_supervisor.displayName:'None';
									if (!checklist.secondary_supervisor && checklist.secondary_supervisor_email != "") {
										secondary_supervisor = checklist.secondary_supervisor_email;
									}
									var tertiary_supervisor = checklist.tertiary_supervisor?checklist.tertiary_supervisor.displayName:'None';
									if (!checklist.tertiary_supervisor && checklist.tertiary_supervisor_email != "") {
										tertiary_supervisor = checklist.tertiary_supervisor_email;
									}
									var emailHTML = '<!DOCTYPE html>' +
										'<html lang="en" xmlns="http://www.w3.org/1999/xhtml">' +
											'<head>' +
											'</head>' +
											'<body style="font-family: Calibri, sans-serif;">' +
												'<p>' + reminder_msg + '</p>' +
												'<strong style="font-size: 18px;">Checklist Name: ' + checklistName + '</strong><br>' +
												'Site: ' + siteName + '<br>' +
												'Required Frequency: '+ frequencyName +'<br>' +
												'<br>' +
												'<strong>Inspectors</strong><br>' +
												'Primary: '+ primary_inspector +'<br>' +
												'Secondary: '+ secondary_inspector +'<br>' +
												'Tertiary: '+ tertiary_inspector +'<br>' +
												'<br>' +
												'<strong>Supervisors</strong><br>' +
												'Primary: '+ primary_supervisor +'<br>' +
												'Secondary: '+ secondary_supervisor +'<br>' +
												'Tertiary: '+ tertiary_supervisor +'<br>' +
											'</body>' +
										'</html>';
									sendInspectionEmail(subject, reminder.emails.join(), emailHTML, function () {
									});
								}
							}
						});
					});
				});
			});
		}
	});
});

Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
var smtpTransport = nodemailer.createTransport(config.mailer.options);

function sendInspectionEmail(subject, email, emailHTML, callback) {
	var mailOptions = {
		to: email,
		from: config.mailer.from,
		subject: subject,
		html: emailHTML
	};
	smtpTransport.sendMail(mailOptions, function(err) {
		if (err) {
			callback(err);
		} else {
			callback(null, 'success');
		}
	});
}

function fetchChecklist(id, callback) {
	Checklist.findById(id)
	.populate('company')
	.populate('site')
	.populate('frequency')
	.populate('questions.question')
	.populate('primary_supervisor')
	.populate('secondary_supervisor')
	.populate('tertiary_supervisor')
	.populate('editor')
	.exec(function(err, checklist) {
		if (err) {
			callback(err);
		} else {
			var asyncItems = [];
			_.each(checklist.questions, function(item) {
				asyncItems.push(function(callback1) {
					Question.populate(item.question,{
						path: 'regulatory_framework',
						select: 'name'
					}, function(err, question){
						callback1(err, question);
					});
				})
			});
			async.parallel(asyncItems, function(err, data) {
				for(var i = 0; i < data.length; i++) {
					checklist.questions[i].question = data[i];
				}
				callback(null, checklist);
			})

		}
	});
}

function fetchUser(id, callback) {
	User.findById(id)
	.populate('company')
	.populate('editor')
	.exec(function(err, user) {
		if (err) {
			callback(err);
		} else {

			callback(null, user);
		}
	});
}

function fetchSite(id, callback) {
	Site.findById(id)
		.exec(function(err, site) {
			if (err) {
				callback(err);
			} else {
				callback(null, site);
			}
		});
}


exports.checkReminders = function(req, res) {
	var emailHtmls = [];
	Checklist.find({})
		.populate('site')
		.populate('company')
		.populate('frequency')
		.populate('primary_inspector')
		.populate('secondary_inspector')
		.populate('tertiary_inspector')
		.populate('primary_supervisor')
		.populate('secondary_supervisor')
		.populate('tertiary_supervisor')
		.exec(function(err, checklists) {
			if (checklists && checklists.length > 0) {
				var asyncChecklists = [];
				_.each(checklists, function(checklist) {
					if (checklist.reminders && checklist.reminders.length == 3) {
						asyncChecklists.push(function(cb) {
							getLastInspectionDate(checklist, cb);
						});
					}
				});
				async.parallel(asyncChecklists, function(err, data) {
					var asyncObjs = [];
					_.each(data, function(checklist) {
						var notifier_objIds = [];
						_.each(checklist.reminders, function(reminder) {
							_.each(reminder.notifiers, function(notifier) {
								if (!validateEmail(notifier.id)) {
									notifier_objIds.push(notifier.id);
								}
							});
						});
						asyncObjs.push(function(cb) {
							getNotifierEmails(checklist, notifier_objIds, cb);
						});
					});
					async.parallel(asyncObjs, function(err, final_checklists) {
						_.each(final_checklists, function(checklist) {
							_.each(checklist.reminders, function(reminder) {
								reminder.emails = [];
								_.each(reminder.notifiers, function(notifier) {
									if (!validateEmail(notifier.id)) {
										var notifier_detail = checklist.notifiers.find(function(item) {
											return item._id == notifier.id;
										});
										if (notifier_detail) {
											reminder.emails.push(notifier_detail.email);
										}
									} else {
										reminder.emails.push(notifier.id);
									}
								});
								if (checklist.inspection) {
									var dueDates = checklist.inspection.dueDates;
									var remind_dueDate = calculateReminderDueDate(dueDates, reminder);
									if (remind_dueDate) {
										var dueDateStr = moment(remind_dueDate).format('MM/DD/YYYY');
										var reminder_msg = reminder.customText.replace('[Due Date]', dueDateStr);
										var subject = 'Inspection due today';
										if (reminder.beforeAfterOn == "Before") {
											subject = 'Inspection coming up';
										} else if (reminder.beforeAfterOn == "After") {
											subject = 'Inspection due date passed';
										}
										var siteName = checklist.site.name;
										var frequencyName = checklist.frequency.name;
										var checklistName = checklist.name;
										var primary_inspector = checklist.primary_inspector?checklist.primary_inspector.displayName:'None';
										var secondary_inspector = checklist.secondary_inspector?checklist.secondary_inspector.displayName:'None';
										var tertiary_inspector = checklist.tertiary_inspector?checklist.tertiary_inspector.displayName:'None';
										var primary_supervisor = checklist.primary_supervisor?checklist.primary_supervisor.displayName:'None';
										if (!checklist.primary_supervisor && checklist.primary_supervisor_email != "") {
											primary_supervisor = checklist.primary_supervisor_email;
										}
										var secondary_supervisor = checklist.secondary_supervisor?checklist.secondary_supervisor.displayName:'None';
										if (!checklist.secondary_supervisor && checklist.secondary_supervisor_email != "") {
											secondary_supervisor = checklist.secondary_supervisor_email;
										}
										var tertiary_supervisor = checklist.tertiary_supervisor?checklist.tertiary_supervisor.displayName:'None';
										if (!checklist.tertiary_supervisor && checklist.tertiary_supervisor_email != "") {
											tertiary_supervisor = checklist.tertiary_supervisor_email;
										}
										var emailHTML = '<!DOCTYPE html>' +
											'<html lang="en" xmlns="http://www.w3.org/1999/xhtml">' +
											'<head>' +
											'</head>' +
											'<body style="font-family: Calibri, sans-serif;">' +
											'<p>' + reminder_msg + '</p>' +
											'<strong style="font-size: 18px;">Checklist Name: ' + checklistName + '</strong><br>' +
											'Site: ' + siteName + '<br>' +
											'Required Frequency: '+ frequencyName +'<br>' +
											'<br>' +
											'<strong>Inspectors</strong><br>' +
											'Primary: '+ primary_inspector +'<br>' +
											'Secondary: '+ secondary_inspector +'<br>' +
											'Tertiary: '+ tertiary_inspector +'<br>' +
											'<br>' +
											'<strong>Supervisors</strong><br>' +
											'Primary: '+ primary_supervisor +'<br>' +
											'Secondary: '+ secondary_supervisor +'<br>' +
											'Tertiary: '+ tertiary_supervisor +'<br>' +
											'</body>' +
											'</html>';
										sendInspectionEmail(subject, reminder.emails.join(), emailHTML, function (err, response) {
											if (err) {
												console.log('error sending email: ', err);
											}
										});
										emailHtmls.push(emailHTML);
									}
								}
							});
						});
						res.send(emailHtmls);
					});
				});
			}
		});
};

/**
 * Create a inspection
 */
exports.create = function(req, res) {
	// console.log('*****', req.body);
	var emailCount = 0;
	var inspection = new Inspection(req.body);
	inspection.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('saved inspection: ', inspection.answers);
			async.parallel({
			    checklist: async.apply(fetchChecklist, inspection.checklist),
			    inspector: async.apply(fetchUser, inspection.editor),
				site: async.apply(fetchSite, inspection.site)
			}, function (error, results) {
			    var checklist = results.checklist;
			    var inspector = results.inspector;
				var site = results.site;
				var emailInspectionDate = moment(inspection.date).tz('America/New_York');
				emailInspectionDate = emailInspectionDate.format('MM/DD/YYYY');
				var submissionDate = moment(inspection.created).tz('America/New_York');
				var submissionDateStr = submissionDate.format('MM/DD/YYYY HH:mm z');
				var nowDate = moment().tz('America/New_York');
				var nowDateStr = nowDate.format('MM/DD/YYYY HH:mm z');
				var primary_questions = [];
				var template_path = 'templates/inspection-email';
				var maillist = [];
				if (checklist.primary_supervisor) {
					maillist.push(checklist.primary_supervisor.email);
				} else {
					if (checklist.primary_supervisor_email && checklist.primary_supervisor_email != "") {
						maillist.push(checklist.primary_supervisor_email);
					}
				}
				if (checklist.secondary_supervisor) {
					maillist.push(checklist.secondary_supervisor.email);
				} else {
					if (checklist.secondary_supervisor_email && checklist.secondary_supervisor_email != "") {
						maillist.push(checklist.secondary_supervisor_email);
					}
				}
				if (checklist.tertiary_supervisor) {
					maillist.push(checklist.tertiary_supervisor.email);
				} else {
					if (checklist.tertiary_supervisor_email && checklist.tertiary_supervisor_email != "") {
						maillist.push(checklist.tertiary_supervisor_email);
					}
				}
				for (var i = 0; i < inspection.answers.length; i++) {
					var data = inspection.answers[i].data;
					if (!data || !data.data) continue;
					if ((data.action && data.action.action === 'action_email') ||
						(data.subAction && data.subAction.action === 'action_email')) {
						var answer;
						if (checklist.questions[i].question.questionType == 'Yes/No') {
							if (data.data.main_switchStatus == 'yes')
								answer = 'YES';
							else if (data.data.main_switchStatus == 'no')
								answer = 'NO';
							else
								answer = '';
						} else if (checklist.questions[i].question.questionType == 'Yes/No/NA') {
							if (data.data.main_switchStatus == 'yes')
								answer = 'YES';
							else if (data.data.main_switchStatus == 'no')
								answer = 'NO';
							else if (data.data.main_switchStatus == 'na')
								answer = 'NA';
							else
								answer = '';
						} else if (checklist.questions[i].question.questionType == 'Numeric') {
							answer = data.data.main_number;
						} else if (checklist.questions[i].question.questionType == 'Single') {
							answer = data.data.main_single.value;
						} else if (checklist.questions[i].question.questionType == 'Date') {
							answer = moment(data.data.main_date).format('MM/DD/YYYY');
						} else if (checklist.questions[i].question.questionType == 'Text') {
							answer = data.data.main_text;
						}

						var action;
						if (data.action.action=='action_email') {
							action = 'Notify Supervisor';
						} else if (data.action.action=='action_sub') {
							action = 'Go to sub-question';
						} else if (data.action.action=='action_custom') {
							action = 'Display custom text';
						} else if (data.action.action=='action_no') {
							action = 'Take no action';
						}
						var picture_url = [];
						if (data.data.pictureURL) {
							if (typeof data.data.pictureURL == 'string') {
								picture_url.push({
									url: req.protocol + '://' + req.get('host') + '/pictures/' + data.data.pictureURL,
									name: data.data.pictureURL
								});
							} else if (data.data.pictureURL.length > 0) {
								_.each(data.data.pictureURL, function(item) {
									picture_url.push({
										url: req.protocol + '://' + req.get('host') + '/pictures/' + item,
										name: item
									});
								});
							}
						}

						var geoInfo = [];
						if (data.data.position) {
							data.data.position = [].concat( data.data.position );
							_.each(data.data.position, function(position) {
								geoInfo.push('Latitude: ' + position.latitude + ', Longitude: ' + position.longitude);
							});
						}
						var comment = data.data.comment ? data.data.comment : '';

						var subQuestionText = '';
						var subAnswer = '';
						var subAction = '';
						var subCustomText = '';
						if (data.action && data.action.action == 'action_sub') {
							subQuestionText = checklist.questions[i].question.subQuestions[0].text;
						}
						if (data.subAction) {
							if (data.subAction.action == 'action_email') {
								if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No') {
									if (data.data.sub_switchStatus == 'yes')
										subAnswer = 'YES';
									else if (data.data.sub_switchStatus == 'no')
										subAnswer = 'NO';
									else
										subAnswer = '';
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No/NA') {
									if (data.data.sub_switchStatus == 'yes')
										subAnswer = 'YES';
									else if (data.data.sub_switchStatus == 'no')
										subAnswer = 'NO';
									else if (data.data.sub_switchStatus == 'na')
										subAnswer = 'NA';
									else
										subAnswer = '';
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Numeric') {
									subAnswer = data.data.sub_number;
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Single') {
									subAnswer = data.data.sub_single.value;
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Date') {
									subAnswer = moment(data.data.sub_date).format('MM/DD/YYYY');
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Text') {
									subAnswer = data.data.sub_text;
								}
								if (data.subAction.action=='action_email') {
									subAction = 'Notify Supervisor';
								} else if (data.subAction.action=='action_sub') {
									subAction = 'Go to sub-question';
								} else if (data.subAction.action=='action_custom') {
									subAction = 'Display custom text';
									subCustomText = data.subAction.customText;
								} else if (data.subAction.action=='action_no') {
									subAction = 'Take no action';
								}
							}
						}
						primary_questions.push({
							question: checklist.questions[i].question.text,
							regularity: checklist.questions[i].question.regulatory_framework?checklist.questions[i].question.regulatory_framework.name:'Non-regulatory',
							answer: answer,
							action: action,
							pictureUrl: picture_url,
							geo_info: geoInfo,
							comment: comment,
							subQuestionText: subQuestionText,
							subAnswer: subAnswer,
							subAction: subAction,
							subCustomText: subCustomText,
							isGeoTag: checklist.questions[i].question.isGeoTag,
							isPhoto: checklist.questions[i].question.isPhoto,
							isComment: checklist.questions[i].question.isComment,
							question_index: i
						});
					}
				}

				res.render(template_path, {
					inspectorName: req.user.displayName,
					SiteName: site.name,
					inspectionDate: emailInspectionDate,
					submissionDate: submissionDateStr,
					checklist: checklist.name,
					frequency: checklist.frequency.name,
					questions: primary_questions,
					dateString: nowDateStr,
					url: 'http://' + req.headers.host + '/inspections/full_inspection/' + inspection._id
				}, function(err, emailHTML) {
					if (inspector.supervisor) {
						maillist.push(inspector.supervisor.email);
					}
					if (inspection.isSubmitted && maillist.length > 0) {
						var to = maillist.join();
						var subject = 'BioTrapper notification email';
						sendInspectionEmail(subject, to, emailHTML, function(err, response){
							if (err) {
								console.log('error sending email: ', err);
								res.status(400).send({
									message: 'Failed to send email'
								});
							} else {
								console.log('success sending email: ', response);
								res.json(inspection);
							}
						});
					} else {
						res.json(inspection)
					}
				});
			});
		}
	});
};

exports.fullInspectionView = function(req, res) {
	var inspection = req.inspection;
	async.parallel({
		checklist: async.apply(fetchChecklist, inspection.checklist),
		inspector: async.apply(fetchUser, inspection.editor),
		site: async.apply(fetchSite, inspection.site)
	}, function (error, results) {
		var checklist = results.checklist;
		var inspector = results.inspector;
		var site = results.site;
		var emailInspectionDate = moment(inspection.date).tz('America/New_York');
		emailInspectionDate = emailInspectionDate.format('MM/DD/YYYY');
		var submissionDate = moment(inspection.created).tz('America/New_York');
		var submissionDateStr = submissionDate.format('MM/DD/YYYY HH:mm z');
		var nowDate = moment().tz('America/New_York');
		var nowDateStr = nowDate.format('MM/DD/YYYY HH:mm z');
		var primary_questions = [];
		var template_path = 'templates/full-inspection';
		if (checklist.questions.length > 0) {
			for (var i = 0; i < inspection.answers.length; i++) {
				var data = inspection.answers[i].data;
				if (!data || !data.data) continue;
				var answer;
				if (checklist.questions[i].question.questionType == 'Yes/No') {
					if (data.data.main_switchStatus == 'yes')
						answer = 'YES';
					else if (data.data.main_switchStatus == 'no')
						answer = 'NO';
					else
						answer = '';
				} else if (checklist.questions[i].question.questionType == 'Yes/No/NA') {
					if (data.data.main_switchStatus == 'yes')
						answer = 'YES';
					else if (data.data.main_switchStatus == 'no')
						answer = 'NO';
					else if (data.data.main_switchStatus == 'na')
						answer = 'NA';
					else
						answer = '';
				} else if (checklist.questions[i].question.questionType == 'Numeric') {
					answer = data.data.main_number;
				} else if (checklist.questions[i].question.questionType == 'Single') {
					answer = data.data.main_single.value;
				} else if (checklist.questions[i].question.questionType == 'Date') {
					answer = moment(data.data.main_date).format('MM/DD/YYYY');
				} else if (checklist.questions[i].question.questionType == 'Text') {
					answer = data.data.main_text;
				}

				var action = "";
				var customText = "";
				if (data.action) {
					if (data.action.action == 'action_email') {
						action = 'Notify Supervisor';
					} else if (data.action.action == 'action_sub') {
						action = 'Go to sub-question';
					} else if (data.action.action == 'action_custom') {
						action = 'Display custom text';
						customText = data.action.customText;
					} else if (data.action.action == 'action_no') {
						action = 'Take no action';
					}
				}

				var picture_url = [];
				if (data.data.pictureURL) {
					if (typeof data.data.pictureURL == 'string') {
						picture_url.push({
							url: req.protocol + '://' + req.get('host') + '/pictures/' + data.data.pictureURL,
							name: data.data.pictureURL
						});
					} else if (data.data.pictureURL.length > 0) {
						_.each(data.data.pictureURL, function(item) {
							picture_url.push({
								url: req.protocol + '://' + req.get('host') + '/pictures/' + item,
								name: item
							});
						});
					}
				}
				var geoInfo = [];
				if (data.data.position) {
					data.data.position = [].concat( data.data.position );
					_.each(data.data.position, function(position) {
						geoInfo.push('Latitude: ' + position.latitude + ', Longitude: ' + position.longitude);
					});
				}
				var comment = data.data.comment ? data.data.comment : '';

				var subQuestionText = '';
				var subAnswer = '';
				var subAction = '';
				var subCustomText = '';
				if (data.action && data.action.action == 'action_sub') {
					subQuestionText = checklist.questions[i].question.subQuestions[0].text;
				}
				if (data.subAction) {
					if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No') {
						if (data.data.sub_switchStatus == 'yes')
							subAnswer = 'YES';
						else if (data.data.sub_switchStatus == 'no')
							subAnswer = 'NO';
						else
							subAnswer = '';
					} else if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No/NA') {
						if (data.data.sub_switchStatus == 'yes')
							subAnswer = 'YES';
						else if (data.data.sub_switchStatus == 'no')
							subAnswer = 'NO';
						else if (data.data.sub_switchStatus == 'na')
							subAnswer = 'NA';
						else
							subAnswer = '';
					} else if (checklist.questions[i].question.subQuestions[0].type == 'Numeric') {
						subAnswer = data.data.sub_number;
					} else if (checklist.questions[i].question.subQuestions[0].type == 'Single') {
						subAnswer = data.data.sub_single.value;
					} else if (checklist.questions[i].question.subQuestions[0].type == 'Date') {
						subAnswer = moment(data.data.sub_date).format('MM/DD/YYYY');
					} else if (checklist.questions[i].question.subQuestions[0].type == 'Text') {
						subAnswer = data.data.sub_text;
					}
					if (data.subAction.action == 'action_email') {
						subAction = 'Notify Supervisor';
					} else if (data.subAction.action == 'action_sub') {
						subAction = 'Go to sub-question';
					} else if (data.subAction.action == 'action_custom') {
						subAction = 'Display custom text';
						subCustomText = data.subAction.customText;
					} else if (data.subAction.action == 'action_no') {
						subAction = 'Take no action';
					}
				}
				primary_questions.push({
					question: checklist.questions[i].question.text,
					regularity: checklist.questions[i].question.regulatory_framework ? checklist.questions[i].question.regulatory_framework.name : 'Non-regulatory',
					answer: answer,
					action: action,
					customText: customText,
					pictureUrl: picture_url,
					geo_info: geoInfo,
					comment: comment,
					subQuestionText: subQuestionText,
					subAnswer: subAnswer,
					subAction: subAction,
					subCustomText: subCustomText,
					isGeoTag: checklist.questions[i].question.isGeoTag,
					isPhoto: checklist.questions[i].question.isPhoto,
					isComment: checklist.questions[i].question.isComment,
					question_index: i
				});
			}
		}

		res.render(template_path, {
			inspectorName: inspection.editor.displayName,
			SiteName: site.name,
			inspectionDate: emailInspectionDate,
			submissionDate: submissionDateStr,
			checklist: checklist.name,
			frequency: checklist.frequency.name,
			questions: primary_questions,
			dateString: nowDateStr
		}, function(err, emailHTML) {
			res.send(emailHTML)
		});
	});
};

exports.getLatestInspection = function(req, res) {
	var checklistId = req.params.checklistId;

	Inspection.findOne({checklist: checklistId, isSubmitted: true})
		.populate('checklist')
		.populate('site')
		.populate('editor')
		.sort('-date')
		.sort('-updated')
		.exec(function(err, inspection) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				async.parallel({
					checklist: async.apply(fetchChecklist, inspection.checklist),
					inspector: async.apply(fetchUser, inspection.editor),
					site: async.apply(fetchSite, inspection.site)
				}, function (error, results) {
					var checklist = results.checklist;
					var inspector = results.inspector;
					var site = results.site;
					var emailInspectionDate = moment(inspection.date).tz('America/New_York');
					var submissionDate = moment(inspection.created).tz('America/New_York');
					var nowDate = moment().tz('America/New_York');

					emailInspectionDate = emailInspectionDate.format('MM/DD/YYYY');

					var submissionDateStr = submissionDate.format('MM/DD/YYYY HH:mm z');
					var nowDateStr = nowDate.format('MM/DD/YYYY HH:mm z');
					var primary_questions = [];
					var template_path = 'templates/full-inspection';
					if (checklist.questions.length > 0) {
						for (var i = 0; i < inspection.answers.length; i++) {
							var data = inspection.answers[i].data;
							if (!data || !data.data) continue;
							var answer;
							if (checklist.questions[i].question.questionType == 'Yes/No') {
								if (data.data.main_switchStatus == 'yes')
									answer = 'YES';
								else if (data.data.main_switchStatus == 'no')
									answer = 'NO';
								else
									answer = '';
							} else if (checklist.questions[i].question.questionType == 'Yes/No/NA') {
								if (data.data.main_switchStatus == 'yes')
									answer = 'YES';
								else if (data.data.main_switchStatus == 'no')
									answer = 'NO';
								else if (data.data.main_switchStatus == 'na')
									answer = 'NA';
								else
									answer = '';
							} else if (checklist.questions[i].question.questionType == 'Numeric') {
								answer = data.data.main_number;
							} else if (checklist.questions[i].question.questionType == 'Single') {
								answer = data.data.main_single.value;
							} else if (checklist.questions[i].question.questionType == 'Date') {
								answer = moment(data.data.main_date).format('MM/DD/YYYY');
							} else if (checklist.questions[i].question.questionType == 'Text') {
								answer = data.data.main_text;
							}

							var action = "";
							var customText = "";
							if (data.action) {
								if (data.action.action == 'action_email') {
									action = 'Notify Supervisor';
								} else if (data.action.action == 'action_sub') {
									action = 'Go to sub-question';
								} else if (data.action.action == 'action_custom') {
									action = 'Display custom text';
									customText = data.action.customText;
								} else if (data.action.action == 'action_no') {
									action = 'Take no action';
								}
							}

							var picture_url = [];
							if (data.data.pictureURL) {
								if (typeof data.data.pictureURL == 'string') {
									picture_url.push({
										url: req.protocol + '://' + req.get('host') + '/pictures/' + data.data.pictureURL,
										name: data.data.pictureURL
									});
								} else if (data.data.pictureURL.length > 0) {
									_.each(data.data.pictureURL, function(item) {
										picture_url.push({
											url: req.protocol + '://' + req.get('host') + '/pictures/' + item,
											name: item
										});
									});
								}
							}
							var geoInfo = [];
							if (data.data.position) {
								data.data.position = [].concat( data.data.position );
								_.each(data.data.position, function(position) {
									geoInfo.push('Latitude: ' + position.latitude + ', Longitude: ' + position.longitude);
								});
							}
							var comment = data.data.comment ? data.data.comment : '';

							var subQuestionText = '';
							var subAnswer = '';
							var subAction = '';
							var subCustomText = '';
							if (data.action && data.action.action == 'action_sub') {
								subQuestionText = checklist.questions[i].question.subQuestions[0].text;
							}
							if (data.subAction) {
								if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No') {
									if (data.data.sub_switchStatus == 'yes')
										subAnswer = 'YES';
									else if (data.data.sub_switchStatus == 'no')
										subAnswer = 'NO';
									else
										subAnswer = '';
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Yes/No/NA') {
									if (data.data.sub_switchStatus == 'yes')
										subAnswer = 'YES';
									else if (data.data.sub_switchStatus == 'no')
										subAnswer = 'NO';
									else if (data.data.sub_switchStatus == 'na')
										subAnswer = 'NA';
									else
										subAnswer = '';
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Numeric') {
									subAnswer = data.data.sub_number;
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Single') {
									subAnswer = data.data.sub_single.value;
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Date') {
									subAnswer = moment(data.data.sub_date).format('MM/DD/YYYY');
								} else if (checklist.questions[i].question.subQuestions[0].type == 'Text') {
									subAnswer = data.data.sub_text;
								}
								if (data.subAction.action == 'action_email') {
									subAction = 'Notify Supervisor';
								} else if (data.subAction.action == 'action_sub') {
									subAction = 'Go to sub-question';
								} else if (data.subAction.action == 'action_custom') {
									subAction = 'Display custom text';
									subCustomText = data.subAction.customText;
								} else if (data.subAction.action == 'action_no') {
									subAction = 'Take no action';
								}
							}
							primary_questions.push({
								question: checklist.questions[i].question.text,
								regularity: checklist.questions[i].question.regulatory_framework ? checklist.questions[i].question.regulatory_framework.name : 'Non-regulatory',
								answer: answer,
								action: action,
								customText: customText,
								pictureUrl: picture_url,
								geo_info: geoInfo,
								comment: comment,
								subQuestionText: subQuestionText,
								subAnswer: subAnswer,
								subAction: subAction,
								subCustomText: subCustomText,
								isGeoTag: checklist.questions[i].question.isGeoTag,
								isPhoto: checklist.questions[i].question.isPhoto,
								isComment: checklist.questions[i].question.isComment,
								question_index: i
							});
						}
					}

					res.json({
						inspectorName: inspection.editor.displayName,
						SiteName: site.name,
						inspectionDate: emailInspectionDate,
						submissionDate: submissionDateStr,
						checklist: checklist.name,
						frequency: checklist.frequency.name,
						questions: primary_questions,
						dateString: nowDateStr
					});
				});
			}
		});
};

/**
 * Retrieve all inspections
 */
exports.all = function(req, res) {
	Inspection.find()
	.populate('checklist')
	.populate('framework')
	.populate('site')
	.populate('editor')
	.exec(function(err, inspections) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(inspections);
		}
	});
};

/**
 * Retrieve all active inspections
 */
exports.allActive = function(req, res) {
	Inspection.find({status: true})
	.populate('checklist')
	.populate('framework')
	.populate('site')
	.populate('editor')
	.exec(function(err, inspections) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(inspections);
		}
	});
};


/**
 * Show the current inspection
 */
exports.read = function(req, res) {
	res.json(req.inspection);
};

/**
 * Upload picture and return url
 */
exports.savePicture = function(req, res) {
	var file = req.files.file;
	console.log('file info: ', file);

	var tmpPath = file.path;
	var dimensions = sizeOf(tmpPath);
	var fileName = uuid.v4() + '.jpg';
	var resizeTransform = sharp().jpeg({quality: 60});
	if (dimensions.width > 1280) {
		var newWidth = 1280;
		var newHeight = Math.round(dimensions.height * (newWidth / dimensions.width));
		resizeTransform = sharp().resize(newWidth, newHeight).jpeg({quality: 60});
	}
	var is = fs.createReadStream(tmpPath);

	var writestream = gfs.createWriteStream({ filename: fileName, mode: 'w', content_type: "image/jpeg" });

	is.pipe(resizeTransform).pipe(writestream);
	writestream.on('error', function(err) {
		return res.status(400).send({
			message: 'File was not uploaded.'
		});
	});
	writestream.on('close', function() {
		fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json({file: fileName});
			}

		});
	});
};

/**
 * Update a inspection
 */
exports.update = function(req, res) {
	var inspection = req.inspection;

	inspection = _.extend(inspection, req.body);

	inspection.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(inspection);
		}
	});
};

/**
 * Delete an inspection
 */
exports.delete = function(req, res) {
	var inspection = req.inspection;

	inspection.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(inspection);
		}
	});
};

/**
 * Inspection middleware
 */
exports.inspectionByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Inspection is invalid'
		});
	}

	Inspection.findById(id)
	.populate('site')
	.populate('checklist')
	.populate('framework')
	.populate('editor')
	.exec(function(err, inspection) {
		if (err) return next(err);
		if (!inspection) {
			return res.status(404).send({
				message: 'Inspection not found'
			});
		}
		req.inspection = inspection;
		next();
	});
};

exports.inspectionByUserID = function(req, res, next, id) {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Inspection is invalid'
		});
	}
	Inspection.find({
		editor: mongoose.Types.ObjectId(id),
		status: true
	})
	.populate('site')
	.populate('checklist')
	.populate('framework')
	.populate('editor')
	.exec(function(err, inspection) {
		if (err) return next(err);
		if (!inspection) {
			return res.status(404).send({
				message: 'Inspection not found'
			});
		}
		req.inspection = inspection;
		next();
	});
};


exports.saveQuestionAnswer = function(req, res) {
	Answer.findOne({
		checklist: mongoose.Types.ObjectId(req.body.checklist),
		site: mongoose.Types.ObjectId(req.body.site),
		editor: req.user,
		question: mongoose.Types.ObjectId(req.body.question)
	}).exec(function(err, answer_data) {
		if(answer_data) {
			answer_data = _.extend(answer_data, req.body);
		} else {
			 answer_data = new Answer(req.body);
			 answer_data.editor = req.user;
		}
		answer_data.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json({success: true});
			}
		});
	});
};

/**
 * Retrieve last and next inspection dates
 */
exports.getDueDates = function(req, res) {
	var checklistId = req.checklistId;
	var query = {checklist: checklistId};
	if (req.params.isSubmitted == 1) {
		query = {isSubmitted: true, checklist: checklistId};
	}
	if (req.params.isSubmitted == -1) {
		query = {checklist: checklistId};
	}
	if(req.query.fetch) {
		Inspection.find(query)
			.sort({date: -1})
			.sort({updated: -1})
			.exec(function(err, inspections) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(inspections);
				}
			});
	} else {
		if (req.params.isSubmitted == -1) {
			Inspection.findOne(query)
				.sort({updated: -1})
				.exec(function(err, inspection) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.json(inspection);
					}
				});
		} else {
			Inspection.findOne(query)
				.sort({date: -1})
				.sort({updated: -1})
				.exec(function(err, inspection) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						res.json(inspection);
					}
				});
		}
	}

};

exports.getImageData = function(req, res) {
	gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {

		if(files.length===0){
			return res.status(400).send({
				message: 'File not found'
			});
		}
		if (files[0].contentType == 'jpg') {
			files[0].contentType = "image/jpeg";
		}
		res.writeHead(200, {'Content-Type': files[0].contentType});

		var readstream = gfs.createReadStream({
			filename: files[0].filename
		}).pipe(res);
	});
};
