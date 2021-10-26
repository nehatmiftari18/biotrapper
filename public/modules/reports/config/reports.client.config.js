'use strict';

// Configuring the Inspector module
angular.module('reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'item', null, null, ['superadmin', 'administrator', 'supervisor'], 3);
	}
]);
