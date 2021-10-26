'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/:userId', {userId: '@_id'}, {
			update: {
				method: 'PUT'
			},
			edit: {
				method: 'POST'
			}
		});
	}
])
.factory('UsersByCompany', ['$resource',
	function($resource) {
		return $resource('users/company/:companyId', {companyId: '@companyId'});
	}
])
.factory('InspectorsByCompany', ['$resource',
	function($resource) {
		return $resource('users/inspector/:companyId', {companyId: '@companyId'});
	}
])
.factory('SupervisorsByCompany', ['$resource',
	function($resource) {
		return $resource('users/supervisor/:companyId', {companyId: '@companyId'});
	}
])
.factory('InspectorsByChecklist', ['$resource',
	function($resource) {
		return $resource('inspectors/:checklistId', {checklistId: '@checklistId'});
	}
])
//Users service used for sharing user object throughout the whole module
.service('UserSrv', function() {
	this.user = {};
});
