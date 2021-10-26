'use strict';

// Users Modal controller
angular.module('users')
.controller('UserInactivateModalCtrl', ['$scope', '$modalInstance', 'selectedUsers', 'makeActivate',
	function($scope, $modalInstance, selectedUsers, makeActivate) {
		$scope.selectedUsers = selectedUsers;
		$scope.makeActivate = makeActivate;
		console.log($scope.makeActivate)
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);
