'use strict';

// Checklists controller
angular.module('checklists').controller('ChecklistBuildController', ['$scope', '$stateParams', '$location', 'Authentication', 'Checklists', '$modal', 'Companies', 'Questions', 'Sites', 'Frequencies', 'SitesByCompany', 'FrequenciesByCompany', 'Regulatories', 'RegulatoriesByCompany', 'UserRole', 'InspectorsByCompany', 'SupervisorsByCompany', '$anchorScroll',
	function($scope, $stateParams, $location, Authentication, Checklists, $modal, Companies, Questions, Sites, Frequencies, SitesByCompany, FrequenciesByCompany, Regulatories, RegulatoriesByCompany, UserRole, InspectorsByCompany, SupervisorsByCompany, $anchorScroll) {

		// initialize form
		$scope.initialize = function() {

			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;

			$scope.typeString = {
				'none': 'none',
				'Yes/No': 'Yes/No toggle',
				'Yes/No/NA': 'Yes/No/NA toggle',
				'Numeric': 'Numerical entry',
				'Single': 'Single select',
				'Date': 'Date picker',
				'Text': 'Text entry'
			};

			$scope.data = {};
			$scope.orderReverse = true;
			$scope.orderCriterion = 'updated';
			$scope.removedQuestions = [];
			$scope.relatedQuestions = [];
			$scope.filteredQuestions = [];
			$scope.notifiers_list = [];
			$scope.companies = Companies.query();
			$scope.reminders = [{
				number: "",
				durationType: null,
				beforeAfterOn: null,
				hasCustomText: false,
				customText: "",
				notifiers: []
			}, {
				number: "",
				durationType: null,
				beforeAfterOn: null,
				hasCustomText: false,
				customText: "",
				notifiers: []
			}, {
				number: "",
				durationType: null,
				beforeAfterOn: null,
				hasCustomText: false,
				customText: "",
				notifiers: []
			}];
			$scope.is_primary_user = 'true';
			$scope.is_secondary_user = 'true';
			$scope.is_tertiary_user = 'true';

			$scope.multiselectSettings = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'displayName',
				idProp: '_id',
				smartButtonMaxItems: 100,
				smartButtonTextConverter: function(itemText, originalItem) {
					return itemText;
				}
			};

			$scope.showSearch = false;
			$scope.filterCondition = {};
			$scope.values={};

			if($stateParams.checklistId) {
				$scope.findOne($stateParams.checklistId);
			} else {
				$scope.checklist = new Checklists({
					updated: moment()
				});
				if(!$scope.isSuperAdmin) {
					$scope.checklist.company = Authentication.user.company;
					$scope.filterCondition.filter_company = {_id: Authentication.user.company};
				}
				$scope.selectedCompany = Authentication.user.company;
				$scope.breadcrumbLabel ='New Checklist';
				$scope.find();
			}
		};

		// Find a list of Checklists
		$scope.find = function() {
			$scope.questions = Questions.query();
			if($scope.selectedCompany === 'none') {
				$scope.frequencies = [];
				$scope.sites = [];
				$scope.inspectors = [];
				$scope.supervisors = [];
			} else {
				$scope.inspectors = InspectorsByCompany.query({companyId: $scope.selectedCompany});
				$scope.supervisors = SupervisorsByCompany.query({companyId: $scope.selectedCompany});
				$scope.frequencies = FrequenciesByCompany.query({companyId: $scope.selectedCompany});
				$scope.sites = SitesByCompany.query({companyId: $scope.selectedCompany});
				$scope.sites.$promise.then(function(res) {
					$scope.resetChecklist();
				}, function(err) {
					$scope.resetChecklist();
				});
			}
			$scope.questions.$promise.then(function (result) {
			    $scope.getKeywords();
			    $scope.resetQuestions();
			    $scope.filterQuestionsByCompany();
			});
		};

		$scope.validateEmail =  function (email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		};

		$scope.updateNotifierList = function() {
			$scope.notifiers_list = [];
			if ($scope.primary_inspector) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.primary_inspector._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.primary_inspector);
				}
			}
			if ($scope.secondary_inspector) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.secondary_inspector._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.secondary_inspector);
				}
			}
			if ($scope.tertiary_inspector) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.tertiary_inspector._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.tertiary_inspector);
				}
			}
			if ($scope.is_primary_user == 'true' && $scope.primary_supervisor) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.primary_supervisor._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.primary_supervisor);
				}
			}

			if ($scope.is_secondary_user == 'true' && $scope.secondary_supervisor) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.secondary_supervisor._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.secondary_supervisor);
				}
			}

			if ($scope.is_tertiary_user == 'true' && $scope.tertiary_supervisor) {
				var tmp = $scope.notifiers_list.filter(function(item) {
					return item._id == $scope.tertiary_supervisor._id;
				});
				if (tmp.length == 0) {
					$scope.notifiers_list.push($scope.tertiary_supervisor);
				}
			}

			if ($scope.is_primary_user == 'false' && $scope.primary_supervisor_email !== "") {
				if ($scope.validateEmail($scope.primary_supervisor_email)) {
					var tmp = $scope.notifiers_list.filter(function (item) {
						return item._id == $scope.primary_supervisor_email;
					});
					if (tmp.length == 0) {
						$scope.notifiers_list.push({
							_id: $scope.primary_supervisor_email,
							displayName: $scope.primary_supervisor_email,
							emailAddr: true
						});
					}
				} else {
					$scope.primary_supervisor_email = "";
				}
			}

			if ($scope.is_secondary_user == 'false' && $scope.secondary_supervisor_email !== "") {
				if ($scope.validateEmail($scope.secondary_supervisor_email)) {
					var tmp = $scope.notifiers_list.filter(function(item) {
						return item._id == $scope.secondary_supervisor_email;
					});
					if (tmp.length == 0) {
						$scope.notifiers_list.push({
							_id: $scope.secondary_supervisor_email,
							displayName: $scope.secondary_supervisor_email,
							emailAddr: true
						});
					}
				} else {
					$scope.secondary_supervisor_email = "";
				}
			}

			if ($scope.is_tertiary_user == 'false' && $scope.tertiary_supervisor_email !== "") {
				if ($scope.validateEmail($scope.tertiary_supervisor_email)) {
					var tmp = $scope.notifiers_list.filter(function (item) {
						return item._id == $scope.tertiary_supervisor_email;
					});
					if (tmp.length == 0) {
						$scope.notifiers_list.push({
							_id: $scope.tertiary_supervisor_email,
							displayName: $scope.tertiary_supervisor_email,
							emailAddr: true
						});
					}
				} else {
					$scope.tertiary_supervisor_email = "";
				}
			}
		};

		$scope.customizeReminderText = function(reminder) {
			reminder.hasCustomText = !reminder.hasCustomText;
			if (reminder.beforeAfterOn == "On") {
				reminder.customText = "This inspection is due today. ([Due Date]) Please make sure you plan accordingly.";
			}
			if (reminder.beforeAfterOn == "Before") {
				reminder.customText = "This inspection is due in " + reminder.number + " " + reminder.durationType + " . ([Due Date]) Please make sure you plan accordingly.";
			}
			if (reminder.beforeAfterOn == "After") {
				reminder.customText = "This inspection was due " + reminder.number + " " + reminder.durationType + " ago. ([Due Date])";
			}

		};

		$scope.updateReminderState = function(reminder) {
			if (reminder.beforeAfterOn == "On") {
				reminder.number = "";
				reminder.durationType = "";
				reminder.customText = "This inspection is due today. ([Due Date]) Please make sure you plan accordingly.";
			}
			if (reminder.beforeAfterOn == "Before") {
				reminder.customText = "This inspection is due in " + reminder.number + " " + reminder.durationType + " . ([Due Date]) Please make sure you plan accordingly.";
			}
			if (reminder.beforeAfterOn == "After") {
				reminder.customText = "This inspection was due " + reminder.number + " " + reminder.durationType + " ago. ([Due Date])";
			}
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
			$scope.returnKeywords = [];
			for(i = 0; i < $scope.keywords.length; i++) {
				$scope.returnKeywords.push({text: $scope.keywords[i]});
			}
		};

		// Find existing C hecklists
		$scope.findOne = function(id) {
			$scope.checklist = Checklists.get({
				checklistId: $stateParams.checklistId
			});
			$scope.checklist.$promise.then(function(response){
				// console.log('fetched: ', response);
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.checklist.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
				}
				$scope.selectedCompany = $scope.checklist.company._id;
				$scope.filterCondition.filter_company = $scope.checklist.company;
				// $scope.checklist.company = $scope.checklist.company._id;
				$scope.breadcrumbLabel = 'Checklist Details [' + $scope.checklist.name + ']';
				$scope.find();
			});
		};

		$scope.toggleSearch = function() {
			$scope.showSearch = !$scope.showSearch;
			$scope.filterQuestions();
			if($scope.showSearch) {
				$location.hash('bottom');
			} else {
				$location.hash('');
			}
			$anchorScroll();
		};

		$scope.openQuestion = function(question) {
			$location.path('/questions/' + question._id + '/edit');
		};

		$scope.filterByCompany = function() {
			$scope.site = null;
			$scope.frequency = null;
			$scope.filterCondition.filter_company = $scope.data.company;
			if(!$scope.data.company)  {
				$scope.selectedCompany = 'none';
				$scope.sites = [];
				$scope.frequencies = [];
				$scope.inspectors = [];
				$scope.supervisors = [];
			} else {
				if ($scope.isSuperAdmin) {
					$scope.selectedCompany = $scope.data.company._id;
				} else {
					$scope.selectedCompany = $scope.data.company;
				}
				$scope.frequencies = FrequenciesByCompany.query({companyId: $scope.selectedCompany});
				$scope.sites = SitesByCompany.query({companyId: $scope.selectedCompany});
				$scope.inspectors = InspectorsByCompany.query({companyId: $scope.selectedCompany});
				$scope.supervisors = SupervisorsByCompany.query({companyId: $scope.selectedCompany});
			}
			$scope.filterQuestions();
		};

		$scope.getFilterKeywords = function() {
			var filterCompanyId = null;
			if (!$scope.isSuperAdmin) {
				filterCompanyId = $scope.selectedCompany;
			} else {
				if ($scope.filterCondition.filter_company) {
					filterCompanyId = $scope.filterCondition.filter_company._id;
				}
			}
			$scope.filterKeywords = [];
			for ( var i = 0; i < $scope.questions.length; i++ ) {
				if (!filterCompanyId || $scope.questions[i].company._id == filterCompanyId) {
					var keywords = $scope.questions[i].keywords;
					for (var j=0; j<keywords.length; j++) {
						if($scope.filterKeywords.indexOf(keywords[j]) < 0 && keywords[j]) {
							$scope.filterKeywords.push(keywords[j]);
						}
					}
				}
			}
		};

		$scope.filterQuestionsByCompany = function() {
			$scope.filterCondition.filter_regulatory = null;
			if ($scope.isSuperAdmin) {
				if (!$scope.filterCondition.filter_company) {
					$scope.regulatories = Regulatories.query();
				} else {
					$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.filterCondition.filter_company._id});
				}
			} else {
				$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.selectedCompany});
			}
			$scope.getFilterKeywords();
		};

		$scope.filterQuestionsByText = function(event) {
			if (event.keyCode == 13) {
				$scope.filterQuestions();
			}
		};

		$scope.filterQuestions = function() {
			$scope.filteredQuestions = [];
			for (var i = 0; i < $scope.questions.length; i++) {
				if ((!$scope.filterCondition.filter_title) ||
					($scope.questions[i].text.toLowerCase().indexOf($scope.filterCondition.filter_title.toLowerCase()) > -1)) {		// filter by title

					if (($scope.filterCondition.filter_company === undefined) || 			// filter by company
						(!$scope.filterCondition.filter_company) ||
						($scope.questions[i].company._id === $scope.filterCondition.filter_company._id)) {
						console.log($scope.filterCondition.filter_keyword);
						if (($scope.filterCondition.filter_keyword === undefined) || 			// filter by keyword
							(!$scope.filterCondition.filter_keyword) ||
							($scope.questions[i].keywords.indexOf($scope.filterCondition.filter_keyword) >= 0)) {
							if (($scope.filterCondition.filter_regulatory === undefined) || 			// filter by regulation
								(!$scope.filterCondition.filter_regulatory) ||
								($scope.questions[i].regulatory_framework && $scope.questions[i].regulatory_framework._id === $scope.filterCondition.filter_regulatory._id)) {
								if(!$scope.isQuestionAdded($scope.questions[i]._id))
									$scope.filteredQuestions.push($scope.questions[i]);
							}
						}
					}
				}
			}
		};

		$scope.getChecklistString = function(question) {
			var checklist = [];
			for (var i = 0; i < question.checklists.length - 1; i++) {
				if (checklist.indexOf(question.checklists[i].name) < 0) {
					checklist.push(question.checklists[i].name);
				}
			}
			return checklist.join();
		};

		$scope.isQuestionAdded = function(questionId) {
			for (var i=0; i<$scope.relatedQuestions.length; i++) {
				if($scope.relatedQuestions[i].question) {
					if($scope.relatedQuestions[i].question._id === questionId)
						return true;
				}
			}
			return false;
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

		$scope.generateDate = function(dateStr) {
			return moment(dateStr).format('MM/DD/YYYY HH:mm');
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
				return false;
			} else if(!$scope.values.checklistText || $scope.values.checklistText.length < 1) {
				$scope.error = 'Please type in the checklist text.';
				return false;
			} else if (!$scope.site) {
				$scope.error = 'Please select site.';
				return false;
			} else if (!$scope.frequency) {
				$scope.error = 'Please select required frequency.';
				return false;
			}

			$scope.error = null;
			return true;
		};

		$scope.orderQuestions = function(index) {
			var newIndex = Number($scope.relatedQuestions[index].order) - 1;
			var temp = $scope.relatedQuestions[index];

			if(index > newIndex) {
				for (var i=index; i>newIndex; i--) {
					$scope.relatedQuestions[i-1].order = Number($scope.relatedQuestions[i-1].order) + 1;
					$scope.relatedQuestions[i] = $scope.relatedQuestions[i-1];
				}
			} else {
				for (var j=index; j<newIndex; j++) {
					$scope.relatedQuestions[j+1].order = Number($scope.relatedQuestions[j+1].order) - 1;
					$scope.relatedQuestions[j] = $scope.relatedQuestions[j+1];
				}
			}
			$scope.relatedQuestions[newIndex] = temp;
			console.log($scope.relatedQuestions);
			//$scope.$apply();
		};

		$scope.addQuestions = function() {
			for (var i=0; i<$scope.filteredQuestions.length; i++) {
				if($scope.filteredQuestions[i].isChecked) {
					$scope.filteredQuestions[i].regulatory_framework = [].concat($scope.filteredQuestions[i].regulatory_framework || []);
					var newQuestion = {
						order: $scope.relatedQuestions.length + 1,
						mandatory: 'yes',
						question: $scope.filteredQuestions[i]
					};
					$scope.relatedQuestions.push(newQuestion);
				}
			}
			$scope.showSearch = false;
			$scope.filteredQuestions = [];
		};

		$scope.removeQuestion = function(index) {
			var modalInstance = $modal.open({
		      	templateUrl: 'modules/checklists/views/modal.delete.question.html',
		      	controller: 'ModalController',
		      	resolve: {}
		    });

		    modalInstance.result.then(function (modalResult) {
				$scope.removedQuestions.push($scope.relatedQuestions[index]);
		    	$scope.relatedQuestions.splice(index, 1);
				angular.forEach($scope.relatedQuestions, function(item, i) {
					item.order = i + 1;
				});
		    	if($scope.showSearch) {
		    		$scope.filterQuestions();
		    	}
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.cancelSearch = function() {
			$scope.filteredQuestions = [];
			$scope.showSearch = false;
		};

		$scope.saveChecklist = function() {
			if(!$scope.isFormValid()) return;
			$scope.checklist.updated = $scope.lastUpdated = moment();
			if ($scope.isSuperAdmin) {
				$scope.checklist.company = $scope.data.company._id;
			}
			$scope.checklist.name = $scope.values.checklistText;
			$scope.checklist.citation = $scope.values.citation;
			$scope.checklist.note = $scope.values.note;
			var keywords = [];
			for(var i = 0; i < $scope.values.keywords.length; i++) {
				keywords.push($scope.values.keywords[i].text);
			}
			$scope.checklist.keywords = keywords;
			$scope.checklist.site = $scope.site._id;
			$scope.checklist.frequency = $scope.frequency._id;
			$scope.checklist.editor = $scope.authentication.user._id;
			$scope.checklist.primary_inspector = $scope.primary_inspector?$scope.primary_inspector._id:null;
			$scope.checklist.secondary_inspector = $scope.secondary_inspector?$scope.secondary_inspector._id:null;
			$scope.checklist.tertiary_inspector = $scope.tertiary_inspector?$scope.tertiary_inspector._id:null;
			$scope.checklist.primary_supervisor = null;
			if ($scope.is_primary_user == 'true') {
				$scope.checklist.primary_supervisor = $scope.primary_supervisor?$scope.primary_supervisor._id:null;
				$scope.checklist.primary_supervisor_email = '';
			} else {
				$scope.checklist.primary_supervisor_email = $scope.primary_supervisor_email;
			}
			$scope.checklist.secondary_supervisor = null;
			if ($scope.is_secondary_user == 'true') {
				$scope.checklist.secondary_supervisor = $scope.secondary_supervisor?$scope.secondary_supervisor._id:null;
				$scope.checklist.secondary_supervisor_email = '';
			} else {
				$scope.checklist.secondary_supervisor_email = $scope.secondary_supervisor_email;
			}
			$scope.checklist.tertiary_supervisor = null;
			if ($scope.is_tertiary_user == 'true') {
				$scope.checklist.tertiary_supervisor = $scope.tertiary_supervisor?$scope.tertiary_supervisor._id:null;
				$scope.checklist.tertiary_supervisor_email = '';
			} else {
				$scope.checklist.tertiary_supervisor_email = $scope.tertiary_supervisor_email;
			}
			angular.forEach($scope.reminders, function(reminder) {
				if (!reminder.hasCustomText) {
					if (reminder.beforeAfterOn == "On") {
						reminder.customText = "This inspection is due today. ([Due Date]) Please make sure you plan accordingly.";
					}
					if (reminder.beforeAfterOn == "Before") {
						reminder.customText = "This inspection is due in " + reminder.number + " " + reminder.durationType + " . ([Due Date]) Please make sure you plan accordingly.";
					}
					if (reminder.beforeAfterOn == "After") {
						reminder.customText = "This inspection was due " + reminder.number + " " + reminder.durationType + " ago. ([Due Date])";
					}
				}
			});

			$scope.checklist.reminders = $scope.reminders;
			$scope.saveQuestions();

			if($scope.checklist._id) {
				$scope.checklist.$update(function(){
					$location.path('checklists');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.checklist.$save(function(){
					console.log('saved: ', $scope.checklist);
					$location.path('checklists');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.resetChecklist = function() {
			// console.log($scope.checklist);
			$scope.data.company = $scope.checklist.company;
			$scope.values.checklistText = $scope.checklist.name || '';
			$scope.values.citation = $scope.checklist.citation || '';
			$scope.values.keywords=[];
			if($scope.checklist.keywords) {
				for(var i=0; i < $scope.checklist.keywords.length; i++) {
					$scope.values.keywords.push({text:$scope.checklist.keywords[i]});
				}
			}
			$scope.values.note = $scope.checklist.note || '';
			$scope.site = $scope.checklist.site;
			$scope.frequency = $scope.checklist.frequency;
			$scope.primary_inspector = $scope.checklist.primary_inspector;
			$scope.secondary_inspector = $scope.checklist.secondary_inspector;
			$scope.tertiary_inspector = $scope.checklist.tertiary_inspector;
			$scope.primary_supervisor = $scope.checklist.primary_supervisor;
			$scope.secondary_supervisor = $scope.checklist.secondary_supervisor;
			$scope.tertiary_supervisor = $scope.checklist.tertiary_supervisor;
			$scope.primary_supervisor_email = $scope.checklist.primary_supervisor_email;
			$scope.secondary_supervisor_email = $scope.checklist.secondary_supervisor_email;
			$scope.tertiary_supervisor_email = $scope.checklist.tertiary_supervisor_email;
			if ($scope.primary_supervisor_email && $scope.primary_supervisor_email != "") {
				$scope.is_primary_user = 'false';
			} else {
				$scope.is_primary_user = 'true';
			}
			if ($scope.secondary_supervisor_email && $scope.secondary_supervisor_email != "") {
				$scope.is_secondary_user = 'false';
			} else {
				$scope.is_secondary_user = 'true';
			}
			if ($scope.tertiary_supervisor_email && $scope.tertiary_supervisor_email != "") {
				$scope.is_tertiary_user = 'false';
			} else {
				$scope.is_tertiary_user = 'true';
			}
			if($scope.checklist.editor) {
				$scope.editor = ' by [' + $scope.checklist.editor.username + ']';
			} else {
				$scope.editor = '';
			}
			$scope.updateNotifierList();
			if ($scope.checklist.reminders && $scope.checklist.reminders.length == 3) {
				$scope.reminders = $scope.checklist.reminders;
			}

			// $scope.relatedQuestions = angular.copy($scope.checklist.questions);
			// console.log($scope.checklist);
			$scope.lastUpdated = moment($scope.checklist.updated).tz('America/New_York');

			$scope.resetQuestions();
		};

		$scope.saveQuestions = function() {
			// if($scope.checklist._id) {
				$scope.checklist.questions = [];
				for (var i=0; i<$scope.relatedQuestions.length; i++) {
					var newQuestion = {
						order: $scope.relatedQuestions[i].order,
						mandatory: $scope.relatedQuestions[i].mandatory === 'yes' ? true : false,
						question: $scope.relatedQuestions[i].question._id
					};
					(function(j){
						var q = Questions.get({questionId: $scope.relatedQuestions[j].question._id});
						q.$promise.then(function(fetchedQuery) {
							// console.log('fetched: ', j, q, fetchedQuery);
							if(!fetchedQuery.checklists)
								fetchedQuery.checklists = [];
							q.checklists.push($scope.checklist._id);
							q.$update(function(response) {
								// console.log('update success: ', j, response);
							}, function(errorResponse) {
								console.log('update error: ', j, errorResponse);
							});
						}, function(error) {
							console.log('get error: ', j, error);
						});
					})(i);
					$scope.checklist.questions.push(newQuestion);
				}
				for (i=0; i<$scope.removedQuestions.length; i++) {
					(function(j){
						var q = Questions.get({questionId: $scope.removedQuestions[j].question._id});
						q.$promise.then(function(fetchedQuery) {
							var tmp = q.checklists;
							q.checklists = [];
							_.each(tmp, function(item) {
								if (item._id !== $scope.checklist._id) {
									q.checklists.push(item);
								}
							});
							q.$update(function(response) {
								//console.log('update success: ', j, response);
							}, function(errorResponse) {
								console.log('update error: ', j, errorResponse);
							});
						}, function(error) {
							console.log('get error: ', j, error);
						});
					})(i);
				}
				// $scope.checklist.updated = $scope.lastUpdated = moment();
				// $scope.checklist.$update(function() {
				// 	console.log('saved: ', $scope.checklist);
				// 	$scope.findOne($scope.checklist._id);
				// 	$scope.showSearch = false;
				// 	$scope.filteredQuestions = [];
				// 	$location.path('checklists');
				// }, function(errorResponse) {
				// 	if(errorResponse.data)
				// 		$scope.error = errorResponse.data.message;
				// });
			// } else {
			// 	$scope.error = 'Checklist should be saved first.';
			// }
		};

		$scope.resetQuestions = function() {
			// $scope.findOne($scope.checklist._id);
			$scope.relatedQuestions = [];
			// console.log($scope.checklist.questions);
			if(!$scope.checklist.questions) return;
			for (var i=0; i<$scope.checklist.questions.length; i++) {
				if ($scope.checklist.questions[i].question) {
					$scope.checklist.questions[i].question.regulatory_framework = [].concat($scope.checklist.questions[i].question.regulatory_framework || []);
					var newQuestion = {
						order: $scope.checklist.questions[i].order,
						mandatory: $scope.checklist.questions[i].mandatory ? 'yes' : 'no',
						question: $scope.checklist.questions[i].question
					};
					$scope.relatedQuestions.push(newQuestion);
				}
			}
			// console.log('related: ', $scope.relatedQuestions);
		};

		$scope.getRegulatoryFrameworkString = function(regulatory_framework) {
			var str_list = [];
			for (var i = 0; i < regulatory_framework.length; i++) {
				if (str_list.indexOf(regulatory_framework[i].name) < 0) {
					str_list.push(regulatory_framework[i].name);
				}
			}
			return str_list.join();
		};

		$scope.selectAllQuestions = function(checkAllQuestions) {
			for(var i = 0; i < $scope.filteredQuestions.length; i++) {
				$scope.filteredQuestions[i].isChecked = checkAllQuestions;
			}
		};

		$scope.loadKeywordsTags = function(query) {
			return $scope.returnKeywords.filter(function( obj ) {
				return obj.text.toLowerCase().indexOf(query.toLowerCase()) > -1;
			});
		};

		$scope.cancel = function() {
			$location.path('checklists');
		};
	}
]);
