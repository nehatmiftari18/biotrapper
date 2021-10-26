'use strict';

// Questions controller
 angular.module('inspection').controller('InspectionController', ['$scope', '$rootScope', '$location', 'Authentication', 'Users', 'Checklists', 'InspectionDates', 'ChecklistsByInspector', '$q',
	function($scope, $rootScope, $location, Authentication, Users, Checklists, InspectionDates, ChecklistsByInspector, $q) {

		$scope.userRoles = ['inspector'];
		$scope.authentication = Authentication;

		$scope.tabs = [
			{ title:"Primary", isLoaded:false, active: false},
			{  title:"Secondary", isLoaded:false, active: false },
			{  title:"Tertiary", isLoaded:false, active: false }
		];
		if ($location.search().tabIdx !== undefined) {
			var tabIcx = $location.search().tabIdx;
			$scope.tabs[tabIcx].active = true;
			$scope.selectedTab = tabIcx;
		} else {
			$scope.tabs[0].active = true;
			$scope.selectedTab = 0;
		}

		$scope.initialize = function() {
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.currentTime = moment().tz('America/New_York').format('ddd MM/DD/YYYY HH:mm a');
			$scope.findUser($scope.authentication.user._id);
			$scope.checklists = [];
		};

		// Find existing User
		$scope.findUser = function(id) {
			$scope.user = Users.get({
				userId: id
			});
			$scope.user.$promise.then(function(response){
				console.log('user info: ', response);
				//$scope.findChecklists(response.checklists);
			});
		};

		$scope.getChecklistsByTab = function(index) {
			$scope.selectedTab = index;
			$location.search('tabIdx', index);
			var checklists = ChecklistsByInspector.query({inspectorId: $scope.authentication.user._id, category: index});
			checklists.$promise.then(function(response) {
				$scope.findChecklists(response);
			});
		};

		$scope.formatInspectionDate = function(dateObj) {
			return moment(dateObj).tz('America/New_York').format('MM/DD/YYYY');
		};

		$scope.getChecklist = function(checklistId) {
			var successHandler = function(response) {
				var chklist = response[0];
				chklist.lastInspectionDate = response[1].date || '';
				var dueDate = moment(chklist.lastInspectionDate).tz('America/New_York');
				// console.log('last inspection date: ', dueDate);
				if (chklist.frequency.period === 'due') {
					var freqType = chklist.frequency.type;
					var freqDueValue = chklist.frequency.due?chklist.frequency.due.value:0;
					var freqDueWeek = chklist.frequency.due?chklist.frequency.due.dueWeek:0;
					if (freqType === 'Daily') {
						chklist.dueDate = dueDate.add(1, 'days').hour(freqDueValue).minute(0).second(0).format('MM/DD HH:mm a');
					} else if (freqType === 'Weekly') {
						if (freqDueValue === 0)
							chklist.dueDate = dueDate.day(7);
						else
							chklist.dueDate = dueDate.day(Number(freqDueValue) + 7);
						chklist.dueDate = chklist.dueDate.format('MM/DD/YYYY');
					} else if (freqType === 'Biweekly' || freqType ==='Bi-weekly') {
						if (freqDueValue === 0)
							chklist.dueDate = dueDate.day(14);
						else
							chklist.dueDate = dueDate.day(Number(freqDueValue) + 14);
						chklist.dueDate = chklist.dueDate.format('MM/DD/YYYY');
					} else if (freqType === 'Monthly') {
						var nextMonthDay = dueDate.endOf('month').add(1, 'days');
						var add = (freqDueValue - nextMonthDay.day() + 7) % 7 + Number(freqDueWeek) * 7;
						nextMonthDay.set('date', 1 + add);
						chklist.dueDate = nextMonthDay.format('MM/DD/YYYY');
					} else if (freqType === 'Quarterly') {
						var quater = dueDate.quarter();
						chklist.dueDate = dueDate.set('month', quater * 3).set('date', parseInt(freqDueValue)+1).format('MM/DD/YYYY');
					} else if (freqType === 'Annually') {
						dueDate.add(1, 'years');
						dueDate.set('month', freqDueWeek).set('date', parseInt(freqDueValue) + 1);
						chklist.dueDate = dueDate.format('MM/DD/YYYY');
					}
				} else if (chklist.frequency.period === 'interval') {
					chklist.dueDate = dueDate.add(chklist.frequency.interval, 'days').format('MM/DD/YYYY');
				}
				$scope.checklists.push(chklist);
				$scope.safe_checklists.push(chklist)
			};
			var thenFn = function(response) {
				return response;
			};
			var q1 = $q.defer(),
				q2 = $q.defer();
			var p1 = q1.promise,
				p2 = q2.promise;
			var checklist = Checklists.get({checklistId: checklistId});
			var latestInspection = InspectionDates.get({checklistId: checklistId, isSubmitted: 1});
			checklist.$promise.then(function(response) {q1.resolve(response)});
			latestInspection.$promise.then(function(response) {q2.resolve(response)});

			$q.all([
                p1.then(thenFn),
                p2.then(thenFn)
            ])
            .then(function(values) {
                console.log('checklist with due date: ', values);
                successHandler(values);
            });
		};

		$scope.findChecklists = function(checklistIds) {
			$scope.checklists = [];
			$scope.safe_checklists = [];
			for(var i=0; i<checklistIds.length; i++) {
				$scope.getChecklist(checklistIds[i]._id)
			}
		};

		$scope.inspectChecklist = function(checklist) {
			$rootScope.answers = undefined;
			$location.path('inspection/checklists/' + checklist._id);
			$location.search('tabIdx', $scope.selectedTab);
		};

		$scope.fullInspectionsChecklist = function(checklist) {
			$location.path('full_inspection/checklists/' + checklist._id);
			$location.search('tabIdx', $scope.selectedTab);
		};
	}
]);
