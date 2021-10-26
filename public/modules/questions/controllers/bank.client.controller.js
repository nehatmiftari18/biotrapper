'use strict';

// Questions controller
angular.module('questions').controller('BankController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Questions', 'Companies', 'Regulatories', '$modal', 'QuestionsByCompany', 'RegulatoriesByCompany', 'UserRole',
	function($scope, $rootScope, $stateParams, $location, Authentication, Questions, Companies, Regulatories, $modal, QuestionsByCompany, RegulatoriesByCompany, UserRole) {
		$scope.filter = {
			filter_company: '',
			filter_keyword: '',
			filter_regulatory: ''
		};
		$scope.initScope = function() {
			// initialize form
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			$scope.filter.filter_company = $rootScope.question_filter_company || '';
			$rootScope.question_filter_company = '';

			$scope.typeString = {
				'none': 'none',
				'Yes/No': 'Yes/No toggle',
				'Yes/No/NA': 'Yes/No/NA toggle',
				'Numeric': 'Numerical entry',
				'Single': 'Single select',
				'Date': 'Date picker',
				'Text': 'Text entry'
			};
			$scope.orderCriterion = $rootScope.question_orderCriterion || 'updated';
			$rootScope.question_orderCriterion = '';
			if($rootScope.question_orderReverse === false) {
				$scope.orderReverse = false;
			}
			else {
				$scope.orderReverse = true;
			}
			$rootScope.question_orderReverse = '';

			$scope.companies = Companies.query();
			var defaultCompany = 'all';
			if (Authentication.user.role === UserRole.Administrator)
				defaultCompany = Authentication.user.company;
			$scope.selectedCompany = $rootScope.question_selectedCompany || defaultCompany;
			$rootScope.question_selectedCompany = '';

			$scope.find();
		};

		// Create new Question
		$scope.create = function() {
			// Create new Questoin object
			$location.path('/questions/new');
		};

		// Find a list of Questions
		$scope.find = function() {
			if($scope.selectedCompany === 'all') {
				$scope.questions = Questions.query();
				$scope.regulatories = Regulatories.query();
			} else {
				$scope.questions = QuestionsByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.selectedCompany});
			}

			$scope.questions.$promise.then(function (result) {
			    $scope.getKeywords();
			    $scope.filterQuestions();
			});
			$scope.regulatories.$promise.then(function (result) {
				$scope.filter.filter_regulatory = $rootScope.question_filter_regulatory || '';
				$rootScope.question_filter_regulatory = '';
			    $scope.filterQuestions();
			});
		};

		// Find existing Questions
		$scope.findOne = function(id) {
			$scope.question = Questions.get({
				questionId: id
			});
		};

		$scope.getKeywords = function() {
			$scope.keywords = [];
			for ( var i = 0; i < $scope.questions.length; i++ ) {
				var keywords = $scope.questions[i].keywords;
				for (var j=0; j<keywords.length; j++) {
					if($scope.keywords.indexOf(keywords[j]) < 0 && keywords[j]) {
						$scope.keywords.push(keywords[j]);
					}
				}
			}
			$scope.filter.filter_keyword = $rootScope.question_filter_keyword || '';
			$rootScope.question_filter_keyword = '';
		};

		$scope.openQuestion = function(question) {
			$rootScope.question_filter_company = $scope.filter.filter_company;
			$rootScope.question_filter_keyword = $scope.filter.filter_keyword;
			$rootScope.question_filter_regulatory = $scope.filter.filter_regulatory;
			$rootScope.question_orderReverse = $scope.orderReverse;
			$rootScope.question_orderCriterion = $scope.orderCriterion;
			$rootScope.question_selectedCompany = $scope.selectedCompany;
			$location.path('/questions/' + question._id + '/edit');
		};

		$scope.addToChecklist = function() {
			var selectedQuestions = [];
			for(var i = 0; i < $scope.questions.length; i++) {
				if($scope.questions[i].isChecked) {
					selectedQuestions.push($scope.questions[i]);
				}
			}
			if(selectedQuestions.length === 0) return;

			var modalInstance = $modal.open({
			    controller: 'ChecklistAddModalCtrl',
			    templateUrl: 'modules/questions/views/modal.add.checklist.html',
			    resolve: {
			     	questions: function () {
			        	return selectedQuestions;
			      	},
					isSuperAdmin: function() {
						return $scope.isSuperAdmin;
					},
					selectedCompany: function() {
						return $scope.selectedCompany;
					}
			    }
			});
			modalInstance.result.then(function (modalResult) {
		    	$scope.find();
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.openChecklist = function(checklist) {
			$location.path('/checklists/' + checklist._id + '/edit');
		};

		$scope.copyQuestion = function(originalQuestion) {
			var question = new Questions({
				regulatory: true
			});
			// console.log('original question: ', question, originalQuestion);

			question.text = 'Copy of ' + originalQuestion.text;
			question.citation = originalQuestion.citation;
			question.conditionalActions = angular.copy(originalQuestion.conditionalActions);
			question.isChecked = originalQuestion.isChecked;
			question.isComment = originalQuestion.isComment;
			question.isGeoTag = originalQuestion.isGeoTag;
			question.isMedia = originalQuestion.isMedia;
			question.isPhoto = originalQuestion.isPhoto;
			question.keywords = angular.copy(originalQuestion.keywords);
			question.note = originalQuestion.note;
			question.numericUnit = originalQuestion.numericUnit;
			question.questionType = originalQuestion.questionType;
			question.regulatory = originalQuestion.regulatory;
			question.regulatory_framework = originalQuestion.regulatory_framework?originalQuestion.regulatory_framework._id:null;
			question.subQuestions = angular.copy(originalQuestion.subQuestions);
			question.company = originalQuestion.company._id;
			question.updated = moment();

			// console.log('question: ', question);
			question.$save(function(){
				// console.log('new question: ', question);
				question.company = originalQuestion.company;
				$scope.questions.push(question);
				$scope.filterQuestions();
			}, function(error) {
				console.log(error);
			});
		};

		$scope.picture = {};
		$scope.copyQuestions = function() {
			var selectedQuestions = [];
			for(var i = 0; i < $scope.questions.length; i++) {
				if($scope.questions[i].isChecked)
					selectedQuestions.push($scope.questions[i]);
			}
			if(selectedQuestions.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'CopyModalController',
			    templateUrl: 'modules/questions/views/modal.copy.question.html',
			    resolve: {
			     	questions: function () {
			        	return selectedQuestions;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
		    	for(var i = 0; i < $scope.questions.length; i++) {
					if($scope.questions[i].isChecked) {
						$scope.copyQuestion($scope.questions[i]);
						$scope.questions[i].isChecked = false;
					}
				}
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		// Delete selected questions
		$scope.deleteQuestion = function() {
			var selectedQuestions = [];
			for(var i = 0; i < $scope.questions.length; i++) {
				if($scope.questions[i].isChecked)
					selectedQuestions.push($scope.questions[i]);
			}
			if(selectedQuestions.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'QuestionDelModalCtrl',
			    templateUrl: 'modules/questions/views/modal.delete.question.html',
			    resolve: {
			     	questions: function () {
			        	return selectedQuestions;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
				var i = $scope.questions.length;
				while (i--) {
					if($scope.questions[i].isChecked) {
						// $scope.questions[i].$delete();
						Questions.delete({questionId: $scope.questions[i]._id});
						$scope.questions.splice(i, 1);
					}
				}
				$scope.filterQuestions();
				console.log('after deletion: ', $scope.questions);
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.generateDate = function(dateStr) {
			return moment(dateStr).tz('America/New_York').format('MM/DD/YYYY HH:mm a');
		};

		$scope.filterByCompany = function() {
			if(!$scope.filter.filter_company)  {
				$scope.selectedCompany = 'all';
			} else {
				$scope.selectedCompany = $scope.filter.filter_company._id;
			}
			$scope.find();
		};

		$scope.filterQuestions = function() {
			$scope.filteredQuestions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if (($scope.filter.filter_keyword === undefined) || 			// filter by keyword
					(!$scope.filter.filter_keyword) ||
					($scope.questions[i].keywords.indexOf($scope.filter.filter_keyword) >= 0)) {
					if (($scope.filter.filter_regulatory === undefined) || 			// filter by regulation
						(!$scope.filter.filter_regulatory) ||
						($scope.questions[i].regulatory_framework._id === $scope.filter.filter_regulatory._id)) {
						$scope.filteredQuestions.push($scope.questions[i]);
					}
				}
			}
		};

		$scope.sortBy = function(criterion) {
			if($scope.orderCriterion === criterion) {
				$scope.orderReverse = !$scope.orderReverse;
			} else {
				if(criterion === 'updated') {
					$scope.orderReverse = true;
				} else {
					$scope.orderReverse = false;
				}
				$scope.orderCriterion = criterion;
			}
		};
	}
]);
