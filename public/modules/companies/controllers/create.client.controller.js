'use strict';

// Companies controller
angular.module('companies').controller('CompanyCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'CompanySrv',
	function($scope, $stateParams, $location, Authentication, Companies, CompanySrv) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}

			if($stateParams.companyId) {
				$scope.findOne($stateParams.companyId);
			} else {
				$scope.breadcrumbLabel = 'New Company';
				$scope.company = new Companies({
					name: '',
					status: true
				});
				$scope.reset();
			}
		};

		// Find existing Company
		$scope.findOne = function(id) {
			$scope.company = Companies.get({
				companyId: id
			});
			$scope.company.$promise.then(function(response){
				$scope.breadcrumbLabel = 'Company Details [' + $scope.company.name + ']';
				$scope.reset();
			});
		};

		// Create new Company
		$scope.save = function() {
			$scope.company.name = $scope.companyName;
			$scope.company.status = $scope.status === 'true' ? true : false;
			$scope.company.updated = $scope.lastUpdated = moment();
			$scope.company.editor = $scope.authentication.user._id;
			if($scope.company._id) {
				$scope.company.$update(function(response) {
					$location.path('companies');
				});
			} else {
				$scope.company.$save(function(response) {
					$location.path('companies');
				});
			}
		};

		$scope.reset = function() {
			$scope.companyName = $scope.company.name;
			$scope.status = $scope.company.status ? 'true' : 'false';
			$scope.lastUpdated = moment($scope.company.updated).tz('America/New_York');
			if($scope.company.editor) {
				// console.log($scope.company.editor);
				$scope.editor = ' by [' + $scope.company.editor.username + ']';
			} else {
				$scope.editor = '';
			}
		};
		
		$scope.cancel = function() {
			$location.path('companies');
		};
	}
]);
