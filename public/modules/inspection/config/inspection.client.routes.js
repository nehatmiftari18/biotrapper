'use strict';

// Setting up route
angular.module('inspection').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('inspectionHome', {
			url: '/inspection',
			templateUrl: 'modules/inspection/views/inspection.client.view.html'
		}).
		state('inspectionQuestions', {
			url: '/inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/inspection.checklist.client.view.html'
		}).
		state('inspectionTimeline', {
			url: '/inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/inspection.checklist.client.view.html'
		}).
		state('inspectionInput', {
			url: '/inspection/checklists/:checklistId/questions/:questionId',
			templateUrl: 'modules/inspection/views/input.client.view.html'
		}).
		state('fullInspection', {
			url: '/full_inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/full_inspection.client.view.html'
		});
	}
]);
