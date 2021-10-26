'use strict';

module.exports = {
	db: {
		uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/heroku_hcxsv1fd',
		//uri: 'mongodb://heroku_hcxsv1fd:redtvqjipi5orosmm4g1t696ev@ds135497-a0.mlab.com:35497/heroku_hcxsv1fd',
		options: {
			user: '',
			pass: ''
		}
	},
	log: {
		// Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
		format: 'combined',
		// Stream defaults to process.stdout
		// Uncomment to enable logging to a log on the file system
		options: {
			stream: 'access.log'
		}
	},
	assets: {
		lib: {
			css: [
				// 'https://cdn.datatables.net/t/dt/dt-1.10.11/datatables.min.css',
				//'public/lib/bootstrap/dist/css/bootstrap.css',
				//'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/angular-tags/ng-tags-input.min.css',
				'public/lib/angular-tags/ng-tags-input.bootstrap.min.css',
				'public/lib/angular-toggle-switch/style/bootstrap3/angular-toggle-switch-bootstrap-3.css',
				'public/lib/angular-loading-bar/build/loading-bar.css',
				'public/lib/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.min.css',
				'public/lib/vis/dist/vis.min.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'public/lib/lodash/dist/lodash.compat.js',
				'public/lib/ng-file-upload/FileAPI.min.js',
				'public/lib/ng-file-upload/ng-file-upload-shim.min.js',
				'public/lib/angular/angular.js',
				'public/lib/ng-file-upload/ng-file-upload.min.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/moment/min/moment.min.js',
				'public/lib/moment-timezone/builds/moment-timezone-with-data.min.js',
				'public/lib/jsPDF/jspdf.min.js',
				'public/lib/angular-smart-table/dist/smart-table.min.js',
				'public/lib/angular-tags/ng-tags-input.min.js',
				'public/lib/angular-toggle-switch/angular-toggle-switch.min.js',
				// 'public/lib/angularjs-dropdown-multiselect/dist/angularjs-dropdown-multiselect.min.js'
				'public/lib/angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-loading-bar/build/loading-bar.js',
				'public/lib/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.min.js',
				'public/lib/ng-flow/dist/ng-flow-standalone.min.js',
				'public/lib/vis/dist/vis.min.js',
				'public/lib/angular-visjs/angular-vis.js',
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.js'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || 'APP_ID',
		clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
		callbackURL: '/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
		clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
		callbackURL: '/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || 'APP_ID',
		clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
		callbackURL: '/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: '/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: '/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
