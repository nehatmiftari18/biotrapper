'use strict';

angular.module('inspection')
.directive('anchorScrollToId', function($anchorScroll, $location) {
	var directive = {
		link: function($scope, $element, $attrs) {
			if ($location.hash() === $attrs.id) {
				$element[0].scrollIntoView();
			}
		}
	};

	return directive;
});
