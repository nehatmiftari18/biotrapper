'use strict';

// Frequencies controller
angular.module('frequencies').controller('FrequencyCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'Repeats', 'Frequencies', 'FrequencySrv', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Companies, Repeats, Frequencies, FrequencySrv, UserRole) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {
			};

			$scope.companies = Companies.query();

			if($stateParams.frequencyId) {
				$scope.findOne($stateParams.frequencyId);
			} else {
				$scope.breadcrumbLabel = 'New Frequency';
				$scope.frequency = new Frequencies({
					name: '',
					period: 'due',
					status: true
				});
				if(!$scope.isSuperAdmin) {
					$scope.frequency.company = Authentication.user.company;
				}
				$scope.status = 'true';
			}
			$scope.selectedRepeat = {};
			$scope.repeats = Repeats.query();
			$scope.repeats.$promise.then(function(response) {
				if (!$stateParams.frequencyId) {
					$scope.frequency.type = $scope.data.selectedRepeatName = response[0].name;
				}
				$scope.updateSelectedRepeat();
			});

			// $scope.$watch('data.selectedRepeatName',$scope.updateSelectedRepeat);
		};

		$scope.updateSelectedRepeat = function(){
			var monthDays = [];
			for (var i = 1; i <= 31; i++)
			{
				monthDays.push(i);
			}

			var quarterDays = [];
			for (var i = 1; i <= 90; i++) { quarterDays.push(i); }

			var times = ["12 am", "1 am", "2 am", "3 am", "4 am", "5 am", "6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm", "7 pm", "8 pm", "9 pm", "10 pm", "11pm"];

			$scope.repeats.forEach(function(item) {
				if (item.name === $scope.data.selectedRepeatName) {
					$scope.selectedRepeat =  item;
					$scope.selectedRepeat.rangeArray = [];
					for (var i = 0; i < item.ranges; i++)
					{
						$scope.selectedRepeat.rangeArray.push({"number": i, rangeType: $scope.selectedRepeat.rangeType});
					}

					if ($scope.selectedRepeat.rangeType === "time") {
						$scope.selectedRepeat.rangeFrom = $scope.selectedRepeat.rangeTo = times;
					} else if ($scope.selectedRepeat.rangeType === "day of week") {
						$scope.selectedRepeat.rangeFrom = $scope.selectedRepeat.rangeTo = moment.weekdays();
					} else if ($scope.selectedRepeat.rangeType === "day of month") {
						$scope.selectedRepeat.rangeFrom = $scope.selectedRepeat.rangeTo = monthDays;
						$scope.selectedRepeat.rangeLabel = "Day";
					} else if ($scope.selectedRepeat.rangeType === 'month and day') {
						$scope.selectedRepeat.rangeFrom = $scope.selectedRepeat.rangeTo = monthDays;
						$scope.selectedRepeat.rangeFrom2 = $scope.selectedRepeat.rangeTo2 = moment.months();
					}

					if ($scope.selectedRepeat.dueBy === "time") {
						$scope.selectedRepeat.dueLabel = "At";
						$scope.selectedRepeat.due = times;
					} else if ($scope.selectedRepeat.dueBy === "day of week") {
						$scope.selectedRepeat.dueLabel = "On";
						$scope.selectedRepeat.due = moment.weekdays();
					} else if ($scope.selectedRepeat.dueBy === "week of month and day of week") {
						$scope.selectedRepeat.dueLabel = "On the";
						$scope.selectedRepeat.dueWeek = ["First", "Second", "Third", "Fourth"];
						$scope.selectedRepeat.due = moment.weekdays();
					} else if ($scope.selectedRepeat.dueBy === "day of quarter") {
						$scope.selectedRepeat.dueLabel = "Before day";
						$scope.selectedRepeat.due = quarterDays;
					} else if ($scope.selectedRepeat.dueBy === "day of year") {
						$scope.selectedRepeat.dueLabel = "On";
						$scope.selectedRepeat.dueMonth = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
						$scope.selectedRepeat.due = monthDays;
					}

					$scope.data.interval = $scope.selectedRepeat.incrementDays;
					$scope.data.period = $scope.frequency.period || 'due';
					$scope.data.due = $scope.frequency.due || {
						dueWeek : 0,
						value : 5
					};
				}
			});
		};

		// Find existing Frequency
		$scope.findOne = function(id) {
			$scope.frequency = Frequencies.get({
				frequencyId: id
			});
			$scope.frequency.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.frequency.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.frequency.company = $scope.frequency.company._id;
				}
				$scope.breadcrumbLabel = 'Required Frequency Details [' + $scope.frequency.name + ']';
				$scope.reset();
			});
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.frequencyName || !$scope.frequencyName.length) {
				$scope.error = 'Please fill in required frequency.';
			} else if(!$scope.data.period) {
				$scope.error = 'Please select frequency option.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		// Create new Company
		$scope.save = function() {
			if(!$scope.isFormValid()) return;
			$scope.frequency.updated = $scope.lastUpdated = moment();
			$scope.frequency.name = $scope.frequencyName;
			if ($scope.isSuperAdmin) {
				$scope.frequency.company = $scope.data.company._id;
			}
			$scope.frequency.status = $scope.status === 'true' ? true : false;
			$scope.frequency.editor = $scope.authentication.user._id;
			$scope.frequency.type = $scope.data.selectedRepeatName;
			$scope.frequency.period = $scope.data.period;
			$scope.frequency.between = $scope.data.between;
			$scope.frequency.due = $scope.data.due;
			$scope.frequency.interval = $scope.data.interval;
			if($scope.frequency._id) {
				$scope.frequency.$update(function(response) {
					console.log('frequency: ', response);
					$location.path('frequencies');
				});
			} else {
				$scope.frequency.$save(function(response) {
					console.log('frequency: ', response);
					$location.path('frequencies');
				});
			}
		};

		$scope.reset = function() {
			$scope.data.company = $scope.frequency.company;
			$scope.frequencyName = $scope.frequency.name;
			$scope.data.selectedRepeatName = $scope.frequency.type;
			$scope.data.period = $scope.frequency.period;
			$scope.data.between = $scope.frequency.between;
			$scope.data.due = $scope.frequency.due || {dueWeek: 0, value: 0};
			$scope.data.due.dueWeek = Number($scope.data.due.dueWeek);
			$scope.data.due.value = Number($scope.data.due.value);
			$scope.data.interval = $scope.frequency.interval;
			$scope.status = $scope.frequency.status ? 'true' : 'false';
			$scope.lastUpdated = moment($scope.frequency.updated).tz('America/New_York');
			if($scope.frequency.editor) {
				$scope.editor = ' by [' + $scope.frequency.editor.username + ']';
			} else {
				$scope.editor = '';
			}
			$scope.updateSelectedRepeat();
		};

		$scope.cancel = function() {
			$location.path('frequencies');
		};

		$scope.removeRepeats = function() {
			Repeats.remove({}, function(response) {
				console.log(response);
			});
		};
	}
]);
