'use strict';

// Configuring the Companies module
angular.module('companies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Administration', 'admin', 'dropdown', null, null, ['superadmin', 'administrator'], 4);
		Menus.addSubMenuItem('topbar', 'admin', 'Companies', 'companies', null, true, ['superadmin'], 1);
		// Menus.addSubMenuItem('topbar', 'companies', 'New Company', 'companies/create');
	}
]);
