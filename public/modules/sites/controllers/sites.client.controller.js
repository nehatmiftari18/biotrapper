'use strict';

// Site controller
angular.module('sites').controller('SitesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Sites', 'SiteSrv', 'UserRole', 'SitesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Sites, SiteSrv, UserRole, SitesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'company': false,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('site_sort', $scope.sortColumn);
		};

		// Create new Site
		$scope.create = function() {
			$location.path('sites/new');
		};

		// Find a list of Sites
		$scope.find = function() {
			if (PersistSortService.get('site_sort')) {
				$scope.sortColumn = PersistSortService.get('site_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			if ($scope.isSuperAdmin) {
				$scope.findAll();
			} else {
				$scope.findByCompany();
			}
		};

		$scope.findAll = function() {
			$http.get('/sites/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.sites = response;
				$scope.safeSites = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.sites = $scope.safeSites = SitesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Site
		$scope.findOne = function() {
			$scope.site = Sites.get({
				siteId: $stateParams.siteId
			});
		};

		$scope.editSite = function(site) {
			// SiteSrv.site = site;
			$location.path('sites/' + site._id + '/edit');
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);
