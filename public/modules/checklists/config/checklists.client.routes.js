'use strict';

// Setting up route
angular.module('checklists').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('checklists', {
			url: '/checklists',
			templateUrl: 'modules/checklists/views/checklists.client.view.html'
		}).
		state('checklist_create', {
			url: '/checklists/new',
			templateUrl: 'modules/checklists/views/build-checklist.client.view.html'
		}).
		state('checklist_detail', {
			url: '/checklists/:checklistId/edit',
			templateUrl: 'modules/checklists/views/build-checklist.client.view.html'
		});
	}
]);