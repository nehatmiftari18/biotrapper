'use strict';

// Questions controller
angular.module('inspection').controller('FullInspectionController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'FullInspectionService',
	function($scope, $rootScope, $stateParams, $location, Authentication, FullInspectionService) {
		$scope.userRoles = ['inspector'];
		$scope.authentication = Authentication;
		$scope.initialize = function() {
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}

			$scope.fullInspection = FullInspectionService.get({
				checklistId: $stateParams.checklistId
			});
		};

		$scope.goBack = function() {
			$location.path('inspection');
		};
	}
]);
