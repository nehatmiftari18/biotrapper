'use strict';

// Sites controller
angular.module('sites').controller('SiteCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'Sites', 'SiteSrv', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Companies, Sites, SiteSrv, UserRole) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			$scope.data = {};
			if($stateParams.siteId) {
				$scope.findOne($stateParams.siteId);
			} else {
				$scope.site = new Sites({
					name: '',
					status: true
					// company: Authentication.user.company
				});
				if(!$scope.isSuperAdmin) {
					$scope.site.company = Authentication.user.company;
				}
				$scope.breadcrumbLabel = 'New Site';
				$scope.reset();
			}
			// console.log($scope.site);
			$scope.companies = Companies.query();

		};

		// Find existing Site
		$scope.findOne = function(id) {
			$scope.site = Sites.get({
				siteId: id
			});
			$scope.site.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.site.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.site.company = $scope.site.company._id;
				}
				$scope.breadcrumbLabel = 'Site Details [' + $scope.site.name + ']';
				$scope.reset();
			});
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.siteName || !$scope.siteName.length) {
				$scope.error = 'Please fill in site name.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		// Create new Company
		$scope.save = function() {
			if(!$scope.isFormValid()) return;
			$scope.site.updated = $scope.lastUpdated = moment();
			$scope.site.name = $scope.siteName;
			if ($scope.isSuperAdmin) {
				$scope.site.company = $scope.data.company._id;
			}
			$scope.site.status = $scope.status === 'true' ? true : false;
			$scope.site.editor = $scope.authentication.user._id;
			if($scope.site._id) {
				$scope.site.$update(function(response) {
					// console.log(response);
					$location.path('sites');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.site.$save(function(response) {
					// console.log(response);
					$location.path('sites');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.reset = function() {
			$scope.data.company = $scope.site.company;
			$scope.siteName = $scope.site.name;
			$scope.status = $scope.site.status ? 'true' : 'false';
			$scope.lastUpdated = moment($scope.site.updated).tz('America/New_York');
			if($scope.site.editor) {
				// console.log($scope.site.editor);
				$scope.editor = ' by [' + $scope.site.editor.username + ']';
			} else {
				$scope.editor = '';
			}
		};

		$scope.cancel = function() {
			$location.path('sites');
		};
	}
]);
