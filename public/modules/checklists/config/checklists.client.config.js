'use strict';

// Configuring the Questions module
angular.module('checklists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Checklists', 'checklists', 'item', null, null, ['superadmin', 'administrator'], 2);
	}
]);