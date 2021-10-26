'use strict';

// angular.module("core")
// .directive('datatable', function () {
//     return {
//         restrict: 'A',
//         link: function (scope, elem) {
//             $(elem).dataTable();
//         }
//     }
// });
angular.module('core')
.directive('fileread', [function () {
    return {
        scope: {
            fileread: '='
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    };
}])
.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
})
.directive('bindFile', [function () {
    return {
        require: "ngModel",
        restrict: 'A',
        link: function ($scope, el, attrs, ngModel) {
            el.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });

            $scope.$watch(function () {
                return ngModel.$viewValue;
            }, function (value) {
                if (!value) {
                    el.val("");
                }
            });
        }
    };
}]).directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function(){
					scope.$eval(attrs.ngEnter, {'event': event});
				});

				event.preventDefault();
			}
		});
	};
}).directive('ngDropdownMultiselectDisabled', function() {
	return {
		restrict: 'A',
		controller: ['$scope','$element','$attrs', function($scope, $element, $attrs) {
			var $btn;
			$btn = $element.find('button');
			return $scope.$watch($attrs.ngDropdownMultiselectDisabled, function(newVal) {
				return $btn.attr('disabled', newVal);
			});
		}]
	};
});
