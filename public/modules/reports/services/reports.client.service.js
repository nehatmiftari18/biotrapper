'use strict';

//Reports service used for communicating with the reports REST endpoints
angular.module('reports').factory('Reports', ['$resource',
	function($resource) {
		return $resource('reports/:reportId', {
			reportId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('ReportsByCompany', ['$resource',
	function($resource) {
		return $resource('reports/company/:companyId', {companyId:'@companyId'});
	}
])
.factory('CompaniesForReports', ['$resource',
	function($resource) {
		return $resource('reports/companies');
	}
])
.factory('ChecklistsForReports', ['$resource',
	function($resource) {
		return $resource('reports/checklists', {});
	}
])
.factory('InspectionReports', ['$resource',
	function($resource) {
		return $resource('reports/inspections');
	}
])
.service('ReportData', function() {
    return {
        company: null,
        checklist: null,
        inspectors: [],
        frameworks: [],
        fromDate: null,
        toDate: null
    };
})
.filter("timelineDatRange", function() {
	return function(items, from, to) {
		var result = [];
		if (items) {
			for (var i=0; i<items.length; i++){
				var d = new Date(items[i].start);
				if (d >= new Date(from) && d <= new Date(to))  {
					result.push(items[i]);
				}
			}
		}
		return result;
	};
});
