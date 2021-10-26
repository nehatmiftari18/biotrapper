'use strict';

// Configuring the Inspector module
angular.module('inspection').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'My Inspections', 'inspection', 'item', null, null, ['inspector']);
	}
]);
