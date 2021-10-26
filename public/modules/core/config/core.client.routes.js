'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
])
.run( function($rootScope, $location, Authentication) {
    $rootScope.$on('$locationChangeStart',
	    function (event, next, current) {
	      	if(!Authentication.user) {
	      		var targetUrl = next.split('/').pop();
	      		// if(targetUrl !== 'signin' && targetUrl !== 'signup' && targetUrl !== 'forgot') {
	      		if (!next.endsWith('signin')) {
	      			if (!next.includes('password/forgot') &&
	      				!next.includes('password/reset')) {
			      		// event.preventDefault();
			      		$location.path('signin');
		      		}
		      	}
	      	}
	 	});
});