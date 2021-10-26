'use strict';

// Questions controller
angular.module('reports').controller('SaveMgmtModalController', ['$scope', '$modalInstance', 
	function($scope, $modalInstance) {
		$scope.ok = function () {
		    $modalInstance.close($scope.data);
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('SaveInspModalController', ['$scope', '$modalInstance', 
	function($scope, $modalInstance) {
		
		$scope.ok = function () {
			$modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('ReportsCopyModalController', ['$scope', '$modalInstance', 'reports', 
	function($scope, $modalInstance, reports) {
		$scope.reports = reports;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('ReportDeleteModalCtrl', ['$scope', '$modalInstance', 'reports', 
	function($scope, $modalInstance, reports) {
		$scope.reports = reports;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);