'use strict';

// Setting up route
angular.module('sites').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('sites-list', {
			url: '/sites',
			templateUrl: 'modules/sites/views/list-sites.client.view.html'
		}).
		state('site-create', {
			url: '/sites/new',
			templateUrl: 'modules/sites/views/create-site.client.view.html'
		}).
		state('site-detail', {
			url: '/sites/:siteId/edit',
			templateUrl: 'modules/sites/views/create-site.client.view.html'
		});
	}
]);