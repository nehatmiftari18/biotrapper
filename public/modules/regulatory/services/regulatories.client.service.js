'use strict';

//Regulatory service used for communicating with the regulatory REST endpoints
angular.module('regulatories').factory('Regulatories', ['$resource',
	function($resource) {
		return $resource('regulatories/:regulatoryId', {
			regulatoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('RegulatoriesByCompany', ['$resource',
	function($resource) {
		return $resource('regulatories/company/:companyId', {companyId:'@companyId'});
	}
])
//Regulatory service used for sharing regulatory object throughout the whole module
.service('RegulatorySrv', function() {
	this.regulatory = {};
});