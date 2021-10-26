'use strict';

// Questions controller
angular.module('checklists').controller('ChecklistDelModalCtrl', ['$scope', '$modalInstance', 'checklists', 
	function($scope, $modalInstance, checklists) {
		
		$scope.checklists = checklists;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('CopyChecklistModalController', ['$scope', '$modalInstance', 'checklists', 
	function($scope, $modalInstance, checklists) {
		$scope.checklists = checklists;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);