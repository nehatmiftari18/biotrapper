'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller.js'),
	_ = require('lodash'),
  config = require('../../config/config'),
  nodemailer = require('nodemailer');

  var smtpTransport = nodemailer.createTransport(config.mailer.options);

exports.sendTestEmail = function(req, res) {

  var mailOptions = {
  	to: "marcie@techsymphonic.com",
  	from: config.mailer.from,
  	subject: 'Testing via application',
  	text: 'Received via PostMark.  Yay.'
  };
  smtpTransport.sendMail(mailOptions, function(err) {
  	if (err) {
      console.log(err);
  		return res.status(400).send({
  			message: 'Failed to send email.'
      });
    } else {
      res.send('Email sent.', 200);
    }
  });

};
