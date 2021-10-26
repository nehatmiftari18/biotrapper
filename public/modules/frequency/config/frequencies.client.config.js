'use strict';

// Configuring the Frequencies module
angular.module('frequencies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addSubMenuItem('topbar', 'admin', 'Frequencies', 'frequencies', null, true, ['superadmin', 'administrator'], 4);
	}
]);