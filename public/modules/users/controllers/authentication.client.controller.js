'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'Companies', 'UserRole', 
	function($scope, $http, $location, Authentication, Companies, UserRole) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$scope.credentials.company = $scope.credentials.company._id;
			console.log('signup: ', $scope.credentials);
			// $scope.credentials.company = $scope.credentials.company._id;
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				console.log('signup error: ', response);
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				console.log(response);
				// And redirect to the index page
				if (response.role === UserRole.Inspector) {
					$location.path('inspection');
				} else if (response.role === UserRole.Supervisor) {
					$location.path('reports');
				} else if (response.role === UserRole.Administrator) {
					$location.path('users');
				} else if (response.role === UserRole.Superadmin) {
					$location.path('users');
				}
			}).error(function(response) {
				console.log('login error: ', response);
				$scope.error = response.message;
			});
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.companies = Companies.query();
			// console.log($scope.companies);
		};
	}
]);