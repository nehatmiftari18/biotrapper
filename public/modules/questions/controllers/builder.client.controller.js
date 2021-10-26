'use strict';

// Questions controller
angular.module('questions').controller('BuildController', ['$scope', '$stateParams', '$location', 'Authentication', 'Questions', 'QuestionType', '$modal', 'Regulatories', 'Companies', 'RegulatoriesByCompany', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Questions, QuestionType, $modal, Regulatories, Companies, RegulatoriesByCompany, UserRole) {

		// initialize form
		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			// console.log('user: ', $scope.authentication.user);

			$scope.data = {};
			// Configuration for bootstrap ui datepicker
			$scope.dateFormats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			$scope.dateInputFormat = $scope.dateFormats[0];
	  		$scope.altInputFormats = ['M!/d!/yyyy'];
			$scope.opened = [];
			$scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			};
			$scope.checklists = [];
			$scope.regulatories = [];
			$scope.regulatory = [];
			$scope.type_numeric = {};

			if($stateParams.questionId) {
				$scope.findOne();
			} else {
				$scope.question = new Questions({
					keywords: [],
					regulatory: false,
					conditionalActions: [],
					subQuestions: [],
					isComment: false,
					isPhoto: false,
					isGeoTag: false,
					isMedia: false,
					updated: moment()
				});
				if(!$scope.isSuperAdmin) {
					$scope.question.company = Authentication.user.company;
				}
				$scope.breadcrumbLabel ='New Question';
				$scope.find();
			}

			$scope.multiselectSettings = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'name',
				idProp: '_id',
				smartButtonMaxItems: 3,
				smartButtonTextConverter: function(itemText, originalItem) {
					return itemText;
				}
			};
		};

		$scope.filterByCompany = function() {
			$scope.regulatory = [];
			if(!$scope.data.company)  {
				$scope.regulatories = [];
			} else {
				if ($scope.isSuperAdmin) {
					$scope.selectedCompany = $scope.data.company._id;
				} else {
					$scope.selectedCompany = $scope.data.company;
				}
				$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories.$promise.then(function (result) {

				});
			}
		};

		$scope.open = function($event, index) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    for (var key in $scope.opened) {
			  	if ($scope.opened.hasOwnProperty(key)) {
			    	$scope.opened[key] = false;
			  	}
			}
		    $scope.opened[index] = true;
		};

		// Find a list of Questions
		$scope.find = function() {
			// $scope.questions = Questions.query();
			$scope.companies = Companies.query();
			$scope.companies.$promise.then(function (result) {
				var keywords = [];
				Questions.query().$promise.then(function(response) {
					for(var i = 0; i < response.length; i++) {
						for(var j = 0; j < response[i].keywords.length; j++) {
							if(keywords.indexOf(response[i].keywords[j]) < 0) keywords.push(response[i].keywords[j]);
						}
					}
					$scope.returnKeywords = [];
					for(i = 0; i < keywords.length; i++) {
						$scope.returnKeywords.push({text: keywords[i]});
					}
					$scope.resetQuestion();
				});
			});
		};

		// Find existing Questions
		$scope.findOne = function() {
			$scope.question = Questions.get({
				questionId: $stateParams.questionId
			});
			$scope.question.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.question.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.question.company = $scope.question.company._id;
				}
				console.log('fetched: ', response);
				$scope.breadcrumbLabel = 'Question Details [' + $scope.question.text + ']';
				$scope.find();
			});
		};

		$scope.onTypeChanged = function() {
			var conditions = QuestionType.getConditions($scope.questionType);
			$scope.actions = [];
			for (var i = 0; i < conditions.length; i++) {
				var newCondition = {
					params: {
						text: conditions[i].text,
						inputType: conditions[i].inputType
					},
					action: {
						condition: conditions[i].condition,
						value: '',
					}
				};
				$scope.actions.push(newCondition);
			}
			if (!$scope.questionType  || $scope.questionType === 'Text') {
				$scope.subQuestions = [];
			} else {
				if(!$scope.subQuestions || $scope.subQuestions.length === 0) {
					$scope.subQuestions = [
						{
							text: '',
							actions: []
						}
					];
				}
			}
		};

		$scope.onSubTypeChanged = function(questionIndex) {
			var conditions = QuestionType.getConditions($scope.subQuestions[questionIndex].type);
			$scope.subQuestions[questionIndex].actions = [];
			for (var i = 0; i < conditions.length; i++) {
				var newCondition = {
					params: {
						text: conditions[i].text,
						inputType: conditions[i].inputType
					},
					action: {
						condition: conditions[i].condition,
						value: '',
					}
				};
				$scope.subQuestions[questionIndex].actions.push(newCondition);
			}
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
				return false;
			} else if(!$scope.questionText || !$scope.questionText.length) {
				$scope.error = 'Please type in the question text.';
				return false;
			} else if($scope.optRegulatory === 'yes' && $scope.regulatory.length == 0) {
				$scope.error = 'Please select regulatory framework.';
				return false;
			} else if(!$scope.questionType) {
				$scope.error = 'Please select question type.';
				return false;
			}

			for(var i=0; i<$scope.subQuestions.length; i++) {
				if($scope.subQuestions[i].text && !$scope.subQuestions[i].type) {
					$scope.error = 'Please select sub-question type.';
					return false;
				}
			}
			$scope.error = null;
			return true;
		};

		$scope.saveText = function(saveAll) {
			$scope.question.text = $scope.questionText;
			if ($scope.isSuperAdmin) {
				$scope.question.company = $scope.data.company._id;
			}
			$scope.question.updated = $scope.lastUpdated = moment();
			$scope.question.editor = $scope.authentication.user._id;
			$scope.saveKeywords();
		};

		$scope.resetText = function() {
			$scope.questionText = $scope.question.text;
			$scope.data.company = $scope.question.company;
			$scope.filterByCompany();
			if($scope.question.editor) {
				$scope.editor = ' by [' + $scope.question.editor.username + ']';
			} else {
				$scope.editor = '';
			}
		};

		$scope.saveKeywords = function(saveAll) {
			//var keywords = $scope.keywords.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/);
			var keywords = [];
			for(var i = 0; i < $scope.keywords.length; i++) {
				keywords.push($scope.keywords[i].text);
			}
			$scope.question.keywords = keywords;
			$scope.question.regulatory = $scope.optRegulatory === 'yes' ? true : false;
			if($scope.question.regulatory) {
				$scope.question.regulatory_framework = $scope.regulatory.map(function(item) {
					return item.id;
				});
			} else {
				$scope.question.regulatory_framework = [];
			}
			$scope.question.citation = $scope.citation;
			$scope.question.note = $scope.note;
			$scope.saveQuestionType();
			// $scope.question.$update(function(response){
			// 	if(saveAll) {
			// 		$scope.saveQuestionType(true);
			// 	}
			// 	// console.log('updated keywords: ', response);
			// });
		};

		$scope.resetKeywords = function() {
			//$scope.keywords = $scope.question.keywords.join();
			$scope.keywords=[];
			for(var i=0; i < $scope.question.keywords.length; i++) {
				$scope.keywords.push({text:$scope.question.keywords[i]});
			}
			$scope.regulatory = [].concat($scope.question.regulatory_framework || []);
			$scope.regulatory = $scope.regulatory.map(function(item) {
				return {id: item._id}
			});
			$scope.optRegulatory = $scope.question.regulatory ? 'yes' : 'no';
			$scope.citation = $scope.question.citation;
			$scope.note = $scope.question.note;
			$scope.checklists = $scope.question.checklists;
		};

		$scope.openChecklist = function(checklist) {
			$location.path('/checklists/' + checklist._id + '/edit');
		};

		$scope.saveQuestionType = function(saveAll) {
			$scope.question.questionType = $scope.questionType;
			$scope.question.numericUnit = $scope.type_numeric.numericUnit;
			var actions = [];
			for (var i = 0; i < $scope.actions.length; i++) {
				actions.push($scope.actions[i].action);
			}
			$scope.question.conditionalActions = angular.copy(actions);
			$scope.saveSubQuestions();
			// $scope.question.$update(function(response){
			// 	if(saveAll) {
			// 		$scope.saveSubQuestions(true);
			// 	}
			// 	// console.log('updated sub questions: ', response);
			// });
		};

		$scope.resetQuestionType = function() {
			$scope.questionType = $scope.question.questionType;
			$scope.type_numeric.numericUnit = $scope.question.numericUnit || '';
			$scope.onTypeChanged();
			for (var i = 0; i < $scope.actions.length; i++) {
				$scope.actions[i].action = angular.copy($scope.question.conditionalActions[i]);
			}
			// $scope.actions = angular.copy($scope.question.actions);
		};

		$scope.saveSubQuestions = function(saveAll) {
			$scope.question.subQuestions = angular.copy($scope.subQuestions);
			for (var j=0; j < $scope.subQuestions.length; j++) {
				var actions = [];
				for (var i = 0; i < $scope.subQuestions[j].actions.length; i++) {
					actions.push($scope.subQuestions[j].actions[i].action);
				}
				$scope.question.subQuestions[j].actions = angular.copy(actions);
			}
			$scope.saveSettings();
			// $scope.question.$update(function(response){
			// 	if(saveAll) {
			// 		$scope.saveSettings(true);
			// 	}
			// 	// console.log('updated settings: ', response);
			// });
		};

		$scope.resetSubQuestions = function() {
			$scope.subQuestions = angular.copy($scope.question.subQuestions);
			for (var j=0; j < $scope.subQuestions.length; j++) {
				$scope.onSubTypeChanged(j);
				for (var i = 0; i < $scope.subQuestions[j].actions.length; i++) {
					$scope.subQuestions[j].actions[i].action = angular.copy($scope.question.subQuestions[j].actions[i]);
				}
			}
		};

		$scope.saveSettings = function() {
			$scope.question.isComment = $scope.chk_comments;
			$scope.question.isPhoto = $scope.chk_photo;
			$scope.question.isGeoTag = $scope.chk_geoTag;
			$scope.question.isMedia = $scope.chk_media;
			// $scope.question.$update(function(response){
			// 	console.log('updated settings: ', response);
			// });
		};

		$scope.resetSettings = function() {
			$scope.chk_comments = $scope.question.isComment;
			$scope.chk_photo = $scope.question.isPhoto;
			$scope.chk_geoTag = $scope.question.isGeoTag;
			$scope.chk_media = $scope.question.isMedia;
		};

		$scope.saveQuestion = function() {
			if(!$scope.isFormValid()) return;
			console.log($scope.question);
			$scope.saveText(true);
			if($scope.question._id) {
				$scope.question.$update(function(){
					console.log('saved: ', $scope.question);
					$location.path('questions');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.question.$save(function(){
					console.log('saved: ', $scope.question);
					$location.path('questions');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.resetQuestion = function() {
			$scope.resetText();
			$scope.resetKeywords();
			$scope.resetQuestionType();
			$scope.resetSubQuestions();
			$scope.resetSettings();

			// console.log($scope.question);
			$scope.lastUpdated = moment($scope.question.updated).tz('America/New_York');
		};

		$scope.addCondition = function(qIndex) {			// qIndex for identifying sub-question. -1 if main question
			var newCondition = {
				params: {
					text: '',
					inputType: 'text'
				},
				action: {
					condition: 'equal',
					value: '',
				}
			};
			if(qIndex < 0) {
				$scope.actions.push(newCondition);
			} else{
				$scope.subQuestions[qIndex].actions.push(newCondition);
			}
		};

		$scope.removeCondition = function(qIndex, cIndex) {
			var modalInstance = $modal.open({
		      	templateUrl: 'modules/questions/views/modal-confirm.html',
		      	controller: 'ModalController',
		      	resolve: {}
		    });

		    modalInstance.result.then(function (modalResult) {
		    	if (modalResult === 'ok') {
		    		if(qIndex < 0) {
						$scope.actions.splice(cIndex, 1);
					} else {
						$scope.subQuestions[qIndex].actions.splice(cIndex, 1);
					}
			    }
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });

		};

		$scope.loadKeywordsTags = function(query) {
			return $scope.returnKeywords.filter(function( obj ) {
				return obj.text.toLowerCase().indexOf(query.toLowerCase()) > -1;
			});
		};

		$scope.cancel = function() {
			$location.path('questions');
		};
	}
]);
