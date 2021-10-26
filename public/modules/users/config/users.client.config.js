'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
])
.constant('UserRole', {
	Inspector: 'inspector',
	Supervisor: 'supervisor',
	Administrator: 'administrator',
	Superadmin: 'superadmin'
})
.run(['Menus',
	function(Menus) {
		Menus.addSubMenuItem('topbar', 'admin', 'Users', 'users', null, true, ['superadmin', 'administrator'], 0);
	}
]);
