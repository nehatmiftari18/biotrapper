'use strict';

// Setting up route
angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('reports', {
			url: '/reports',
			templateUrl: 'modules/reports/views/reports.client.view.html'
		}).
		state('report_create_management', {
			url: '/reports/new_management_inspection',
			templateUrl: 'modules/reports/views/build.management.report.client.view.html'
		}).
		state('report_edit_management', {
			url: '/reports/management_inspection/:reportId/edit',
			templateUrl: 'modules/reports/views/build.management.report.client.view.html'
		}).
		state('report_create_regulatory', {
			url: '/reports/new_regulatory_inspection',
			templateUrl: 'modules/reports/views/build.regulatory.report.client.view.html'
		}).
		state('report_inspection_timeline', {
			url: '/reports/inspection_timeline',
			templateUrl: 'modules/reports/views/build.timeline.report.client.view.html'
		}).
		state('report_edit_regulatory', {
			url: '/reports/regulatory_inspection/:reportId/edit',
			templateUrl: 'modules/reports/views/build.regulatory.report.client.view.html'
		}).
		state('reg_framework_pdf', {
			url: '/reports/reg_framework_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.framework.client.view.html'
		}).
		state('reg_inspector_pdf', {
			url: '/reports/reg_inspector_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.inspector.client.view.html'
		}).
		state('reg_date_pdf', {
			url: '/reports/reg_date_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.date.client.view.html'
		}).
		state('mgmt_framework_pdf', {
			url: '/reports/mgmt_framework_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.framework.client.view.html'
		}).
		state('mgmt_inspector_pdf', {
			url: '/reports/mgmt_inspector_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.inspector.client.view.html'
		}).
		state('mgmt_date_pdf', {
			url: '/reports/mgmt_date_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.date.client.view.html'
		});
	}
]);
