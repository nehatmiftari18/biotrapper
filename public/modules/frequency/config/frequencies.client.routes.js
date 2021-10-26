'use strict';

// Setting up route
angular.module('frequencies').config(['$stateProvider',
	function($stateProvider) {
		// frequencies state routing
		$stateProvider.
		state('frequency_list', {
			url: '/frequencies',
			templateUrl: 'modules/frequency/views/list-frequencies.client.view.html'
		}).
		state('frequency_create', {
			url: '/frequencies/new',
			templateUrl: 'modules/frequency/views/create-frequency.client.view.html'
		}).
		state('frequency_detail', {
			url: '/frequencies/:frequencyId/edit',
			templateUrl: 'modules/frequency/views/create-frequency.client.view.html'
		});
	}
]);