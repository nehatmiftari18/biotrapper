'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication', '$location', 'UserRole', 
	function($scope, $http, Authentication, $location, UserRole) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.users = [];

		if (!$scope.authentication.user) {
			$location.path('signin');
		} else if (Authentication.user.role === UserRole.Inspector) {
			$location.path('inspection');
		} else if (Authentication.user.role === UserRole.Supervisor) {
			$location.path('reports');
		} else if (Authentication.user.role === UserRole.Administrator) {
			$location.path('users');
		} else if (Authentication.user.role === UserRole.Superadmin) {
			$location.path('users');
		}

		$scope.getUsers = function() {
			if($scope.authentication.user) {
				$http.get('/users/all').success(function(response) {
					// If successful we assign the response to the global user model
					console.log('success: ', response);
					$scope.users = response;
				}).error(function(response) {
					$scope.error = response.message;
					console.log('error: ', response);
				});
			}
		};

		$scope.getUsers();
	}
]);