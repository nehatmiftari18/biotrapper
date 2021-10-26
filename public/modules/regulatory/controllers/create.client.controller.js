'use strict';

// Regulatories controller
angular.module('regulatories').controller('RegulatoryCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'Regulatories', 'RegulatorySrv', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Companies, Regulatories, RegulatorySrv, UserRole) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {};
			if($stateParams.regulatoryId) {
				$scope.findOne($stateParams.regulatoryId);
			} else {
				$scope.breadcrumbLabel = 'New Framework';
				$scope.regulatory = new Regulatories({
					name: '',
					status: true
				});
				if(!$scope.isSuperAdmin) {
					$scope.regulatory.company = Authentication.user.company;
				}
				$scope.reset();
			}
			$scope.companies = Companies.query();
		};

		// Find existing Regulatory
		$scope.findOne = function(id) {
			$scope.regulatory = Regulatories.get({
				regulatoryId: id
			});
			$scope.regulatory.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.regulatory.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.regulatory.company = $scope.regulatory.company._id;
				}
				$scope.breadcrumbLabel = 'Regulatory Framework Details [' + $scope.regulatory.name + ']';
				$scope.reset();
			});
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.regulatoryName || !$scope.regulatoryName.length) {
				$scope.error = 'Please fill in regulatory framework.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		// Create new Company
		$scope.save = function() {
			if(!$scope.isFormValid()) return;
			$scope.regulatory.updated = $scope.lastUpdated = moment();
			$scope.regulatory.name = $scope.regulatoryName;
			if ($scope.isSuperAdmin) {
				$scope.regulatory.company = $scope.data.company._id;
			}
			$scope.regulatory.status = $scope.status === 'true' ? true : false;
			$scope.regulatory.editor = $scope.authentication.user._id;
			if($scope.regulatory._id) {
				$scope.regulatory.$update(function(response) {
					$location.path('regulatories');
				});
			} else {
				$scope.regulatory.$save(function(response) {
					$location.path('regulatories');
				});
			}
		};

		$scope.reset = function() {
			$scope.data.company = $scope.regulatory.company;
			$scope.regulatoryName = $scope.regulatory.name;
			$scope.status = $scope.regulatory.status ? 'true' : 'false';
			if($scope.regulatory.editor) {
				$scope.editor = ' by [' + $scope.regulatory.editor.username + ']';
			} else {
				$scope.editor = '';
			}
			$scope.lastUpdated = moment($scope.regulatory.updated).tz('America/New_York');
		};

		$scope.cancel = function() {
			$location.path('regulatories');
		};
	}
]);
