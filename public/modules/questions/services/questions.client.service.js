'use strict';

//Questions service used for communicating with the questions REST endpoints
angular.module('questions').factory('Questions', ['$resource',
	function($resource) {
		return $resource('questions/:questionId', {
			questionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('QuestionsByCompany', ['$resource',
	function($resource) {
		return $resource('questions/company/:companyId', {companyId:'@companyId'});
	}
]);
