'use strict';

// Configuring the Sites module
angular.module('sites').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Sites', 'sites', 'dropdown', '/sites(/create)?');
		Menus.addSubMenuItem('topbar', 'admin', 'Sites', 'sites', null, true, ['superadmin', 'administrator'], 2);
	}
]);