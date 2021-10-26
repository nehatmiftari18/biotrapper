'use strict';

// Questions controller
 angular.module('inspection').controller('InspectionChecklistController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Users', 'Checklists', 'Inspections', 'PersistService', 'InspectionDates', '$q', 'PersistAnswerService',
	function($scope, $rootScope, $stateParams, $location, Authentication, Users, Checklists, Inspections, PersistService, InspectionDates, $q, PersistAnswerService) {
		$scope.userRoles = ['inspector'];
		$scope.authentication = Authentication;
		$scope.now = new Date()
		$scope.initialize = function() {
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.dateInputFormat = 'MM/dd/yyyy';
			$scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			};
			$scope.datePickerOpened = false;
			$scope.inspectionDate = PersistService.get();
			if (typeof $scope.inspectionDate == 'object' || $scope.inspectionDate == 'Invalid date') {
				$scope.inspectionDate = moment().format('MM/DD/YYYY');
			}
			$scope.answers = [];
			$scope.findChecklist($stateParams.checklistId);
		};

		$scope.openDatePicker = function($event, picker) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    $scope.datePickerOpened = true;
		};

		// Find existing User
		$scope.findChecklist = function(id) {

			$scope.checklist = Checklists.get({
				checklistId: id
			});
			$scope.checklist.$promise.then(function(response){
				console.log('checklist: ', response);
				$scope.answered_questions = PersistAnswerService.getAnsweredQuestions();
				var latestInspection = InspectionDates.get({checklistId: id, isSubmitted: -1});
				latestInspection.$promise.then(function(res_inspection) {
					if (res_inspection && !res_inspection.isSubmitted) {
						if (res_inspection.date) {
							$scope.inspectionDate = res_inspection.date;
						}
						$scope.answers = res_inspection.answers;
						if(res_inspection.answers && res_inspection.answers.length > 0) {
							for(var i = 0; i < res_inspection.answers.length; i++) {
								if (res_inspection.answers[i].data && $scope.answered_questions.indexOf(res_inspection.answers[i].question) < 0) {
									if (res_inspection.answers[i].data.data.main_text != "") {
										if (res_inspection.answers[i].data.data.main_text == undefined) {
											if (res_inspection.answers[i].data.data.main_single != "") {
												if (res_inspection.answers[i].data.data.main_single == undefined) {
													if (res_inspection.answers[i].data.data.main_date != "") {
														if (res_inspection.answers[i].data.data.main_date == undefined) {
															if (res_inspection.answers[i].data.data.main_number != "") {
																if (res_inspection.answers[i].data.data.main_number == undefined) {

																} else {
																	$scope.answered_questions.push(res_inspection.answers[i].question);
																}
															}
														} else {
															$scope.answered_questions.push(res_inspection.answers[i].question);
														}
													}
												} else {
													$scope.answered_questions.push(res_inspection.answers[i].question);
												}
											}
										} else {
											$scope.answered_questions.push(res_inspection.answers[i].question);
										}
									}
									if (typeof res_inspection.answers[i].data.data.main_switchStatus == 'string' && res_inspection.answers[i].data.data.main_switchStatus != "") {
										if (res_inspection.answers[i].data.data.main_single === undefined &&	res_inspection.answers[i].data.data.main_text === undefined && res_inspection.answers[i].data.data.main_date === undefined &&	res_inspection.answers[i].data.data.main_number === undefined) {
											$scope.answered_questions.push(res_inspection.answers[i].question);
										}
									}
								}
							}
						}
					}
				});

			});
		};

		$scope.$watch('inspectionDate', function(newVal, oldVal) {
			//PersistService.set(moment(newVal).format('MM/DD/YYYY'));
		});

		$scope.viewQuestionDetails = function(questionIndex) {
			PersistService.set(moment($scope.inspectionDate).format('MM/DD/YYYY'));
			$location.path('inspection/checklists/' + $stateParams.checklistId + '/questions/' + questionIndex);
		};

		$scope.checkMandatoryAnswers = function() {
			for (var i=0; i<$scope.checklist.questions.length; i++) {
				if ($scope.checklist.questions[i].mandatory) {
					if ($scope.answered_questions.indexOf($scope.checklist.questions[i].question._id) < 0){
						$scope.error = 'Please answer all mandatory questions to submit. (Questions w/ a red asterisk.)';
						return false;
					}
				}
			}
			return true;
		};

		$scope.submitInspection = function() {
			if (!$scope.checkMandatoryAnswers()) return;
			var answers = [];
			for (var i=0; i<$scope.checklist.questions.length; i++) {
				var answer_data = {
					question: $scope.checklist.questions[i].question._id,
				};
				if ($scope.answers && $scope.answers.length > 0) {
					var question_answer = $scope.answers.filter(function(obj) {
						return obj.question == answer_data.question
					});

					if(question_answer.length > 0) {
						answer_data.data = question_answer[0].data;
					}
				}
				var question_answer = PersistAnswerService.get($scope.checklist.questions[i].question._id)
				if (question_answer) {
					answer_data.data = question_answer;
				}

				answers.push(answer_data);
			}

			var interval = $scope.checklist.frequency.interval || 1;
			var dueDates = [];
			$scope.inspectionDate = new Date($scope.inspectionDate).setHours(12);
			var tmpDate = $scope.inspectionDate ? new Date($scope.inspectionDate) : new Date();
			var maxDueDate = $scope.inspectionDate ? new Date($scope.inspectionDate) : new Date();
			maxDueDate.setFullYear(maxDueDate.getFullYear() + 2);
			while( new Date(tmpDate) <= maxDueDate) {
				dueDates.push(new Date(tmpDate));
				tmpDate = moment(tmpDate);
				if ($scope.checklist.frequency.period === 'due') {
					var freqType = $scope.checklist.frequency.type;
					var freqDueValue = $scope.checklist.frequency.due?$scope.checklist.frequency.due.value:0;
					var freqDueWeek = $scope.checklist.frequency.due?$scope.checklist.frequency.due.dueWeek:0;
					if (freqType === 'Daily') {
						tmpDate.add(1, 'days').hour(freqDueValue).minute(0).second(0);
					} else if (freqType === 'Weekly') {
						if (freqDueValue === 0)
							tmpDate.day(7);
						else
							tmpDate.day(Number(freqDueValue) + 7);
					} else if (freqType === 'Biweekly' || freqType ==='Bi-weekly') {
						if (freqDueValue === 0)
							tmpDate.day(14);
						else
							tmpDate.day(Number(freqDueValue) + 14);
					} else if (freqType === 'Monthly') {
						var nextMonthDay = tmpDate.endOf('month').add(1, 'days');
						var add = (freqDueValue - nextMonthDay.day() + 7) % 7 + Number(freqDueWeek) * 7;
						nextMonthDay.set('date', 1 + add);
						tmpDate = nextMonthDay;
					} else if (freqType === 'Quarterly') {
						var quater = tmpDate.quarter();
						tmpDate.set('month', quater * 3);
						tmpDate.set('date', parseInt(freqDueValue)+1);
					} else if (freqType === 'Annually') {
						tmpDate.add(1, 'years');
						tmpDate.set('month', freqDueWeek).set('date', parseInt(freqDueValue) + 1);
					}
				} else if ($scope.checklist.frequency.period === 'interval') {
					tmpDate.add(interval, 'days');
				}
				//tmpDate.setDate(tmpDate.getDate() + interval);
			}
			$scope.inspection = new Inspections({
				date: new Date($scope.inspectionDate),
				site: $scope.checklist.site._id,
				checklist: $scope.checklist._id,
				answers: answers,
				isSubmitted: true,
				editor: $scope.authentication.user._id,
				dueDates: dueDates
			});
			$scope.inspection.$save(function(){
				console.log('saved: ', $scope.inspection);
				PersistService.clear();
				PersistAnswerService.clear();
				$location.path('inspection');
			}, function(errorResponse) {
				if(errorResponse.data)
					$scope.error = errorResponse.data.message;
			});
		};

		$scope.saveInspection = function() {
			var answers = [];
			for (var i=0; i<$scope.checklist.questions.length; i++) {
				var answer_data = {
					question: $scope.checklist.questions[i].question._id,
				};
				if ($scope.answers && $scope.answers.length > 0) {
					var question_answer = $scope.answers.filter(function(obj) {
						return obj.question == answer_data.question
					});

					if(question_answer.length > 0) {
						answer_data.data = question_answer[0].data;
					}
				}
				var question_answer = PersistAnswerService.get($scope.checklist.questions[i].question._id)
				if (question_answer) {
					answer_data.data = question_answer;
				}

				answers.push(answer_data);
			}

			var interval = $scope.checklist.frequency.interval;
			var dueDates = [];
			$scope.inspectionDate = new Date($scope.inspectionDate).setHours(12);
			var tmpDate = $scope.inspectionDate ? new Date($scope.inspectionDate) : new Date();
			var maxDueDate = $scope.inspectionDate ? new Date($scope.inspectionDate) : new Date();
			maxDueDate.setFullYear(maxDueDate.getFullYear() + 2);
			while( new Date(tmpDate) <= maxDueDate) {
				dueDates.push(new Date(tmpDate));
				tmpDate = moment(tmpDate);
				if ($scope.checklist.frequency.period === 'due') {
					var freqType = $scope.checklist.frequency.type;
					var freqDueValue = $scope.checklist.frequency.due?$scope.checklist.frequency.due.value:0;
					var freqDueWeek = $scope.checklist.frequency.due?$scope.checklist.frequency.due.dueWeek:0;
					if (freqType === 'Daily') {
						tmpDate.add(1, 'days').hour(freqDueValue).minute(0).second(0);
					} else if (freqType === 'Weekly') {
						if (freqDueValue === 0)
							tmpDate.day(7);
						else
							tmpDate.day(Number(freqDueValue) + 7);
					} else if (freqType === 'Biweekly' || freqType ==='Bi-weekly') {
						if (freqDueValue === 0)
							tmpDate.day(14);
						else
							tmpDate.day(Number(freqDueValue) + 14);
					} else if (freqType === 'Monthly') {
						var nextMonthDay = tmpDate.endOf('month').add(1, 'days');
						var add = (freqDueValue - nextMonthDay.day() + 7) % 7 + Number(freqDueWeek) * 7;
						nextMonthDay.set('date', 1 + add);
						tmpDate = nextMonthDay;
					} else if (freqType === 'Quarterly') {
						var quater = tmpDate.quarter();
						tmpDate.set('month', quater * 3);
						tmpDate.set('date', parseInt(freqDueValue)+1);
					} else if (freqType === 'Annually') {
						tmpDate.add(1, 'years');
						tmpDate.set('month', freqDueWeek).set('date', parseInt(freqDueValue) + 1);
					}
				} else if ($scope.checklist.frequency.period === 'interval') {
					tmpDate.add(interval, 'days');
				}
				//tmpDate.setDate(tmpDate.getDate() + interval);
			}
			$scope.inspection = new Inspections({
				date: new Date($scope.inspectionDate),
				site: $scope.checklist.site._id,
				checklist: $scope.checklist._id,
				answers: answers,
				isSubmitted: false,
				editor: $scope.authentication.user._id,
				dueDates: dueDates
			});
			$scope.inspection.$save(function(){
				console.log('saved: ', $scope.inspection);
				PersistService.clear();
				PersistAnswerService.clear();
				$location.path('inspection');
			}, function(errorResponse) {
				if(errorResponse.data)
					$scope.error = errorResponse.data.message;
			});
		};

		$scope.discard = function() {
			PersistService.clear();
			PersistAnswerService.clear();
			$location.path('inspection');
		};

		$scope.goBack = function() {
			PersistAnswerService.clear();
			$location.path('inspection');
		};
	}
]);
