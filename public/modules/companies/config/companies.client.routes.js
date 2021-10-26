'use strict';

// Setting up route
angular.module('companies').config(['$stateProvider',
	function($stateProvider) {
		// companies state routing
		$stateProvider.
		state('company-list', {
			url: '/companies',
			templateUrl: 'modules/companies/views/company-admin.client.view.html'
		}).
		state('company-create', {
			url: '/companies/new',
			templateUrl: 'modules/companies/views/create-company.client.view.html'
		}).
		state('company-detail', {
			url: '/companies/:companyId/edit',
			templateUrl: 'modules/companies/views/create-company.client.view.html'
		});
	}
]);