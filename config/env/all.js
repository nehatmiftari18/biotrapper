'use strict';

module.exports = {
	app: {
		title: 'BioTrapper',
		description: 'BioTrapper',
		keywords: 'mongodb, express, angularjs, node.js, mongoose, passport'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	// The secret should be set to a non-guessable string that
	// is used to compute a session hash
	sessionSecret: 'BioTrapper',
	// The name of the MongoDB collection to store sessions in
	sessionCollection: 'sessions',
	// The session cookie settings
	sessionCookie: {
		path: '/',
		httpOnly: true,
		// If secure is set to true then it will cause the cookie to be set
		// only when SSL-enabled (HTTPS) is used, and otherwise it won't
		// set a cookie. 'true' is recommended yet it requires the above
		// mentioned pre-requisite.
		secure: false,
		// Only set the maxAge to null if the cookie shouldn't be expired
		// at all. The cookie will expunge when the browser is closed.
		maxAge: 30 * 60 * 1000,
		// To set the cookie in a specific domain uncomment the following
		// setting:
		// domain: 'yourdomain.com'
	},
	// The session cookie name
	sessionName: 'connect.sid',
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
				'public/lib/vis/dist/vis.min.css',
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
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
