'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', 'flowFactoryProvider', 'cfpLoadingBarProvider',
	function($locationProvider, flowFactoryProvider, cfpLoadingBarProvider) {
		$locationProvider.hashPrefix('!');
		flowFactoryProvider.defaults = {
			target: function (FlowFile, FlowChunk, isTest) {
				return 'inspections/savePicture'
			},
			testChunks: false,
			permanentErrors: [404, 500, 501],
			maxChunkRetries: 1,
			chunkRetryInterval: 5000,
			simultaneousUploads: 4,
			chunkSize: 1024 * 1024 * 1024
		};
		cfpLoadingBarProvider.includeSpinner = true;
	}
]).filter('matchInactivateStatus', function() {
	return function( items, inactivateStatus ) {
		var filtered = [];
		if(inactivateStatus) {
			angular.forEach(items, function (item) {
				if (item.status) {
					filtered.push(item);
				}
			});

		} else {
			filtered = items;
		}
		return filtered;
	};
});

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	// Fixing google bug with redirect
	if (window.location.href[window.location.href.length - 1] === '#' &&
			// for just the error url (origin + /#)
			(window.location.href.length - window.location.origin.length) === 2) {
			window.location.href = window.location.origin + '/#!';
	}

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
