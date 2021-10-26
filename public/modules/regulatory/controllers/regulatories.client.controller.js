'use strict';

// Regulatory controller
angular.module('regulatories').controller('RegulatoriesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Regulatories', 'RegulatorySrv', 'UserRole', 'RegulatoriesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Regulatories, RegulatorySrv, UserRole, RegulatoriesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.admin = 'Regulatory';
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
			PersistSortService.set('regulatory_sort', $scope.sortColumn);
		};

		// Create new Regulatory
		$scope.create = function() {
			$location.path('regulatories/new');
		};

		// Find a list of Regulatories
		$scope.find = function() {
			if (PersistSortService.get('regulatory_sort')) {
				$scope.sortColumn = PersistSortService.get('regulatory_sort');
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
			$http.get('/regulatories/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.regulatories = $scope.safeRegulatories = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.regulatories = $scope.safeRegulatories = RegulatoriesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Regulatory
		$scope.findOne = function() {
			$scope.regulatory = Regulatories.get({
				regulatoryId: $stateParams.regulatoryId
			});
		};

		$scope.editRegulatory = function(regulatory) {
			RegulatorySrv.regulatory = regulatory;
			$location.path('regulatories/' + regulatory._id + '/edit');
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Companies') {
				$location.path('companies');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			} else if($scope.admin === 'Frequencies') {
				$location.path('frequencies');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);
