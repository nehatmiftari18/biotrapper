'use strict';

// Setting up route
angular.module('regulatories').config(['$stateProvider',
	function($stateProvider) {
		// regulatories state routing
		$stateProvider.
		state('regulatory_list', {
			url: '/regulatories',
			templateUrl: 'modules/regulatory/views/list-regulatories.client.view.html'
		}).
		state('regulatory_create', {
			url: '/regulatories/new',
			templateUrl: 'modules/regulatory/views/create-regulatory.client.view.html'
		}).
		state('regulatory_detail', {
			url: '/regulatories/:regulatoryId/edit',
			templateUrl: 'modules/regulatory/views/create-regulatory.client.view.html'
		});
	}
]);