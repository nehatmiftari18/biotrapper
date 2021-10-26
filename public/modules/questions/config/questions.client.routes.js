'use strict';

// Setting up route
angular.module('questions').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('adminHome', {
			url: '/questions',
			templateUrl: 'modules/questions/views/bank-questions.client.view.html'
		}).
		state('question_create', {
			url: '/questions/new',
			templateUrl: 'modules/questions/views/build-question.client.view.html'
		}).
		state('question_detail', {
			url: '/questions/:questionId/edit',
			templateUrl: 'modules/questions/views/build-question.client.view.html'
		});
	}
]);