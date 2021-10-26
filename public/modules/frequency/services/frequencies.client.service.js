'use strict';

//Frequencies service used for communicating with the frequencies REST endpoints
angular.module('frequencies').factory('Frequencies', ['$resource',
	function($resource) {
		return $resource('frequencies/:frequencyId', {
			frequencyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('FrequenciesByCompany', ['$resource',
	function($resource) {
		return $resource('frequencies/company/:companyId', {companyId:'@companyId'});
	}
])
.factory('Repeats', ['$resource',
	function($resource) {
		return $resource('repeats');
	}
])
//Frequencies service used for sharing frequency object throughout the whole module
.service('FrequencySrv', function() {
	this.frequency = {};
});
