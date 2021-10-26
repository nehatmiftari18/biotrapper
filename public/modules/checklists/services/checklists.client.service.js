'use strict';

//Checklists service used for communicating with the checklists REST endpoints
angular.module('checklists').factory('Checklists', ['$resource',
	function($resource) {
		return $resource('checklists/:checklistId', {
			checklistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('ChecklistsByCompany', ['$resource',
	function($resource) {
		return $resource('checklists/company/:companyId', {companyId:'@companyId'});
	}
]);