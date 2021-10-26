'use strict';

// Configuring the Questions module
angular.module('questions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Questions', 'questions', 'item', null, null, ['superadmin', 'administrator'], 1);
	}
]);