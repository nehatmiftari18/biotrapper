'use strict';

//Companies service used for communicating with the companies REST endpoints
angular.module('companies').factory('Companies', ['$resource',
	function($resource) {
		return $resource('companies/:companyId', {
			companyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
//Companies service used for sharing company object throughout the whole module
.service('CompanySrv', function() {
	this.company = {};
});