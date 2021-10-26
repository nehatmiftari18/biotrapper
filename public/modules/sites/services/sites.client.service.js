'use strict';

//Sites service used for communicating with the sites REST endpoints
angular.module('sites').factory('Sites', ['$resource',
	function($resource) {
		return $resource('sites/:siteId', {
			siteId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('SitesByCompany', ['$resource',
	function($resource) {
		return $resource('sites/company/:companyId', {companyId:'@companyId'});
	}
])
//Sites service used for sharing site object throughout the whole module
.service('SiteSrv', function() {
	this.site = {};
});