'use strict';

// Company controller
angular.module('companies').controller('CompaniesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, PersistSortService) {

		$scope.userRoles = ['superadmin'];
		$scope.authentication = Authentication;
		$scope.admin = 'Companies';
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('company_sort', $scope.sortColumn);
		};

		$scope.addNew = function() {
			// Create new Company object
			$location.path('companies/new');
		};

		$scope.editCompany = function(company) {
			$location.path('companies/' + company._id + '/edit');
		};

		// Find a list of Companies
		$scope.find = function() {
			if (PersistSortService.get('company_sort')) {
				$scope.sortColumn = PersistSortService.get('company_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$http.get('/companies/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.companies = $scope.safeCompanies = response;
			}).error(function(response) {
				console.log('error: ', response);
			});
			// $scope.companies = Companies.query();
		};

		// Find existing Company
		$scope.findOne = function() {
			$scope.company = Companies.get({
				companyId: $stateParams.companyId
			});
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			} else if($scope.admin === 'Regulatory') {
				$location.path('regulatories');
			} else if($scope.admin === 'Frequencies') {
				$location.path('frequencies');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);
