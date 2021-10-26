'use strict';

// Frequency controller
angular.module('frequencies').controller('FrequenciesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Frequencies', 'FrequencySrv', 'UserRole', 'FrequenciesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Frequencies, FrequencySrv, UserRole, FrequenciesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.admin = 'Frequencies';
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
			PersistSortService.set('frequency_sort', $scope.sortColumn);
		};

		// Create new Frequency
		$scope.create = function() {
			// Create new Frequency object
			$location.path('frequencies/new');
		};

		// Find a list of Frequencies
		$scope.find = function() {
			if (PersistSortService.get('frequency_sort')) {
				$scope.sortColumn = PersistSortService.get('frequency_sort');
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
			$http.get('/frequencies/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.frequencies = response;
				$scope.safeFrequencies = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.frequencies = $scope.safeFrequencies = FrequenciesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Frequency
		$scope.findOne = function() {
			$scope.frequency = Frequencies.get({
				frequencyId: $stateParams.frequencyId
			});
		};

		$scope.editFrequency = function(frequency) {
			$location.path('frequencies/' + frequency._id + '/edit');
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Companies') {
				$location.path('companies');
			} else if($scope.admin === 'Regulatory') {
				$location.path('regulatories');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);
