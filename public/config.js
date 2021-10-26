'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['angular-loading-bar', 'ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'smart-table', 'ngTagsInput', 'toggle-switch', 'angularjs-dropdown-multiselect', 'ngFileUpload', 'bootstrapLightbox', 'flow', 'ngVis'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
