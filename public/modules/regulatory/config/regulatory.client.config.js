'use strict';

// Configuring the Sites module
angular.module('regulatories').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addSubMenuItem('topbar', 'admin', 'Regulatory Frameworks', 'regulatories', null, true, ['superadmin', 'administrator'], 3);
	}
]);