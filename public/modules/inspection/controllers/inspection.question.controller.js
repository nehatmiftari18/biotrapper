'use strict';

// Questions controller
 angular.module('inspection').controller('InspectionQuestionController', ['$scope', '$rootScope', '$stateParams', 'Upload', '$location', '$window', 'Authentication', 'Users', 'Checklists', 'InspectionAnswers', 'Lightbox', 'PersistAnswerService', 'InspectionDates', 'cfpLoadingBar',
	function($scope, $rootScope, $stateParams, Upload, $location, $window, Authentication, Users, Checklists, InspectionAnswers, Lightbox, PersistAnswerService, InspectionDates, cfpLoadingBar) {

		$scope.userRoles = ['inspector'];
		$scope.authentication = Authentication;

		$scope.initialize = function() {
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.dateInputFormat = 'MM/dd/yyyy';
			$scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			};
			$scope.datePickerOpened = {
				main: false,
				sub: false
			};
			$scope.main_single = $scope.sub_single = '';
			$scope.data = {
				position: []
			};
			$scope.actions = {};
			$scope.inspectionDate = moment().format('MM/DD/YYYY');
			$scope.findQuestion($stateParams.checklistId, $stateParams.questionId);
		};

		$scope.openDatePicker = function($event, picker) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.datePickerOpened[picker] = true;
		};

		// Find existing User
		$scope.findQuestion = function(checklistId, questionId) {
			$scope.checklist = Checklists.get({
				checklistId: checklistId
			});
			$scope.checklist.$promise.then(function(response){
				$scope.question = response.questions[questionId].question;
				$scope.actions = {};
				for (var i = 0; i < $scope.question.conditionalActions.length; i++) {
					$scope.actions[$scope.question.conditionalActions[i].condition] = $scope.question.conditionalActions[i];
				}
				console.log('main: ', $scope.question);
				$scope.subQuestion = $scope.question.subQuestions[0];
				console.log('sub: ', $scope.subQuestion);
				$scope.subActions = {};
				if ($scope.subQuestion) {
					for (i = 0; i < $scope.subQuestion.actions.length; i++) {
						$scope.subActions[$scope.subQuestion.actions[i].condition] = $scope.subQuestion.actions[i];
					}
				}

				var answer = PersistAnswerService.get($scope.question._id);
				var latestInspection = InspectionDates.get({checklistId: checklistId, isSubmitted: -1});
				latestInspection.$promise.then(function(res_inspection) {
					if (!res_inspection.isSubmitted && !answer) {
						if (res_inspection.answers && res_inspection.answers.length > 0) {
							for (var i = 0; i < res_inspection.answers.length; i++) {
								if (res_inspection.answers[i].question == $scope.question._id) {
									answer = res_inspection.answers[i].data;
								}
							}
						}
					}
					$scope.picture = {
						content: [],
						name: []
					};

					if(answer) {
						$scope.data = angular.copy(answer.data);
						if ($scope.data.position) {
							$scope.data.position = [].concat( $scope.data.position );
						} else {
							$scope.data.position = [];
						}

						$scope.data.main_switchStatus = '';
						$scope.data.sub_switchStatus = '';
						$scope.action = angular.copy(answer.action);
						if($scope.action) $scope.data.main_switchStatus = $scope.action.condition;
						$scope.actionString = answer.actionString;
						$scope.subAction = angular.copy(answer.subAction);
						if($scope.subAction) $scope.data.sub_switchStatus = $scope.subAction.condition;
						$scope.subActionString = answer.subActionString;

						if ($scope.question.questionType === 'Single') {
							for (i = 0; i < $scope.question.conditionalActions.length; i++) {
								if ($scope.data.main_single &&
									($scope.question.conditionalActions[i].condition == $scope.data.main_single.condition) &&
									($scope.question.conditionalActions[i].value == $scope.data.main_single.value)) {
									$scope.data.main_single = $scope.question.conditionalActions[i];
								}
							}
						}
						if ($scope.subQuestion && $scope.subQuestion.type === 'Single') {
							for (i = 0; i < $scope.subQuestion.actions.length; i++) {
								if ($scope.data.sub_single &&
									($scope.subQuestion.actions[i].condition == $scope.data.sub_single.condition) &&
									($scope.subQuestion.actions[i].value == $scope.data.sub_single.value)) {
									$scope.data.sub_single = $scope.subQuestion.actions[i];
								}
							}
						}
						if(answer.data.pictureURL) {
							if (typeof answer.data.pictureURL == 'string') {
								$scope.picture.content.push('pictures/' + answer.data.pictureURL);
								$scope.picture.name.push(answer.data.pictureURL);
							} else {
								answer.data.pictureURL.forEach(function(item) {
									$scope.picture.content.push('pictures/' + item);
									$scope.picture.name.push(item);
								});
							}
						}
					} else {
						$scope.data = {
							main_switchStatus: '',
							sub_switchStatus: '',
							position: []
						};
					}
				});
			});
		};

		$scope.removePicture = function(index) {
			$scope.picture.content.splice(index, 1);
			$scope.picture.name.splice(index, 1);
		};

		$scope.openLightboxModal = function(index) {
			var imgs = [];
			$scope.picture.content.forEach(function(item) {
				imgs.push({
					url: item
				})
			});
			Lightbox.openModal(imgs, index);
		};

		$scope.goBack = function() {
			$location.path('inspection/checklists/' + $stateParams.checklistId);
			$location.hash('id-'+$stateParams.questionId);
		};

		$scope.toggleMainSwitch = function() {
			console.log('toggle: ', $scope.data.main_switchStatus);
			var toggle = '';
			if($scope.data.main_switchStatus == 'yes') {
				toggle = 'yes';
			} else if($scope.data.main_switchStatus == 'no') {
				toggle = 'no';
			} else if($scope.data.main_switchStatus == 'na') {
				toggle = 'na';
			}
			$scope.action = $scope.actions[toggle];
			$scope.actionString = 'You selected "' + toggle + '."';
		};

		$scope.evaluateNumber = function() {
			if(Number($scope.data.main_number) > $scope.actions.greaterThan.value) {
				$scope.action = $scope.actions.greaterThan;
				$scope.actionString = 'You entered a value greater than ' + $scope.actions.greaterThan.value + ' ' + $scope.question.numericUnit + '.';
			} else if(Number($scope.data.main_number) === $scope.actions.equal.value) {
				$scope.action = $scope.actions.equal;
				$scope.actionString = 'You entered a value equal to ' + $scope.actions.equal.value + ' ' + $scope.question.numericUnit + '.';
			} else if(Number($scope.data.main_number) < $scope.actions.lessThan.value) {
				$scope.action = $scope.actions.lessThan;
				$scope.actionString = 'You entered a value less than ' + $scope.actions.lessThan.value + ' ' + $scope.question.numericUnit + '.';
			} else {
				$scope.action = null;
				$scope.actionString = '';
			}
			console.log('selected action: ', $scope.action);
		};

		$scope.single_action_performed = function() {
			$scope.action = $scope.data.main_single;
			$scope.actionString = 'You selected "' + $scope.action.value + '".';
		};

		$scope.dateChanged = function() {
			var selectedDate = moment($scope.data.main_date);
			if(selectedDate.isAfter(moment($scope.actions.greaterThan.value), 'day')) {
				$scope.action = $scope.actions.greaterThan;
				$scope.actionString = 'You selected a date after ' + moment($scope.action.value).format('MM/DD/YYYY') + '.';
			} else if(selectedDate.isSame(moment($scope.actions.equal.value), 'day')) {
				$scope.action = $scope.actions.equal;
				$scope.actionString = 'You selected a date equal to ' + moment($scope.action.value).format('MM/DD/YYYY') + '.';
			} else if(selectedDate.isBefore(moment($scope.actions.lessThan.value), 'day')) {
				$scope.action = $scope.actions.lessThan;
				$scope.actionString = 'You selected a date before ' + moment($scope.action.value).format('MM/DD/YYYY') + '.';
			}  else {
				$scope.action = null;
				$scope.actionString = '';
			}
			console.log('selected action: ', $scope.action);
		};

		$scope.toggleSubSwitch = function() {
			console.log('toggle: ', $scope.data.sub_switchStatus);
			var toggle = '';
			if($scope.data.sub_switchStatus == 'yes') {
				toggle = 'yes';
			} else if($scope.data.sub_switchStatus == 'no') {
				toggle = 'no';
			} else if($scope.data.sub_switchStatus == 'na') {
				toggle = 'na';
			}
			$scope.subAction = $scope.subActions[toggle];
			$scope.subActionString = 'You selected "' + toggle + '."';
		};

		$scope.evaluateSubNumber = function() {
			if(Number($scope.data.sub_number) > $scope.subActions.greaterThan.value) {
				$scope.subAction = $scope.subActions.greaterThan;
				$scope.subActionString = 'You entered a value greater than ' + $scope.subActions.greaterThan.value + ' ' + $scope.subQuestion.numericUnit + '.';
			} else if(Number($scope.data.sub_number) === $scope.subActions.equal.value) {
				$scope.subAction = $scope.subActions.equal;
				$scope.subActionString = 'You entered a value equal to ' + $scope.subActions.equal.value + ' ' + $scope.subQuestion.numericUnit + '.';
			} else if(Number($scope.data.sub_number) < $scope.subActions.lessThan.value) {
				$scope.subAction = $scope.subActions.lessThan;
				$scope.subActionString = 'You entered a value less than ' + $scope.subActions.lessThan.value + ' ' + $scope.subQuestion.numericUnit + '.';
			} else {
				$scope.subAction = null;
				$scope.subActionString = '';
			}
			console.log('selected action: ', $scope.subAction);
		};

		$scope.single_subAction_performed = function() {
			$scope.subAction = $scope.data.sub_single;
			console.log('selected action: ', $scope.subAction);
			$scope.subActionString = 'You selected "' + $scope.subAction.value + '".';
		};

		$scope.subDateChanged = function() {
			var selectedDate = moment($scope.data.sub_date);
			if(selectedDate.isAfter(moment($scope.subActions.greaterThan.value), 'day')) {
				$scope.subAction = $scope.subActions.greaterThan;
				$scope.subActionString = 'You selected a date after ' + moment($scope.subAction.value).format('MM/DD/YYYY') + '.';
			} else if(selectedDate.isSame(moment($scope.subActions.equal.value), 'day')) {
				$scope.subAction = $scope.subActions.equal;
				$scope.subActionString = 'You selected a date equal to ' + moment($scope.subAction.value).format('MM/DD/YYYY') + '.';
			} else if(selectedDate.isBefore(moment($scope.subActions.lessThan.value), 'day')) {
				$scope.subAction = $scope.subActions.lessThan;
				$scope.subActionString = 'You selected a date before ' + moment($scope.subAction.value).format('MM/DD/YYYY') + '.';
			} else {
				$scope.subAction = null;
				$scope.subActionString = '';
			}
			console.log('selected action: ', $scope.subAction);
		};

  		$scope.onFileSelect = function(file) {
		  	$scope.isFileSelected = true;
		};

		$scope.$on('flow::fileSuccess', function (event, $flow, $file, $message) {
			$scope.$apply(function() {
				$scope.picture.name.push(JSON.parse($message).file);
				$scope.picture.content.push('pictures/' + JSON.parse($message).file);
				$flow.files = [];
				$scope.uploadCount++;
				if ($scope.uploadCount == $scope.filesCount) {
					cfpLoadingBar.complete();
				}
			});
		});

		$scope.$on('flow::filesAdded', function (event, $flow, $files) {
			$scope.progressUpload = true;
			$scope.filesCount = $files.length;
			$scope.uploadCount = 0;
			cfpLoadingBar.start();
		});

		$scope.addGeolocation = function() {
			if (navigator.geolocation) {
				console.log('geolocation: ', navigator.geolocation);
		        navigator.geolocation.getCurrentPosition(function(position){
					var latitude = position.coords.latitude.toString();
					var longitude = position.coords.longitude.toString();
					latitude = latitude.split('.')[0] + '.' + latitude.split('.')[1].substring(0, 5);
					longitude = longitude.split('.')[0] + '.' + longitude.split('.')[1].substring(0, 5);
					$scope.$apply(function() {
						$scope.data.position.push({
							latitude: latitude,
							longitude: longitude
						});
					});
		        }, function(err) {
					alert('Geolocation is not supported by this browser.');
		        }, {enableHighAccuracy: true, maximumAge: 10000});
		    } else {
		        $scope.error = 'Geolocation is not supported by this browser.';
		    }
		};

		$scope.removeGeolocation = function(index) {
			$scope.data.position.splice(index, 1);
		};

		$scope.save = function() {
			var answer = {};
			answer.data = angular.copy($scope.data);
			answer.action = angular.copy($scope.action);
			answer.actionString = $scope.actionString;
			answer.subAction = angular.copy($scope.subAction);
			answer.subActionString = $scope.subActionString;
			if (!answer.action || (answer.action && answer.action.action != 'action_sub')) {
				answer.subAction = null;
				answer.subActionString = '';
			}
			PersistAnswerService.set($scope.question._id, answer);
			$scope.inspectionAnswer = new InspectionAnswers({
				site: $scope.checklist.site._id,
				checklist: $scope.checklist._id,
				question: $scope.question._id,
				answer: answer,
				editor: $scope.authentication.user._id
			});
			$scope.inspectionAnswer.$save(function(){
				$location.path('inspection/checklists/' + $stateParams.checklistId);
				$location.hash('id-'+$stateParams.questionId);
			}, function(errorResponse) {
				if(errorResponse.data)
					$scope.error = errorResponse.data.message;
			});
		};

		$scope.saveAnswer = function() {
			$scope.data.pictureURL = $scope.picture.name;
			$scope.save();
			/*if ($scope.question.isPhoto && $scope.picture.content && $scope.isFileSelected) {
				Upload.upload({
			        url: 'inspections/savePicture',
			        data: {file: $scope.picture.content}
			    }).then(function(data, status, headers, config) {
			        // file is uploaded successfully
			        console.log('upload success: ', data);
			        $scope.data.pictureURL = data.data;
			        $scope.save();
			    });
			} else {
				//$scope.data.pictureURL = '';
				$scope.save();
			}*/
		};

		$scope.cancelAnswer = function() {
			$location.path('inspection/checklists/' + $stateParams.checklistId);
			$location.hash('id-'+$stateParams.questionId);
		};

	}
]);
