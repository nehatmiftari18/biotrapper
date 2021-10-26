'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['angular-loading-bar', 'ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'smart-table', 'ngTagsInput', 'toggle-switch', 'angularjs-dropdown-multiselect', 'ngFileUpload', 'bootstrapLightbox', 'flow', 'ngVis'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', 'flowFactoryProvider', 'cfpLoadingBarProvider',
	function($locationProvider, flowFactoryProvider, cfpLoadingBarProvider) {
		$locationProvider.hashPrefix('!');
		flowFactoryProvider.defaults = {
			target: function (FlowFile, FlowChunk, isTest) {
				return 'inspections/savePicture'
			},
			testChunks: false,
			permanentErrors: [404, 500, 501],
			maxChunkRetries: 1,
			chunkRetryInterval: 5000,
			simultaneousUploads: 4,
			chunkSize: 1024 * 1024 * 1024
		};
		cfpLoadingBarProvider.includeSpinner = true;
	}
]).filter('matchInactivateStatus', function() {
	return function( items, inactivateStatus ) {
		var filtered = [];
		if(inactivateStatus) {
			angular.forEach(items, function (item) {
				if (item.status) {
					filtered.push(item);
				}
			});

		} else {
			filtered = items;
		}
		return filtered;
	};
});

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	// Fixing google bug with redirect
	if (window.location.href[window.location.href.length - 1] === '#' &&
			// for just the error url (origin + /#)
			(window.location.href.length - window.location.origin.length) === 2) {
			window.location.href = window.location.origin + '/#!';
	}

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('checklists');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('companies');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('frequencies');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('inspection');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('questions');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('regulatories');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('reports');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('sites');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Questions module
angular.module('checklists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Checklists', 'checklists', 'item', null, null, ['superadmin', 'administrator'], 2);
	}
]);
'use strict';

// Setting up route
angular.module('checklists').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('checklists', {
			url: '/checklists',
			templateUrl: 'modules/checklists/views/checklists.client.view.html'
		}).
		state('checklist_create', {
			url: '/checklists/new',
			templateUrl: 'modules/checklists/views/build-checklist.client.view.html'
		}).
		state('checklist_detail', {
			url: '/checklists/:checklistId/edit',
			templateUrl: 'modules/checklists/views/build-checklist.client.view.html'
		});
	}
]);
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

'use strict';

// Checklists controller
angular.module('checklists').controller('ChecklistsController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Checklists', 'Companies', 'Sites', '$modal', 'ChecklistsByCompany', 'SitesByCompany', 'UserRole',
	function($scope, $rootScope, $stateParams, $location, Authentication, Checklists, Companies, Sites, $modal, ChecklistsByCompany, SitesByCompany, UserRole) {

		$scope.initScope = function() {
			// initialize form
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			$scope.data = {};
			$scope.data.filter_company = $rootScope.checklist_filter_company || '';
			$rootScope.checklist_filter_company = '';

			$scope.typeString = {
				'none': 'none',
				'Yes/No': 'Yes/No toggle',
				'Yes/No/NA': 'Yes/No/NA toggle',
				'Numeric': 'Numerical entry',
				'Single': 'Single select',
				'Date': 'Date picker',
				'Text': 'Text entry'
			};

			$scope.orderReverse = $rootScope.checklist_orderReverse || true;
			$rootScope.checklist_orderReverse = '';
			$scope.orderCriterion = $rootScope.checklist_orderCriterion || 'updated';
			$rootScope.checklist_orderCriterion = '';
			var defaultCompany = 'all';
			if (Authentication.user.role === UserRole.Administrator)
				defaultCompany = Authentication.user.company;
			$scope.selectedCompany = $rootScope.checklist_selectedCompany || defaultCompany;
			$rootScope.checklist_selectedCompany = '';
			$scope.find();
		};

		// Create new Checklist
		$scope.create = function() {
			$location.path('/checklists/new');
		};

		// Find a list of Checklists
		$scope.find = function() {
			$scope.companies = Companies.query();
			if($scope.selectedCompany === 'all') {
				$scope.checklists = Checklists.query();
				$scope.sites = Sites.query();
			} else {
				$scope.checklists = ChecklistsByCompany.query({companyId: $scope.selectedCompany});
				$scope.sites = SitesByCompany.query({companyId: $scope.selectedCompany});
			}
			$scope.checklists.$promise.then(function (result) {
			    $scope.getKeywords();
			    $scope.filterChecklists();
			});
			$scope.sites.$promise.then(function (result) {
				$scope.filter_site = $rootScope.checklist_filter_site || '';
				$rootScope.checklist_filter_site = '';
				$scope.filterChecklists();
			});
		};

		// Find existing Checklists
		$scope.findOne = function() {
			$scope.checklist = Checklists.get({
				checklistId: $stateParams.checklistId
			});
		};

		$scope.getKeywords = function() {
			$scope.keywords = [];
			for ( var i = 0; i < $scope.checklists.length; i++ ) {
				var keywords = $scope.checklists[i].keywords;
				for (var j=0; j<keywords.length; j++) {
					if($scope.keywords.indexOf(keywords[j]) < 0 && keywords[j]) {
						$scope.keywords.push(keywords[j]);
					}
				}
			}
			$scope.filter_keyword = $rootScope.checklist_filter_keyword || '';
			$rootScope.checklist_filter_keyword = '';
		};

		$scope.openChecklist = function(checklist) {
			$rootScope.checklist_filter_company = $scope.data.filter_company;
			$rootScope.checklist_filter_keyword = $scope.filter_keyword;
			$rootScope.checklist_filter_site = $scope.filter_site;
			$rootScope.checklist_orderReverse = $scope.orderReverse;
			$rootScope.checklist_orderCriterion = $scope.orderCriterion;
			$rootScope.checklist_selectedCompany = $scope.selectedCompany;
			$location.path('/checklists/' + checklist._id + '/edit');
		};

		$scope.copyChecklist = function(originalChecklist) {
			var checklist = new Checklists();

			checklist.name = 'Copy of ' + originalChecklist.name;
			checklist.company = originalChecklist.company ? originalChecklist.company._id : null;
			checklist.citation = originalChecklist.citation;
			checklist.site = originalChecklist.site ? originalChecklist.site._id : null;
			checklist.frequency = originalChecklist.frequency ? originalChecklist.frequency._id : null;
			checklist.keywords = angular.copy(originalChecklist.keywords);
			checklist.note = originalChecklist.note;
			checklist.questions = angular.copy(originalChecklist.questions);
			checklist.primary_inspector = originalChecklist.primary_inspector;
			checklist.secondary_inspector = originalChecklist.secondary_inspector;
			checklist.tertiary_inspector = originalChecklist.tertiary_inspector;
			checklist.primary_supervisor = originalChecklist.primary_supervisor;
			checklist.primary_supervisor_email = originalChecklist.primary_supervisor_email;
			checklist.secondary_supervisor = originalChecklist.secondary_supervisor;
			checklist.secondary_supervisor_email = originalChecklist.secondary_supervisor_email;
			checklist.tertiary_supervisor = originalChecklist.tertiary_supervisor;
			checklist.tertiary_supervisor_email = originalChecklist.tertiary_supervisor_email;
			checklist.reminders = originalChecklist.reminders;

			console.log(checklist.questions);
			for(var j=0; j<checklist.questions.length; j++) {
				if(checklist.questions[j].question)
					checklist.questions[j].question = checklist.questions[j].question._id;
			}
			checklist.updated = moment();

			console.log('checklist: ', checklist);
			checklist.$save(function(){
				checklist.company = originalChecklist.company;
				checklist.site = originalChecklist.site;
				checklist.frequency = originalChecklist.frequency;
				checklist.questions = angular.copy(originalChecklist.questions);
				$scope.checklists.push(checklist);
				$scope.filterChecklists();
			}, function(error) {
				console.log(error);
			});
		};

		$scope.picture = {};
		$scope.copyChecklists = function() {
			var selectedCheckLists = [];
			for(var i = 0; i < $scope.checklists.length; i++) {
				if($scope.checklists[i].isChecked)
					selectedCheckLists.push($scope.checklists[i]);
			}
			if(selectedCheckLists.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'CopyChecklistModalController',
			    templateUrl: 'modules/checklists/views/modal.copy.checklist.html',
			    resolve: {
			     	checklists: function () {
			        	return selectedCheckLists;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
		    	for(var i = 0; i < $scope.checklists.length; i++) {
					if($scope.checklists[i].isChecked) {
						$scope.copyChecklist($scope.checklists[i]);
						$scope.checklists[i].isChecked = false;
					}
				}
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		// Delete selected checklists
		$scope.deleteChecklists = function() {
			var selectedCheckLists = [];
			for(var i = 0; i < $scope.checklists.length; i++) {
				if($scope.checklists[i].isChecked) {
					selectedCheckLists.push($scope.checklists[i]);
				}
			}
			if(selectedCheckLists.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'ChecklistDelModalCtrl',
			    templateUrl: 'modules/checklists/views/modal.delete.checklist.html',
			    resolve: {
			     	checklists: function () {
			        	return selectedCheckLists;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
				var i = $scope.checklists.length;
				while (i--) {
					if($scope.checklists[i].isChecked) {
						Checklists.delete({checklistId: $scope.checklists[i]._id});
						$scope.checklists.splice(i, 1);
					}
				}
				$scope.filterChecklists();
				console.log('after deletion: ', $scope.checklists);
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.generateDate = function(dateStr) {
			return moment(dateStr).tz('America/New_York').format('MM/DD/YYYY HH:mm a');
		};

		$scope.filterByCompany = function() {
			if(!$scope.data.filter_company)  {
				$scope.selectedCompany = 'all';
			} else {
				$scope.selectedCompany = $scope.data.filter_company._id;
			}
			$scope.find();
		};

		$scope.filterChecklists = function() {
			$scope.filteredChecklists = [];
			for (var i = 0; i < $scope.checklists.length; i++) {
				if (($scope.filter_keyword === undefined) || 			// filter by keyword
					(!$scope.filter_keyword) ||
					($scope.checklists[i].keywords.indexOf($scope.filter_keyword) >= 0)) {
					if (($scope.filter_site === undefined) || 			// filter by regulation
						(!$scope.filter_site) ||
						($scope.checklists[i].site._id === $scope.filter_site._id)) {
						$scope.filteredChecklists.push($scope.checklists[i]);
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

'use strict';

// Questions controller
angular.module('checklists').controller('ChecklistDelModalCtrl', ['$scope', '$modalInstance', 'checklists', 
	function($scope, $modalInstance, checklists) {
		
		$scope.checklists = checklists;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('CopyChecklistModalController', ['$scope', '$modalInstance', 'checklists', 
	function($scope, $modalInstance, checklists) {
		$scope.checklists = checklists;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);
'use strict';

angular.module('checklists')
	.directive('numbersOnly', function () {
		return {
			require: 'ngModel',
			link: function (scope, element, attr, ngModelCtrl) {
				function fromUser(text) {
					if (text) {
						var transformedInput = text.replace(/[^0-9]/g, '');

						if (transformedInput !== text) {
							ngModelCtrl.$setViewValue(transformedInput);
							ngModelCtrl.$render();
						}
						return transformedInput;
					}
					return undefined;
				}
				ngModelCtrl.$parsers.push(fromUser);
			}
		};
	});

'use strict';

//Checklists service used for communicating with the checklists REST endpoints
angular.module('checklists').factory('Checklists', ['$resource',
	function($resource) {
		return $resource('checklists/:checklistId', {
			checklistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('ChecklistsByCompany', ['$resource',
	function($resource) {
		return $resource('checklists/company/:companyId', {companyId:'@companyId'});
	}
]);
'use strict';

// Setting up route
angular.module('companies').config(['$stateProvider',
	function($stateProvider) {
		// companies state routing
		$stateProvider.
		state('company-list', {
			url: '/companies',
			templateUrl: 'modules/companies/views/company-admin.client.view.html'
		}).
		state('company-create', {
			url: '/companies/new',
			templateUrl: 'modules/companies/views/create-company.client.view.html'
		}).
		state('company-detail', {
			url: '/companies/:companyId/edit',
			templateUrl: 'modules/companies/views/create-company.client.view.html'
		});
	}
]);
'use strict';

// Configuring the Companies module
angular.module('companies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Administration', 'admin', 'dropdown', null, null, ['superadmin', 'administrator'], 4);
		Menus.addSubMenuItem('topbar', 'admin', 'Companies', 'companies', null, true, ['superadmin'], 1);
		// Menus.addSubMenuItem('topbar', 'companies', 'New Company', 'companies/create');
	}
]);

'use strict';

// Company controller
angular.module('companies').controller('CompaniesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, PersistSortService) {

		$scope.userRoles = ['superadmin'];
		$scope.authentication = Authentication;
		$scope.admin = 'Companies';
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('company_sort', $scope.sortColumn);
		};

		$scope.addNew = function() {
			// Create new Company object
			$location.path('companies/new');
		};

		$scope.editCompany = function(company) {
			$location.path('companies/' + company._id + '/edit');
		};

		// Find a list of Companies
		$scope.find = function() {
			if (PersistSortService.get('company_sort')) {
				$scope.sortColumn = PersistSortService.get('company_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$http.get('/companies/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.companies = $scope.safeCompanies = response;
			}).error(function(response) {
				console.log('error: ', response);
			});
			// $scope.companies = Companies.query();
		};

		// Find existing Company
		$scope.findOne = function() {
			$scope.company = Companies.get({
				companyId: $stateParams.companyId
			});
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			} else if($scope.admin === 'Regulatory') {
				$location.path('regulatories');
			} else if($scope.admin === 'Frequencies') {
				$location.path('frequencies');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);

'use strict';

// Companies controller
angular.module('companies').controller('CompanyCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'CompanySrv',
	function($scope, $stateParams, $location, Authentication, Companies, CompanySrv) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}

			if($stateParams.companyId) {
				$scope.findOne($stateParams.companyId);
			} else {
				$scope.breadcrumbLabel = 'New Company';
				$scope.company = new Companies({
					name: '',
					status: true
				});
				$scope.reset();
			}
		};

		// Find existing Company
		$scope.findOne = function(id) {
			$scope.company = Companies.get({
				companyId: id
			});
			$scope.company.$promise.then(function(response){
				$scope.breadcrumbLabel = 'Company Details [' + $scope.company.name + ']';
				$scope.reset();
			});
		};

		// Create new Company
		$scope.save = function() {
			$scope.company.name = $scope.companyName;
			$scope.company.status = $scope.status === 'true' ? true : false;
			$scope.company.updated = $scope.lastUpdated = moment();
			$scope.company.editor = $scope.authentication.user._id;
			if($scope.company._id) {
				$scope.company.$update(function(response) {
					$location.path('companies');
				});
			} else {
				$scope.company.$save(function(response) {
					$location.path('companies');
				});
			}
		};

		$scope.reset = function() {
			$scope.companyName = $scope.company.name;
			$scope.status = $scope.company.status ? 'true' : 'false';
			$scope.lastUpdated = moment($scope.company.updated).tz('America/New_York');
			if($scope.company.editor) {
				// console.log($scope.company.editor);
				$scope.editor = ' by [' + $scope.company.editor.username + ']';
			} else {
				$scope.editor = '';
			}
		};
		
		$scope.cancel = function() {
			$location.path('companies');
		};
	}
]);

'use strict';

//Companies service used for communicating with the companies REST endpoints
angular.module('companies').factory('Companies', ['$resource',
	function($resource) {
		return $resource('companies/:companyId', {
			companyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
//Companies service used for sharing company object throughout the whole module
.service('CompanySrv', function() {
	this.company = {};
});
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
])
.run( function($rootScope, $location, Authentication) {
    $rootScope.$on('$locationChangeStart',
	    function (event, next, current) {
	      	if(!Authentication.user) {
	      		var targetUrl = next.split('/').pop();
	      		// if(targetUrl !== 'signin' && targetUrl !== 'signup' && targetUrl !== 'forgot') {
	      		if (!next.endsWith('signin')) {
	      			if (!next.includes('password/forgot') &&
	      				!next.includes('password/reset')) {
			      		// event.preventDefault();
			      		$location.path('signin');
		      		}
		      	}
	      	}
	 	});
});
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', 'Authentication', '$location', 'UserRole', 
	function($scope, $http, Authentication, $location, UserRole) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.users = [];

		if (!$scope.authentication.user) {
			$location.path('signin');
		} else if (Authentication.user.role === UserRole.Inspector) {
			$location.path('inspection');
		} else if (Authentication.user.role === UserRole.Supervisor) {
			$location.path('reports');
		} else if (Authentication.user.role === UserRole.Administrator) {
			$location.path('users');
		} else if (Authentication.user.role === UserRole.Superadmin) {
			$location.path('users');
		}

		$scope.getUsers = function() {
			if($scope.authentication.user) {
				$http.get('/users/all').success(function(response) {
					// If successful we assign the response to the global user model
					console.log('success: ', response);
					$scope.users = response;
				}).error(function(response) {
					$scope.error = response.message;
					console.log('error: ', response);
				});
			}
		};

		$scope.getUsers();
	}
]);
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

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					// for (var userRoleIndex in user.roles) {
					for (var roleIndex in this.roles) {
						if (this.roles[roleIndex] === user.role/*s[userRoleIndex]*/) {
							return true;
						}
					}
					// }
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
])
.factory('PersistSortService', function() {
	var savedData = {};
	function set(property, data) {
		savedData[property] = data;
	}
	function get(property) {
		return savedData[property];
	}
	function clear(property) {
		savedData[property] = {};
	}
	function clearAll() {
		savedData = {};
	}
	return {
		set: set,
		get: get,
		clear: clear,
		clearAll: clearAll
	}

});

'use strict';

// Configuring the Frequencies module
angular.module('frequencies').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addSubMenuItem('topbar', 'admin', 'Frequencies', 'frequencies', null, true, ['superadmin', 'administrator'], 4);
	}
]);
'use strict';

// Setting up route
angular.module('frequencies').config(['$stateProvider',
	function($stateProvider) {
		// frequencies state routing
		$stateProvider.
		state('frequency_list', {
			url: '/frequencies',
			templateUrl: 'modules/frequency/views/list-frequencies.client.view.html'
		}).
		state('frequency_create', {
			url: '/frequencies/new',
			templateUrl: 'modules/frequency/views/create-frequency.client.view.html'
		}).
		state('frequency_detail', {
			url: '/frequencies/:frequencyId/edit',
			templateUrl: 'modules/frequency/views/create-frequency.client.view.html'
		});
	}
]);
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

'use strict';

// Frequency controller
angular.module('frequencies').controller('FrequenciesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Frequencies', 'FrequencySrv', 'UserRole', 'FrequenciesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Frequencies, FrequencySrv, UserRole, FrequenciesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.admin = 'Frequencies';
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'company': false,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('frequency_sort', $scope.sortColumn);
		};

		// Create new Frequency
		$scope.create = function() {
			// Create new Frequency object
			$location.path('frequencies/new');
		};

		// Find a list of Frequencies
		$scope.find = function() {
			if (PersistSortService.get('frequency_sort')) {
				$scope.sortColumn = PersistSortService.get('frequency_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			if ($scope.isSuperAdmin) {
				$scope.findAll();
			} else {
				$scope.findByCompany();
			}
		};

		$scope.findAll = function() {
			$http.get('/frequencies/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.frequencies = response;
				$scope.safeFrequencies = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.frequencies = $scope.safeFrequencies = FrequenciesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Frequency
		$scope.findOne = function() {
			$scope.frequency = Frequencies.get({
				frequencyId: $stateParams.frequencyId
			});
		};

		$scope.editFrequency = function(frequency) {
			$location.path('frequencies/' + frequency._id + '/edit');
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Companies') {
				$location.path('companies');
			} else if($scope.admin === 'Regulatory') {
				$location.path('regulatories');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);

'use strict';

//Frequencies service used for communicating with the frequencies REST endpoints
angular.module('frequencies').factory('Frequencies', ['$resource',
	function($resource) {
		return $resource('frequencies/:frequencyId', {
			frequencyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('FrequenciesByCompany', ['$resource',
	function($resource) {
		return $resource('frequencies/company/:companyId', {companyId:'@companyId'});
	}
])
.factory('Repeats', ['$resource',
	function($resource) {
		return $resource('repeats');
	}
])
//Frequencies service used for sharing frequency object throughout the whole module
.service('FrequencySrv', function() {
	this.frequency = {};
});

'use strict';

// Configuring the Inspector module
angular.module('inspection').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'My Inspections', 'inspection', 'item', null, null, ['inspector']);
	}
]);

'use strict';

// Setting up route
angular.module('inspection').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('inspectionHome', {
			url: '/inspection',
			templateUrl: 'modules/inspection/views/inspection.client.view.html'
		}).
		state('inspectionQuestions', {
			url: '/inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/inspection.checklist.client.view.html'
		}).
		state('inspectionTimeline', {
			url: '/inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/inspection.checklist.client.view.html'
		}).
		state('inspectionInput', {
			url: '/inspection/checklists/:checklistId/questions/:questionId',
			templateUrl: 'modules/inspection/views/input.client.view.html'
		}).
		state('fullInspection', {
			url: '/full_inspection/checklists/:checklistId',
			templateUrl: 'modules/inspection/views/full_inspection.client.view.html'
		});
	}
]);

'use strict';

// Questions controller
angular.module('inspection').controller('FullInspectionController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'FullInspectionService',
	function($scope, $rootScope, $stateParams, $location, Authentication, FullInspectionService) {
		$scope.userRoles = ['inspector'];
		$scope.authentication = Authentication;
		$scope.initialize = function() {
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}

			$scope.fullInspection = FullInspectionService.get({
				checklistId: $stateParams.checklistId
			});
		};

		$scope.goBack = function() {
			$location.path('inspection');
		};
	}
]);

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

'use strict';

//Inspections service used for communicating with the inspections REST endpoints
angular.module('inspection').factory('Inspections', ['$resource',
	function($resource) {
		return $resource('inspections/:inspectionId', {
			inspectionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('FullInspectionService', ['$resource',
	function($resource) {
		return $resource('full_inspection/:checklistId', {
			checklistId: '@checklistId'
		});
	}
])
.factory('InspectionAnswers', ['$resource',
	function($resource) {
		return $resource('inspections/answer', {

		});
	}
])
.factory('ChecklistsByInspector', ['$resource',
	function($resource) {
		return $resource('checklists/byInspectors/:inspectorId', {
			inspectorId: '@inspectorId'
		});
	}
])
.factory('InspectionDates', ['$resource',
	function($resource) {
		return $resource('inspections/duedates/:checklistId/:isSubmitted', {
			checklistId: '@checklistId',
			isSubmitted: '@isSubmitted'
		}, {
			query: {
				method:'GET',
				isArray:true
			}
		});
	}
])
.factory('PersistService', function() {
	var savedData = {};
	function set(data) {
		savedData = data;
	}
	function get() {
		return savedData;
	}
	function clear() {
		savedData = {};
	}
	return {
		set: set,
		get: get,
		clear: clear
	}

})
.factory('PersistAnswerService', function() {
	var savedData = {};
	function set(id, data) {
		savedData[id] = data;
	}
	function get(id) {
		return savedData[id];
	}
	function getAnsweredQuestions() {
		var questions = [];
		for (var k in savedData) {
			if (savedData[k].data.main_text != "") {
				if (savedData[k].data.main_text == undefined) {
					if (savedData[k].data.main_single != "") {
						if (savedData[k].data.main_single == undefined) {
							if (savedData[k].data.main_date != "") {
								if (savedData[k].data.main_date == undefined) {
									if (savedData[k].data.main_number != "") {
										if (savedData[k].data.main_number == undefined) {

										} else {
											questions.push(k);
										}
									}
								} else {
									questions.push(k);
								}
							}
						} else {
							questions.push(k);
						}
					}
				} else {
					questions.push(k);
				}
			}
			if (typeof savedData[k].data.main_switchStatus == 'string' && savedData[k].data.main_switchStatus != "") {
				if (savedData[k].data.main_single === undefined &&	savedData[k].data.main_text === undefined && savedData[k].data.main_date === undefined &&	savedData[k].data.main_number === undefined) {
					questions.push(k);
				}
			}
		}
		return questions;
	}
	function clear() {
		savedData = {};
	}
	return {
		set: set,
		get: get,
		clear: clear,
		getAnsweredQuestions: getAnsweredQuestions
	}

});

'use strict';

// Configuring the Questions module
angular.module('questions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Questions', 'questions', 'item', null, null, ['superadmin', 'administrator'], 1);
	}
]);
'use strict';

// Setting up route
angular.module('questions').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('adminHome', {
			url: '/questions',
			templateUrl: 'modules/questions/views/bank-questions.client.view.html'
		}).
		state('question_create', {
			url: '/questions/new',
			templateUrl: 'modules/questions/views/build-question.client.view.html'
		}).
		state('question_detail', {
			url: '/questions/:questionId/edit',
			templateUrl: 'modules/questions/views/build-question.client.view.html'
		});
	}
]);
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

'use strict';

// Questions controller
angular.module('questions').controller('ModalController', ['$scope', '$modalInstance',
	function($scope, $modalInstance) {
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('ChecklistAddModalCtrl', ['$scope', '$modalInstance', 'Questions', 'questions', 'Checklists', 'isSuperAdmin', 'selectedCompany', 'SitesByCompany', '$http', '$q', '$filter',
	function($scope, $modalInstance, Questions, questions, Checklists, isSuperAdmin, selectedCompany, SitesByCompany, $http, $q, $filter) {
		$scope.questions = questions;

		$scope.fetchSites = function(question) {
			var deffered = $q.defer();
			SitesByCompany.query({companyId: question.company._id}).$promise.then(function(response) {
				deffered.resolve(response);
			});
			return deffered.promise;
		};

		if(!isSuperAdmin) {
			SitesByCompany.query({companyId: selectedCompany}).$promise.then(function(response) {
				var sites = [];
				for(var i = 0; i < response.length; i++) {
					sites.push({id: response[i]._id});
				}
				$http
					.post('/checklists/bySites', sites)
					.success(function(response) {
						// console.log('checklists by sites: ', response);
						$scope.checklists = response;
					}).error(function(response) {
					console.log('login error: ', response);
					$scope.error = response.message;
				});
			});
		} else {
			var promises = [];
			for(var i=0; i<$scope.questions.length; i++) {
				promises.push($scope.fetchSites($scope.questions[i]));
			}
			$q.all(promises).then(function(res) {
				var sites = [];
				for(var i = 0; i < res.length; i++) {
					if(res[i] && res[i].length > 0) {
						for(var j = 0; j < res[i].length; j++) {
							var found = $filter('filter')(sites, {id: res[i][j]._id}, true);
							if (found.length == 0) {
								sites.push({id: res[i][j]._id});
							}
						}
					}
				}
				$http
					.post('/checklists/bySites', sites)
					.success(function(response) {
						// console.log('checklists by sites: ', response);
						$scope.checklists = response;
					}).error(function(response) {
					console.log('login error: ', response);
					$scope.error = response.message;
				});
			});
			//$scope.checklists = Checklists.query();
		}

		$scope.ok = function () {
			if(!$scope.checklist) {
				$scope.error = 'Please select checklist.';
				return;
			}
			var promises = [];

			for(var i=0; i<$scope.questions.length; i++) {

				var existsChecklists = $scope.questions[i].checklists.filter(function(obj) {
					return obj._id == $scope.checklist._id
				}).length;
				if(existsChecklists == 0) {
					$scope.questions[i].checklists.push($scope.checklist._id);
					$scope.checklist.questions.push({
						mandatory: true,
						order: $scope.checklist.questions.length + 1,
						question: $scope.questions[i]._id
					});
					promises.push($scope.addQuestionChecklist($scope.questions[i]));
				} else {
					var existsQuestion = $scope.checklist.questions.filter(function(obj) {
						return obj.question && obj.question._id == $scope.questions[i]._id
					}).length;
					if(existsQuestion == 0) {
						$scope.checklist.questions.push({
							mandatory: true,
							order: $scope.checklist.questions.length + 1,
							question: $scope.questions[i]._id
						});
					}
				}
			}
			$q.all(promises).then(function(res) {
				$scope.checklist.updated = moment();
				Checklists.update($scope.checklist, function(res) {
					$modalInstance.close('ok');
				});
			});
		};
		$scope.addQuestionChecklist = function(question) {
			var deffered = $q.defer();
			Questions.update(question, function(res) {
				deffered.resolve({success: true});
			});
			return deffered.promise;
		};
		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('CopyModalController', ['$scope', '$modalInstance', 'questions',
	function($scope, $modalInstance, questions) {
		$scope.questions = questions;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
])
.controller('QuestionDelModalCtrl', ['$scope', '$modalInstance', 'questions',
	function($scope, $modalInstance, questions) {
		$scope.questions = questions;
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);

'use strict';

//Questions service used for communicating with the questions REST endpoints
angular.module('questions').factory('Questions', ['$resource',
	function($resource) {
		return $resource('questions/:questionId', {
			questionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('QuestionsByCompany', ['$resource',
	function($resource) {
		return $resource('questions/company/:companyId', {companyId:'@companyId'});
	}
]);

'use strict';

//Questions service used for communicating with the questions REST endpoints
angular.module('questions').service('QuestionType', function() {
	this.getConditions = function(type) {

		if ( type === 'Yes/No' ) {
			return [
				{
					condition: 'yes',
					text: 'Yes',
					inputType: 'none'
				},
				{
					condition: 'no',
					text: 'No',
					inputType: 'none'
				}
			];
		} else if ( type === 'Yes/No/NA' ) {
			return [
				{
					condition: 'yes',
					text: 'Yes',
					inputType: 'none'
				},
				{
					condition: 'no',
					text: 'No',
					inputType: 'none'
				},
				{
					condition: 'na',
					text: 'N/A',
					inputType: 'none'
				}
			];
		} else if ( type === 'Numeric' ) {
			return [
				{
					condition: 'greaterThan',
					text: '>',
					inputType: 'number'
				},
				{
					condition: 'lessThan',
					text: '<',
					inputType: 'number'
				},
				{
					condition: 'equal',
					text: '=',
					inputType: 'number'
				}
			];
		} else if ( type === 'Single' ) {
			return [
				{
					condition: 'equal',
					text: '',
					inputType: 'text'
				},
				{
					condition: 'equal',
					text: '',
					inputType: 'text'
				},
				{
					condition: 'equal',
					text: '',
					inputType: 'text'
				}
			];
		} else if ( type === 'Date' ) {
			return [
				{
					condition: 'greaterThan',
					text: 'After',
					inputType: 'date'
				},
				{
					condition: 'lessThan',
					text: 'Before',
					inputType: 'date'
				},
				{
					condition: 'equal',
					text: 'Equal To',
					inputType: 'date'
				}
			];
		} else if ( type === 'Text' ) {
			return [
				{
					condition: '',
					text: '',
					inputType: 'text'
				}
			];
		} else {
			return [];
		}
	};
});

'use strict';

// Configuring the Sites module
angular.module('regulatories').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addSubMenuItem('topbar', 'admin', 'Regulatory Frameworks', 'regulatories', null, true, ['superadmin', 'administrator'], 3);
	}
]);
'use strict';

// Setting up route
angular.module('regulatories').config(['$stateProvider',
	function($stateProvider) {
		// regulatories state routing
		$stateProvider.
		state('regulatory_list', {
			url: '/regulatories',
			templateUrl: 'modules/regulatory/views/list-regulatories.client.view.html'
		}).
		state('regulatory_create', {
			url: '/regulatories/new',
			templateUrl: 'modules/regulatory/views/create-regulatory.client.view.html'
		}).
		state('regulatory_detail', {
			url: '/regulatories/:regulatoryId/edit',
			templateUrl: 'modules/regulatory/views/create-regulatory.client.view.html'
		});
	}
]);
'use strict';

// Regulatories controller
angular.module('regulatories').controller('RegulatoryCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'Regulatories', 'RegulatorySrv', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Companies, Regulatories, RegulatorySrv, UserRole) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {};
			if($stateParams.regulatoryId) {
				$scope.findOne($stateParams.regulatoryId);
			} else {
				$scope.breadcrumbLabel = 'New Framework';
				$scope.regulatory = new Regulatories({
					name: '',
					status: true
				});
				if(!$scope.isSuperAdmin) {
					$scope.regulatory.company = Authentication.user.company;
				}
				$scope.reset();
			}
			$scope.companies = Companies.query();
		};

		// Find existing Regulatory
		$scope.findOne = function(id) {
			$scope.regulatory = Regulatories.get({
				regulatoryId: id
			});
			$scope.regulatory.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.regulatory.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.regulatory.company = $scope.regulatory.company._id;
				}
				$scope.breadcrumbLabel = 'Regulatory Framework Details [' + $scope.regulatory.name + ']';
				$scope.reset();
			});
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.regulatoryName || !$scope.regulatoryName.length) {
				$scope.error = 'Please fill in regulatory framework.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		// Create new Company
		$scope.save = function() {
			if(!$scope.isFormValid()) return;
			$scope.regulatory.updated = $scope.lastUpdated = moment();
			$scope.regulatory.name = $scope.regulatoryName;
			if ($scope.isSuperAdmin) {
				$scope.regulatory.company = $scope.data.company._id;
			}
			$scope.regulatory.status = $scope.status === 'true' ? true : false;
			$scope.regulatory.editor = $scope.authentication.user._id;
			if($scope.regulatory._id) {
				$scope.regulatory.$update(function(response) {
					$location.path('regulatories');
				});
			} else {
				$scope.regulatory.$save(function(response) {
					$location.path('regulatories');
				});
			}
		};

		$scope.reset = function() {
			$scope.data.company = $scope.regulatory.company;
			$scope.regulatoryName = $scope.regulatory.name;
			$scope.status = $scope.regulatory.status ? 'true' : 'false';
			if($scope.regulatory.editor) {
				$scope.editor = ' by [' + $scope.regulatory.editor.username + ']';
			} else {
				$scope.editor = '';
			}
			$scope.lastUpdated = moment($scope.regulatory.updated).tz('America/New_York');
		};

		$scope.cancel = function() {
			$location.path('regulatories');
		};
	}
]);

'use strict';

// Regulatory controller
angular.module('regulatories').controller('RegulatoriesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Regulatories', 'RegulatorySrv', 'UserRole', 'RegulatoriesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Regulatories, RegulatorySrv, UserRole, RegulatoriesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.admin = 'Regulatory';
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'company': false,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('regulatory_sort', $scope.sortColumn);
		};

		// Create new Regulatory
		$scope.create = function() {
			$location.path('regulatories/new');
		};

		// Find a list of Regulatories
		$scope.find = function() {
			if (PersistSortService.get('regulatory_sort')) {
				$scope.sortColumn = PersistSortService.get('regulatory_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			if ($scope.isSuperAdmin) {
				$scope.findAll();
			} else {
				$scope.findByCompany();
			}
		};

		$scope.findAll = function() {
			$http.get('/regulatories/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.regulatories = $scope.safeRegulatories = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.regulatories = $scope.safeRegulatories = RegulatoriesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Regulatory
		$scope.findOne = function() {
			$scope.regulatory = Regulatories.get({
				regulatoryId: $stateParams.regulatoryId
			});
		};

		$scope.editRegulatory = function(regulatory) {
			RegulatorySrv.regulatory = regulatory;
			$location.path('regulatories/' + regulatory._id + '/edit');
		};

		$scope.adminChanged = function() {
			if($scope.admin === 'Users') {
				$location.path('users');
			} else if($scope.admin === 'Companies') {
				$location.path('companies');
			} else if($scope.admin === 'Sites') {
				$location.path('sites');
			} else if($scope.admin === 'Frequencies') {
				$location.path('frequencies');
			}
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);

'use strict';

//Regulatory service used for communicating with the regulatory REST endpoints
angular.module('regulatories').factory('Regulatories', ['$resource',
	function($resource) {
		return $resource('regulatories/:regulatoryId', {
			regulatoryId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('RegulatoriesByCompany', ['$resource',
	function($resource) {
		return $resource('regulatories/company/:companyId', {companyId:'@companyId'});
	}
])
//Regulatory service used for sharing regulatory object throughout the whole module
.service('RegulatorySrv', function() {
	this.regulatory = {};
});
'use strict';

// Configuring the Inspector module
angular.module('reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'item', null, null, ['superadmin', 'administrator', 'supervisor'], 3);
	}
]);

'use strict';

// Setting up route
angular.module('reports').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('reports', {
			url: '/reports',
			templateUrl: 'modules/reports/views/reports.client.view.html'
		}).
		state('report_create_management', {
			url: '/reports/new_management_inspection',
			templateUrl: 'modules/reports/views/build.management.report.client.view.html'
		}).
		state('report_edit_management', {
			url: '/reports/management_inspection/:reportId/edit',
			templateUrl: 'modules/reports/views/build.management.report.client.view.html'
		}).
		state('report_create_regulatory', {
			url: '/reports/new_regulatory_inspection',
			templateUrl: 'modules/reports/views/build.regulatory.report.client.view.html'
		}).
		state('report_inspection_timeline', {
			url: '/reports/inspection_timeline',
			templateUrl: 'modules/reports/views/build.timeline.report.client.view.html'
		}).
		state('report_edit_regulatory', {
			url: '/reports/regulatory_inspection/:reportId/edit',
			templateUrl: 'modules/reports/views/build.regulatory.report.client.view.html'
		}).
		state('reg_framework_pdf', {
			url: '/reports/reg_framework_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.framework.client.view.html'
		}).
		state('reg_inspector_pdf', {
			url: '/reports/reg_inspector_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.inspector.client.view.html'
		}).
		state('reg_date_pdf', {
			url: '/reports/reg_date_pdf',
			templateUrl: 'modules/reports/views/pdf.report.reg.date.client.view.html'
		}).
		state('mgmt_framework_pdf', {
			url: '/reports/mgmt_framework_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.framework.client.view.html'
		}).
		state('mgmt_inspector_pdf', {
			url: '/reports/mgmt_inspector_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.inspector.client.view.html'
		}).
		state('mgmt_date_pdf', {
			url: '/reports/mgmt_date_pdf',
			templateUrl: 'modules/reports/views/pdf.report.mgmt.date.client.view.html'
		});
	}
]);

'use strict';

// Management Inspection Data Reports controller
angular.module('reports').controller('MgmtReportsBuildController', ['$scope', '$rootScope', '$stateParams', '$modal', '$location', 'Authentication', 'Companies', 'ChecklistsByCompany', 'InspectorsByCompany', 'RegulatoriesByCompany', 'Reports', 'UserRole', 'InspectorsByChecklist', 'ReportData', 'Checklists',
	function($scope, $rootScope, $stateParams, $modal, $location, Authentication, Companies, ChecklistsByCompany, InspectorsByCompany, RegulatoriesByCompany, Reports, UserRole, InspectorsByChecklist, ReportData, Checklists) {

		var i;
		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator', 'supervisor'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {};
			$scope.checklists = [];
			$scope.breadcrumbLabel = $scope.reportName = 'Management Report';

			$scope.find();

			$scope.multiselectSettings1 = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'displayName',
				idProp: '_id',
				smartButtonMaxItems: 3,
			    smartButtonTextConverter: function(itemText, originalItem) {
			        return itemText;
			    }
			};
			$scope.multiselectSettings2 = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'name',
				idProp: '_id',
				smartButtonMaxItems: 3,
			    smartButtonTextConverter: function(itemText, originalItem) {
			        return itemText;
			    }
			};
			$scope.dateInputFormat = 'MM/dd/yyyy';
			$scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			};
			$scope.datePickerOpened = {
				startDate: false,
				endDate: false
			};
			$scope.startDate = moment().subtract(90, 'days').format('MM/DD/YYYY');
			$scope.endDate = moment().format('MM/DD/YYYY');

			$scope.initializeReport();
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.inspectors = [];
			$scope.selInspectors = [];
			$scope.regulatories = [];
			$scope.selRegulatories = [];
			if ($scope.isSuperAdmin) {
				$scope.companies = Companies.query();
			} else {
				$scope.data.company = Authentication.user.company;
			}
		};

		$scope.initializeReport = function() {
			$scope.initializing = true;
			if ($stateParams.reportId) {
				$scope.report = Reports.get({
					reportId: $stateParams.reportId
				});
				$scope.report.$promise.then(function(result) {
					console.log('report: ', result);
					if ($scope.isSuperAdmin) {
						$scope.data.company = result.company;
					} else {
						$scope.data.company = result.company._id;
					}
					if (result.fromDate)
						$scope.startDate = moment(result.fromDate).format('MM/DD/YYYY');
					if (result.toDate)
						$scope.endDate = moment(result.toDate).format('MM/DD/YYYY');
					$scope.groupBy = result.groupBy;
					$scope.reportName = result.name;
					$scope.filterByCompany();
				});
			} else {
				$scope.report = new Reports({});
				$scope.filterByCompany();
			}
		};

		$scope.filterByChecklist = function() {
			if($scope.data.checklist) {
				$scope.inspectors = InspectorsByChecklist.query({checklistId: $scope.data.checklist._id});
				$scope.inspectors.$promise.then(function(result) {
					if ($scope.report._id && $scope.initializing) {
						for (i = 0; i < $scope.report.inspectors.length; i++) {
							$scope.selInspectors.push({id: $scope.report.inspectors[i]._id});
						}
					} else {
						for (i=0; i < $scope.inspectors.length; i++) {
							$scope.selInspectors.push({id: $scope.inspectors[i]._id});
						}
					}
				});
			} else {
				$scope.inspectors = [];
			}
		};

		$scope.filterByCompany = function() {
			$scope.data.checklist = null;
			$scope.site = '';
			$scope.data.checklist = '';
			$scope.checklists = [];
			$scope.inspectors = [];
			$scope.selInspectors = [];
			$scope.regulatories = [];
			$scope.selRegulatories = [];

			if(!$scope.data.company)  {
				$scope.selectedCompany = 'none';
			} else {
				if ($scope.isSuperAdmin) {
					$scope.selectedCompany = $scope.data.company._id;
				} else {
					$scope.selectedCompany = Authentication.user.company;
				}
				$scope.checklists = ChecklistsByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories.$promise.then(function(result) {
					if ($scope.report._id && $scope.initializing) {
						for (i = 0; i < $scope.report.regulatories.length; i++) {
							$scope.selRegulatories.push({id: $scope.report.regulatories[i]._id});
						}
						$scope.data.checklist = Checklists.get({checklistId: $scope.report.checklist._id});
						$scope.data.checklist.$promise.then(function(checklistResult) {
							for (i = 0; i < $scope.checklists.length; i++) {
								if ($scope.checklists[i]._id == $scope.data.checklist._id) {
									$scope.data.checklist = $scope.checklists[i];
								}
							}
							$scope.filterByChecklist();
						});
					} else {
						for (i=0; i < $scope.regulatories.length; i++) {
							$scope.selRegulatories.push({id: $scope.regulatories[i]._id});
						}
					}
				});
			}
		};

		$scope.onInspectorSelected = function() {
			console.log($scope.selInspectors);
		};

		$scope.onRegulatorySelected = function() {

		};

		$scope.openDatePicker = function($event, picker) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    for (var key in $scope.datePickerOpened) {
			  	if ($scope.datePickerOpened.hasOwnProperty(key)) {
			    	$scope.datePickerOpened[key] = false;
			  	}
			}
		    $scope.datePickerOpened[picker] = true;
		};

		$scope.isFormValid = function() {
			if ($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
				return false;
			} else if (!$scope.data.checklist) {
				$scope.error = 'Please select checklist.';
				return false;
			} else if (!$scope.selInspectors) {
				$scope.error = 'Please select at least 1 inspector.';
				return false;
			} else if (!$scope.selRegulatories) {
				$scope.error = 'Please select at least 1 regulatory framework.';
				return false;
			} else if (!$scope.groupBy) {
				$scope.error = 'Please select group option.';
				return false;
			} else if (new Date($scope.startDate) > new Date($scope.endDate)) {
				$scope.error = 'Please select appropriate date range.';
				return false;
			}
			$scope.error = null;
			return true;
		};

		$scope.generateReport = function() {
			if (!$scope.isFormValid()) return;
			if ($scope.isSuperAdmin)
				ReportData.company = $scope.data.company._id;
			else
				ReportData.company = $scope.data.company;
	        ReportData.checklist = $scope.data.checklist._id;
	        var selectedInspectors = [],
	        	selectedRegulatories = [],
	        	i, j;
	        for (i = 0; i < $scope.inspectors.length; i++) {
	        	for (j = 0; j < $scope.selInspectors.length; j++) {
	        		if ($scope.inspectors[i]._id === $scope.selInspectors[j].id) {
	        			selectedInspectors.push($scope.inspectors[i]);
	        		}
	        	}
	        }
	        for (i = 0; i < $scope.regulatories.length; i++) {
	        	for (j = 0; j < $scope.selRegulatories.length; j++) {
	        		if ($scope.regulatories[i]._id === $scope.selRegulatories[j].id) {
	        			selectedRegulatories.push($scope.regulatories[i]);
	        		}
	        	}
	        }
	        ReportData.inspectors = selectedInspectors;
	        ReportData.frameworks = selectedRegulatories;
	        ReportData.fromDate = moment($scope.startDate);
	        ReportData.toDate = moment($scope.endDate);
	        ReportData.groupBy = $scope.groupBy;

	        if ($scope.groupBy === 'date') {
	        	$location.path('reports/mgmt_date_pdf');
	        } else if ($scope.groupBy === 'inspector') {
	        	$location.path('reports/mgmt_inspector_pdf');
	        } else if ($scope.groupBy === 'regulatory') {
	        	$location.path('reports/mgmt_framework_pdf');
	        }
		};

		$scope.saveAs = function() {
			if(!$scope.isFormValid()) return;
			var modalInstance = $modal.open({
			    controller: 'SaveMgmtModalController',
			    templateUrl: 'modules/reports/views/modal.save.report.html',
			    resolve: {}
			});
			modalInstance.result.then(function (modalResult) {
				$scope.report.name = modalResult.name;
				$scope.report.description = modalResult.description;
				// console.log('result: ', modalResult);
				$scope.saveReport();
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.saveReport = function() {
			if ($scope.isSuperAdmin)
				$scope.report.company = $scope.data.company._id;
			else
				$scope.report.company = $scope.data.company;
			$scope.report.checklist = $scope.data.checklist._id;
			$scope.report.inspectors = [];
			if($scope.selInspectors) {
				for(i = 0; i < $scope.selInspectors.length; i++) {
					$scope.report.inspectors.push($scope.selInspectors[i].id);
				}
			}
			$scope.report.regulatories = [];
			if($scope.selRegulatories) {
				for(var j = 0; j < $scope.selRegulatories.length; j++) {
					$scope.report.regulatories.push($scope.selRegulatories[j].id);
				}
			}
			$scope.report.fromDate = $scope.startDate;
			$scope.report.toDate = $scope.endDate;
			$scope.report.groupBy = $scope.groupBy;
			$scope.report.type = 'management';					// management report
			$scope.report.updated = $scope.lastUpdated = moment();
			$scope.report.editor = $scope.authentication.user._id;
			console.log('saving: ', $scope.report);
			if($scope.report._id) {
				$scope.report.$update(function(){
					console.log('saved: ', $scope.report);
					$rootScope.activeReportTab = 'saved';
					$location.path('reports');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.report.$save(function(){
					console.log('saved: ', $scope.report);
					$rootScope.activeReportTab = 'saved';
					$location.path('reports');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.cancel = function() {
			$location.path('reports');
		};
	}
]);

'use strict';

// Regulatory Inspection Data Reports controller
angular.module('reports').controller('RegReportsBuildController', ['$scope', '$rootScope', '$stateParams', '$modal', '$location', 'Authentication', 'Companies', 'ChecklistsByCompany', 'InspectorsByCompany', 'RegulatoriesByCompany', 'Reports', 'UserRole', 'InspectorsByChecklist', 'ReportData', 'Checklists',
	function($scope, $rootScope, $stateParams, $modal, $location, Authentication, Companies, ChecklistsByCompany, InspectorsByCompany, RegulatoriesByCompany, Reports, UserRole, InspectorsByChecklist, ReportData, Checklists) {

		var i;
		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator', 'supervisor'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {};
			$scope.breadcrumbLabel = $scope.reportName = 'Regulatory Report';

			$scope.find();

			$scope.multiselectSettings1 = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'displayName',
				idProp: '_id',
				smartButtonMaxItems: 3,
			    smartButtonTextConverter: function(itemText, originalItem) {
			        return itemText;
			    }
			};
			$scope.multiselectSettings2 = {
				showCheckAll: false,
				showUncheckAll: false,
				displayProp: 'name',
				idProp: '_id',
				smartButtonMaxItems: 3,
			    smartButtonTextConverter: function(itemText, originalItem) {
			        return itemText;
			    }
			};
			$scope.dateInputFormat = 'MM/dd/yyyy';
			$scope.dateOptions = {
			    formatYear: 'yy',
			    startingDay: 1
			};
			$scope.datePickerOpened = {
				startDate: false,
				endDate: false
			};
			$scope.startDate = moment().subtract(90, 'days').format('MM/DD/YYYY');
			$scope.endDate = moment().format('MM/DD/YYYY');

			$scope.initializeReport();
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.inspectors = [];
			$scope.selInspectors = [];
			$scope.regulatories = [];
			$scope.selRegulatories = [];
			if ($scope.isSuperAdmin) {
				$scope.companies = Companies.query();
			} else {
				$scope.data.company = Authentication.user.company;
			}
		};

		$scope.initializeReport = function() {
			$scope.initializing = true;
			if ($stateParams.reportId) {
				$scope.report = Reports.get({
					reportId: $stateParams.reportId
				});
				$scope.report.$promise.then(function(result) {
					console.log('report: ', result);
					if ($scope.isSuperAdmin) {
						$scope.data.company = result.company;
					} else {
						$scope.data.company = result.company._id;
					}
					if (result.fromDate)
						$scope.startDate = moment(result.fromDate).format('MM/DD/YYYY');
					if (result.toDate)
						$scope.endDate = moment(result.toDate).format('MM/DD/YYYY');
					$scope.groupBy = result.groupBy;
					$scope.reportName = result.name;
					$scope.filterByCompany();
				});
			} else {
				$scope.report = new Reports({});
				$scope.filterByCompany();
			}
		};

		$scope.filterByChecklist = function() {
			if($scope.data.checklist) {
				$scope.inspectors = InspectorsByChecklist.query({checklistId: $scope.data.checklist._id});
				$scope.inspectors.$promise.then(function(result) {
					if ($scope.report._id && $scope.initializing) {
						for (i = 0; i < $scope.report.inspectors.length; i++) {
							$scope.selInspectors.push({id: $scope.report.inspectors[i]._id});
						}
						$scope.initializing = false;
					} else {
						for (i=0; i < $scope.inspectors.length; i++) {
							$scope.selInspectors.push({id: $scope.inspectors[i]._id});
						}
					}
				});
			} else {
				$scope.inspectors = [];
			}
		};

		$scope.filterByCompany = function() {
			$scope.data.checklist = null;
			$scope.site = '';
			$scope.data.checklist = '';
			$scope.checklists = [];
			$scope.inspectors = [];
			$scope.selInspectors = [];
			$scope.regulatories = [];
			$scope.selRegulatories = [];
			if(!$scope.data.company)  {
				$scope.selectedCompany = 'none';
			} else {
				if ($scope.isSuperAdmin) {
					$scope.selectedCompany = $scope.data.company._id;
				} else {
					$scope.selectedCompany = Authentication.user.company;
				}
				$scope.checklists = ChecklistsByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories = RegulatoriesByCompany.query({companyId: $scope.selectedCompany});
				$scope.regulatories.$promise.then(function(result) {
					if ($scope.report._id && $scope.initializing) {
						for (i = 0; i < $scope.report.regulatories.length; i++) {
							$scope.selRegulatories.push({id: $scope.report.regulatories[i]._id});
						}
						$scope.data.checklist = Checklists.get({checklistId: $scope.report.checklist._id});
						$scope.data.checklist.$promise.then(function(checklistResult) {
							$scope.filterByChecklist();
							for (i = 0; i < $scope.checklists.length; i++) {
								if ($scope.checklists[i]._id == $scope.data.checklist._id) {
									$scope.data.checklist = $scope.checklists[i];
								}
							}
						});
					} else {
						for (i=0; i < $scope.regulatories.length; i++) {
							$scope.selRegulatories.push({id: $scope.regulatories[i]._id});
						}
					}
				});
			}
		};

		$scope.onInspectorSelected = function() {
			console.log($scope.selInspectors);
		};

		$scope.onRegulatorySelected = function() {

		};

		$scope.openDatePicker = function($event, picker) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    for (var key in $scope.datePickerOpened) {
			  	if ($scope.datePickerOpened.hasOwnProperty(key)) {
			    	$scope.datePickerOpened[key] = false;
			  	}
			}
		    $scope.datePickerOpened[picker] = true;
		};

		$scope.isFormValid = function() {
			if ($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
				return false;
			} else if (!$scope.data.checklist) {
				$scope.error = 'Please select checklist.';
				return false;
			} else if (!$scope.selInspectors) {
				$scope.error = 'Please select at least 1 inspector.';
				return false;
			} else if (!$scope.selRegulatories) {
				$scope.error = 'Please select at least 1 regulatory framework.';
				return false;
			} else if (!$scope.groupBy) {
				$scope.error = 'Please select group option.';
				return false;
			} else if (new Date($scope.startDate) > new Date($scope.endDate)) {
				$scope.error = 'Please select appropriate date range.';
				return false;
			}
			$scope.error = null;
			return true;
		};

		$scope.generateReport = function() {
			if (!$scope.isFormValid()) return;
			if ($scope.isSuperAdmin)
				ReportData.company = $scope.data.company._id;
			else
				ReportData.company = $scope.data.company;
	        ReportData.checklist = $scope.data.checklist._id;
	        var selectedInspectors = [],
	        	selectedRegulatories = [],
	        	i, j;
	        for (i = 0; i < $scope.inspectors.length; i++) {
	        	for (j = 0; j < $scope.selInspectors.length; j++) {
	        		if ($scope.inspectors[i]._id === $scope.selInspectors[j].id) {
	        			selectedInspectors.push($scope.inspectors[i]);
	        		}
	        	}
	        }
	        for (i = 0; i < $scope.regulatories.length; i++) {
	        	for (j = 0; j < $scope.selRegulatories.length; j++) {
	        		if ($scope.regulatories[i]._id === $scope.selRegulatories[j].id) {
	        			selectedRegulatories.push($scope.regulatories[i]);
	        		}
	        	}
	        }
	        ReportData.inspectors = selectedInspectors;
	        ReportData.frameworks = selectedRegulatories;
	        ReportData.fromDate = moment($scope.startDate);
	        ReportData.toDate = moment($scope.endDate);
	        ReportData.groupBy = $scope.groupBy;

	        if ($scope.groupBy === 'date') {
	        	$location.path('reports/reg_date_pdf');
	        } else if ($scope.groupBy === 'inspector') {
	        	$location.path('reports/reg_inspector_pdf');
	        } else if ($scope.groupBy === 'regulatory') {
	        	$location.path('reports/reg_framework_pdf');
	        }
		};

		$scope.saveAs = function() {
			if(!$scope.isFormValid()) return;
			var modalInstance = $modal.open({
			    controller: 'SaveMgmtModalController',
			    templateUrl: 'modules/reports/views/modal.save.report.html',
			    resolve: {}
			});
			modalInstance.result.then(function (modalResult) {
				$scope.report.name = modalResult.name;
				$scope.report.description = modalResult.description;
				// console.log('result: ', modalResult);
				$scope.saveReport();
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.saveReport = function() {
			if ($scope.isSuperAdmin)
				$scope.report.company = $scope.data.company._id;
			else
				$scope.report.company = $scope.data.company;
			$scope.report.checklist = $scope.data.checklist._id;
			$scope.report.inspectors = [];
			if($scope.selInspectors) {
				for(i = 0; i < $scope.selInspectors.length; i++) {
					$scope.report.inspectors.push($scope.selInspectors[i].id);
				}
			}
			$scope.report.regulatories = [];
			if($scope.selRegulatories) {
				for(var j = 0; j < $scope.selRegulatories.length; j++) {
					$scope.report.regulatories.push($scope.selRegulatories[j].id);
				}
			}
			$scope.report.fromDate = $scope.startDate;
			$scope.report.toDate = $scope.endDate;
			$scope.report.groupBy = $scope.groupBy;
			$scope.report.type = 'regulatory';					// regulatory report
			$scope.report.updated = $scope.lastUpdated = moment();
			$scope.report.editor = $scope.authentication.user._id;
			console.log('saving: ', $scope.report);
			if($scope.report._id) {
				$scope.report.$update(function(){
					console.log('saved: ', $scope.report);
					$rootScope.activeReportTab = 'saved';
					$location.path('reports');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.report.$save(function(){
					console.log('saved: ', $scope.report);
					$rootScope.activeReportTab = 'saved';
					$location.path('reports');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.cancel = function() {
			$location.path('reports');
		};
	}
]);

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
'use strict';

// Management Inspection Data Reports controller
 angular.module('reports').controller('DatePdfController', ['$scope', '$timeout', '$location', '$anchorScroll', 'ReportData', 'Authentication', 'InspectionReports', 'Checklists',
	function($scope, $timeout, $location, $anchorScroll, ReportData, Authentication, InspectionReports, Checklists) {

		$scope.isArray = angular.isArray;

		$scope.initialize = function() {
			$scope.moment = moment;
			var i;
			$scope.inspectors = [];
			$scope.frameworks = [];
			console.log(ReportData.inspectors);
			for (i in ReportData.inspectors) {
				$scope.inspectors.push(ReportData.inspectors[i]._id);
			}
			for (i in ReportData.frameworks) {
				$scope.frameworks.push(ReportData.frameworks[i]._id);
			}
			var params = {
				company: ReportData.company,
				checklist: ReportData.checklist,
	        	inspectors: $scope.inspectors,
	        	frameworks: $scope.frameworks,
		        fromDate: moment(ReportData.fromDate).format('MM/DD/YYYY'),
		        toDate: moment(ReportData.toDate).format('MM/DD/YYYY'),
		        sortBy: 'date'
			};
			$scope.checklist = Checklists.get({checklistId: ReportData.checklist});
			$scope.inspections = InspectionReports.query(params);
			$scope.inspections.$promise.then(function(response) {
				console.log('inspections: ', response);
				$scope.inspectors = ReportData.inspectors;
				$scope.frameworks = ReportData.frameworks;
				$scope.fetchPictures();
			});
			var nowDate = moment().tz('America/New_York');
			$scope.currentDate = nowDate.format('MM/DD/YYYY HH:mm z');
			$scope.fromDate = moment(ReportData.fromDate).format('MM/DD/YYYY');
			$scope.toDate = moment(ReportData.toDate).format('MM/DD/YYYY');
		};

		$scope.fetchPictures = function() {
			$scope.pictures = [];
			for (var i = 0; i < $scope.inspections.length; i++) {
				var inspection = $scope.inspections[i];
				for (var j = 0; j < inspection.answers.length; j++) {
					var answer = inspection.answers[j];
					if (answer.data) {
						if(answer.data.data.pictureURL) {
							var pictures = [].concat(answer.data.data.pictureURL);
							angular.forEach(pictures, function(picture, index) {
								$scope.pictures.push({
									inspection: i,
									answer: j,
									pictureIndex: index,
									url: picture
								});
							});
						}
					}
				}
			}
		};

		$scope.isString = function(obj) {
			return typeof obj === 'string';
		};

		$scope.gotoPicture = function(inspectionIndex, answerIndex, picIndex) {
			$location.hash('picture_' + inspectionIndex + '_' + answerIndex + '_' + picIndex);
			$anchorScroll();
		};

		$scope.generateLocationString = function(location) {
			if (location) {
				return JSON.stringify(location);
			} else {
				return "";
			}

		};

		$scope.getRegulatoryFrameworkString = function(regulatory_framework) {
			var str_list = [];
			if (regulatory_framework) {
				for (var i = 0; i < regulatory_framework.length; i++) {
					if (str_list.indexOf(regulatory_framework[i].name) < 0) {
						str_list.push(regulatory_framework[i].name);
					}
				}
			}

			if (str_list.length > 0) {
				var str = "(" + str_list.join() + ")";
				return str;
			} else {
				return "(Non-regulatory)";
			}

		};

		$scope.getFileName = function(path) {
			var nameIndex = path.lastIndexOf('.');
			var filename = (nameIndex < 0) ? '' : path.substr(nameIndex);
			return filename;
		};
	}
]);

'use strict';

// Management Inspection Data Reports controller
angular.module('reports').controller('FrameworkPdfController', ['$scope', '$timeout', '$location', '$anchorScroll', 'ReportData', 'Authentication', 'InspectionReports', 'Checklists',
	function($scope, $timeout, $location, $anchorScroll, ReportData, Authentication, InspectionReports, Checklists) {

		$scope.initialize = function() {
			$scope.moment = moment;
			var i;
			$scope.inspectors = [];
			$scope.frameworks = [];
			console.log(ReportData.inspectors);
			for (i in ReportData.inspectors) {
				$scope.inspectors.push(ReportData.inspectors[i]._id);
			}
			for (i in ReportData.frameworks) {
				$scope.frameworks.push(ReportData.frameworks[i]._id);
			}
			var params = {
				company: ReportData.company,
				checklist: ReportData.checklist,
	        	inspectors: $scope.inspectors,
	        	frameworks: $scope.frameworks,
		        fromDate: moment(ReportData.fromDate).format('MM/DD/YYYY'),
		        toDate: moment(ReportData.toDate).format('MM/DD/YYYY'),
		        sortBy: 'framework'
			};
			$scope.checklist = Checklists.get({checklistId: ReportData.checklist});
			$scope.checklist.$promise.then(function(response) {
				console.log('checklist: ', $scope.checklist);
				// group questions by framework
				var currentFramework = '';
				$scope.questionGroups = {
					none: []
				};
				for (i = 0; i < $scope.checklist.questions.length; i++) {
					if ($scope.checklist.questions[i].question.regulatory) {
						$scope.checklist.questions[i].question.regulatory_framework = [].concat($scope.checklist.questions[i].question.regulatory_framework || []);
						angular.forEach($scope.checklist.questions[i].question.regulatory_framework, function(framework) {
							currentFramework = framework._id;
							if ($scope.questionGroups[currentFramework]) {
								$scope.questionGroups[currentFramework].push($scope.checklist.questions[i]);
							} else {
								$scope.questionGroups[currentFramework] = [$scope.checklist.questions[i]];
							}
						});
					} else {
						$scope.questionGroups.none.push($scope.checklist.questions[i]);
					}
				}
				if ($scope.questionGroups.none.length === 0) {
					delete $scope.questionGroups.none;
				}


				$scope.inspections = InspectionReports.query(params);
				$scope.inspections.$promise.then(function(response) {
					console.log('inspections: ', response);
					$scope.fetchPictures();
					for (i = 0; i < $scope.inspections.length; i++) {

						// re-order answers to match with the questions in checklist
						$scope.inspections[i].orderedAnswers = [];
						for (var j = 0; j < $scope.checklist.questions.length; j++) {
							for (var k = 0; k < $scope.inspections[i].answers.length; k++) {
								if ($scope.checklist.questions[j].question._id === $scope.inspections[i].answers[k].question._id) {
									$scope.inspections[i].orderedAnswers.push($scope.inspections[i].answers[k]);
								}
							}
						}
					}

					$scope.inspectors = ReportData.inspectors;
					$scope.frameworks = ReportData.frameworks;
					$timeout(function() {

					});
				});
			});

			var nowDate = moment().tz('America/New_York');
			$scope.currentDate = nowDate.format('MM/DD/YYYY HH:mm z');
			$scope.fromDate = moment(ReportData.fromDate).format('MM/DD/YYYY');
			$scope.toDate = moment(ReportData.toDate).format('MM/DD/YYYY');
		};

		$scope.fetchPictures = function() {
			$scope.pictures = [];
			for (var i = 0; i < $scope.inspections.length; i++) {
				var inspection = $scope.inspections[i];
				for (var j = 0; j < inspection.answers.length; j++) {
					var answer = inspection.answers[j];
					if (answer.data) {
						if(answer.data.data.pictureURL) {
							var pictures = [].concat(answer.data.data.pictureURL);
							angular.forEach(pictures, function(picture, index) {
								$scope.pictures.push({
									inspection: i,
									answer: j,
									pictureIndex: index,
									url: picture
								});
							});
						}
					}
				}
			}
		};

		$scope.isString = function(obj) {
			return typeof obj === 'string';
		};

		$scope.gotoPicture = function(inspectionIndex, answerIndex, picIndex) {
			$location.hash('picture_' + inspectionIndex + '_' + answerIndex + '_' + picIndex);
			$anchorScroll();
		};

		$scope.generateLocationString = function(location) {
			return JSON.stringify(location);
		};

		$scope.getRegulatoryFrameworkString = function(regulatory_framework) {
			var str_list = [];
			if (regulatory_framework) {
				for (var i = 0; i < regulatory_framework.length; i++) {
					if (str_list.indexOf(regulatory_framework[i].name) < 0) {
						str_list.push(regulatory_framework[i].name);
					}
				}
			}

			if (str_list.length > 0) {
				var str = "(" + str_list.join() + ")";
				return str;
			} else {
				return "";
			}
		};

		$scope.getFileName = function(path) {
			var nameIndex = path.lastIndexOf('.');
			var filename = (nameIndex < 0) ? '' : path.substr(nameIndex);
			return filename;
		};

	}
]);

'use strict';

// Management Inspection Data Reports controller
angular.module('reports').controller('InspectorPdfController', ['$scope', '$timeout', '$location', '$anchorScroll', 'ReportData', 'Authentication', 'InspectionReports', 'Checklists',
	function($scope, $timeout, $location, $anchorScroll, ReportData, Authentication, InspectionReports, Checklists) {

		$scope.isArray = angular.isArray;

		$scope.initialize = function() {
			$scope.moment = moment;
			var i;
			$scope.inspectors = [];
			$scope.frameworks = [];
			console.log(ReportData.inspectors);
			for (i in ReportData.inspectors) {
				$scope.inspectors.push(ReportData.inspectors[i]._id);
			}
			for (i in ReportData.frameworks) {
				$scope.frameworks.push(ReportData.frameworks[i]._id);
			}
			var params = {
				company: ReportData.company,
				checklist: ReportData.checklist,
	        	inspectors: $scope.inspectors,
	        	frameworks: $scope.frameworks,
		        fromDate: moment(ReportData.fromDate).format('MM/DD/YYYY'),
		        toDate: moment(ReportData.toDate).format('MM/DD/YYYY'),
		        sortBy: 'editor'
			};

			$scope.checklist = Checklists.get({checklistId: ReportData.checklist});
			$scope.checklist.$promise.then(function(response) {
				console.log('checklist: ', $scope.checklist);
			});

			$scope.inspections = InspectionReports.query(params);
			$scope.inspections.$promise.then(function(response) {
				console.log('inspections: ', response);

				$scope.inspectionGroups = {};
				var currentUser = null;
				for (i = 0; i < $scope.inspections.length; i++) {
					if (currentUser === $scope.inspections[i].editor._id) {
						$scope.inspectionGroups[currentUser].push($scope.inspections[i]);
					} else {
						currentUser = $scope.inspections[i].editor._id;
						$scope.inspectionGroups[currentUser] = [$scope.inspections[i]];
					}
				}
				var arr = [];
				angular.forEach($scope.inspectionGroups, function(value, key){
					arr.push(value);
				});
				$scope.inspectionGroups = arr;
				$scope.fetchPictures();
				$scope.inspectors = ReportData.inspectors;
				$scope.frameworks = ReportData.frameworks;
				$timeout(function() {

				});
			});

			var nowDate = moment().tz('America/New_York');
			$scope.currentDate = nowDate.format('MM/DD/YYYY HH:mm z');
			$scope.fromDate = moment(ReportData.fromDate).format('MM/DD/YYYY');
			$scope.toDate = moment(ReportData.toDate).format('MM/DD/YYYY');
		};

		$scope.fetchPictures = function() {
			$scope.pictures = [];
			for (var k = 0; k < $scope.inspectionGroups.length; k++) {
				var inspections = $scope.inspectionGroups[k];
				for (var i = 0; i < inspections.length; i++) {
					var inspection = inspections[i];
					for (var j = 0; j < inspection.answers.length; j++) {
						var answer = inspection.answers[j];
						if (answer.data) {
							if (answer.data.data.pictureURL) {
								var pictures = [].concat(answer.data.data.pictureURL);
								angular.forEach(pictures, function (picture, index) {
									$scope.pictures.push({
										inspectionGroup: k,
										inspection: i,
										answer: j,
										pictureIndex: index,
										url: picture
									});
								});
							}
						}
					}
				}
			}
		};

		$scope.isString = function(obj) {
			return typeof obj === 'string';
		};

		$scope.gotoPicture = function(inspectGroupIdx, inspectionIndex, answerIndex, picIndex) {
			$location.hash('picture_' + inspectGroupIdx + '_' + inspectionIndex + '_' + answerIndex + '_' + picIndex);
			$anchorScroll();
		};

		$scope.generateLocationString = function(location) {
			return JSON.stringify(location);
		};

		$scope.getRegulatoryFrameworkString = function(regulatory_framework) {
			var str_list = [];
			if (regulatory_framework) {
				for (var i = 0; i < regulatory_framework.length; i++) {
					if (str_list.indexOf(regulatory_framework[i].name) < 0) {
						str_list.push(regulatory_framework[i].name);
					}
				}
			}

			if (str_list.length > 0) {
				var str = "(" + str_list.join() + ")";
				return str;
			} else {
				return "(Non-regulatory)";
			}
		};

		$scope.getFileName = function(path) {
			var nameIndex = path.lastIndexOf('.');
			var filename = (nameIndex < 0) ? '' : path.substr(nameIndex);
			return filename;
		};
	}
]);

'use strict';

// Reports controller
 angular.module('reports').controller('ReportsController', ['$scope', '$rootScope', '$location', '$modal', 'Authentication', 'Companies', 'Reports', 'ReportsByCompany', 'Checklists', 'ChecklistsByCompany', 'UserRole', 'CompaniesForReports', 'ChecklistsForReports', 'SitesByCompany', 'VisDataSet', '$http', 'InspectionDates', 'FrequenciesByCompany', '$q', '$filter',
	function($scope, $rootScope, $location, $modal, Authentication, Companies, Reports, ReportsByCompany, Checklists, ChecklistsByCompany, UserRole, CompaniesForReports, ChecklistsForReports, SitesByCompany, VisDataSet, $http, InspectionDates, FrequenciesByCompany, $q, $filter) {
		$scope.initialize = function() {
			// initialize form
			$scope.userRoles = ['superadmin', 'administrator', 'supervisor'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}

			$scope.multiselectSettings = {
				showCheckAll: true,
				showUncheckAll: true,
				displayProp: 'name',
				idProp: '_id',
				smartButtonMaxItems: 3,
				smartButtonTextConverter: function(itemText, originalItem) {
					return itemText;
				}
			};
			$scope.textSettings = {
				checkAll: "Select All",
				uncheckAll: "Deselect All"
			};
			$scope.activeTab = $rootScope.activeReportTab || 'basic';
			$rootScope.activeReportTab = '';
			$scope.filters = {
				company: $rootScope.report_filter_company || ''
			};
			$scope.timelineFilters = {
				company: '',
				site: '',
				frequencies: []
			}
			$rootScope.report_filter_company = '';

			$scope.orderCriterion = $rootScope.report_orderCriterion || 'updated';
			$rootScope.report_orderCriterion = '';
			if($rootScope.report_orderReverse === false) {
				$scope.orderReverse = false;
			}
			else {
				$scope.orderReverse = true;
			}
			$rootScope.report_orderReverse = '';

			// $scope.companies = Companies.query();
			if ($scope.isSuperAdmin) {
				$scope.companies = CompaniesForReports.query();
				$scope.companies.$promise.then(function(response) {

				});
			}

			var defaultCompany = 'all';
			if (Authentication.user.role === UserRole.Administrator)
				defaultCompany = Authentication.user.company;
			$scope.selectedCompany = $rootScope.report_selectedCompany || defaultCompany;
			$scope.selectedCompanyForTimeline = $scope.selectedCompany;
			$scope.sites = [];
			if($scope.selectedCompanyForTimeline != 'all') {
				$scope.sites = SitesByCompany.query({companyId: $scope.selectedCompanyForTimeline});
			}
			$rootScope.report_selectedCompany = '';

			$scope.find();
		};

		// Find a list of Reports
		$scope.find = function() {
			if($scope.selectedCompany === 'all') {
				$scope.reports = Reports.query();
				$scope.checklists = ChecklistsForReports.query({companyId: 'all'});
			} else {
				$scope.reports = ReportsByCompany.query({companyId: $scope.selectedCompany});
				$scope.checklists = ChecklistsForReports.query({companyId: $scope.selectedCompany});
			}
			$scope.reports.$promise.then(function (result) {
			    $scope.filterReports();
			});
			$scope.checklists.$promise.then(function (result) {
				$scope.filters.checklist = $rootScope.report_filter_checklist || '';
				$rootScope.report_filter_checklist = '';
			    $scope.filterReports();
			});
		};

		// Find existing Reports
		$scope.findOne = function(id) {
			$scope.report = Reports.get({
				reportId: id
			});
		};

		$scope.openReport = function(report) {
			$rootScope.report_filter_company = $scope.filters.company;
			$rootScope.report_filter_checklist = $scope.filters.checklist;
			$rootScope.report_orderReverse = $scope.orderReverse;
			$rootScope.report_orderCriterion = $scope.orderCriterion;
			$rootScope.report_selectedCompany = $scope.selectedCompany;
			if (report.type === 'management') {
				$location.path('/reports/management_inspection/' + report._id + '/edit');
			} else {
				$location.path('/reports/regulatory_inspection/' + report._id + '/edit');
			}
		};

		$scope.copyReport = function(originalReport) {
			var report = new Reports({});
			report.name = 'Copy of ' + originalReport.name;
			report.company = originalReport.company._id;
			report.checklist = originalReport.checklist._id;
			report.inspectors = [];
			if(originalReport.inspectors) {
				for(var i = 0; i < originalReport.inspectors.length; i++) {
					report.inspectors.push(originalReport.inspectors[i]._id);
				}
			}
			report.regulatories = [];
			if($scope.selRegulatories) {
				for(var j = 0; j < originalReport.regulatories.length; j++) {
					report.regulatories.push(originalReport.regulatories[j]._id);
				}
			}
			report.fromDate = originalReport.fromDate;
			report.toDate = originalReport.toDate;
			report.groupBy = originalReport.groupBy;
			report.type = originalReport.type;
			report.description = originalReport.description;
			report.editor = Authentication.user._id;
			report.updated = moment();

			// console.log('report: ', report);
			report.$save(function(){
				// console.log('new report: ', report);
				report.company = originalReport.company;
				$scope.reports.push(report);
				$scope.filterReports();
			}, function(error) {
				console.log(error);
			});
		};

		$scope.copyReports = function() {
			var selectedReports = [];
			for(var i = 0; i < $scope.reports.length; i++) {
				if($scope.reports[i].isChecked)
					selectedReports.push($scope.reports[i]);
			}
			if(selectedReports.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'ReportsCopyModalController',
			    templateUrl: 'modules/reports/views/modal.copy.report.html',
			    resolve: {
			     	reports: function () {
			        	return selectedReports;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
		    	for(var i = 0; i < $scope.reports.length; i++) {
					if($scope.reports[i].isChecked) {
						$scope.copyReport($scope.reports[i]);
						$scope.reports[i].isChecked = false;
					}
				}
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		// Delete selected reports
		$scope.deleteReports = function() {
			var selectedReports = [];
			for(var i = 0; i < $scope.reports.length; i++) {
				if($scope.reports[i].isChecked)
					selectedReports.push($scope.reports[i]);
			}
			if(selectedReports.length === 0) return;
			var modalInstance = $modal.open({
			    controller: 'ReportDeleteModalCtrl',
			    templateUrl: 'modules/reports/views/modal.delete.report.html',
			    resolve: {
			     	reports: function () {
			        	return selectedReports;
			      	}
			    }
			});
			modalInstance.result.then(function (modalResult) {
				var i = $scope.reports.length;
				while (i--) {
					if($scope.reports[i].isChecked) {
						// $scope.reports[i].$delete();
						Reports.delete({reportId: $scope.reports[i]._id});
						$scope.reports.splice(i, 1);
					}
				}
				$scope.filterReports();
				console.log('after deletion: ', $scope.reports);
		    }, function () {
		      	console.log('Modal dismissed at: ' + new Date());
		    });
		};

		$scope.generateDate = function(dateStr) {
			return moment(dateStr).tz('America/New_York').format('MM/DD/YYYY HH:mm a');
		};

		$scope.filterByCompany = function() {
			if(!$scope.filters.company)  {
				$scope.selectedCompany = 'all';
			} else {
				$scope.selectedCompany = $scope.filters.company._id;
			}
			$scope.find();
		};

		$scope.filterSitesByCompany = function() {
			$scope.availableFrequencies = [];
			$scope.timelineFilters.frequencies = [];
			if(!$scope.timelineFilters.company)  {
				$scope.selectedCompanyForTimeline = 'all';
				$scope.sites = [];
			} else {
				$scope.selectedCompanyForTimeline = $scope.timelineFilters.company._id;

				if ($scope.isSuperAdmin) {
					$scope.selectedCompanyForTimeline = $scope.timelineFilters.company._id;
				} else {
					$scope.selectedCompanyForTimeline = $scope.timelineFilters.company;
				}
				$scope.sites = SitesByCompany.query({companyId: $scope.selectedCompanyForTimeline});
				//$scope.availableFrequencies = FrequenciesByCompany.query({companyId: $scope.selectedCompanyForTimeline});
			}
		};

		$scope.filterReports = function() {
			$scope.filteredReports = [];
			$scope.types = [];
			var isMgmtExist = false,
				isRegExist =false;
			for (var i = 0; i < $scope.reports.length; i++) {
				if ($scope.reports[i].type === 'management') {
					isMgmtExist = true;
				} else if ($scope.reports[i].type === 'regulatory') {
					isRegExist = true;
				}
				if (($scope.filters.type === undefined) || 			// filter by keyword
					(!$scope.filters.type) ||
					($scope.reports[i].type === $scope.filters.type.value)) {
					if (($scope.filters.checklist === undefined) || 			// filter by regulation
						(!$scope.filters.checklist) ||
						($scope.reports[i].checklist._id === $scope.filters.checklist._id)) {
						$scope.filteredReports.push($scope.reports[i]);
					}
				}
			}

			if (isMgmtExist) {
				$scope.types.push({
					value: 'management',
					text: 'Management Inspection Data Report'
				});
			}
			if (isRegExist) {
				$scope.types.push({
					value: 'regulatory',
					text: 'Regulatory Inspection Data Report'
				});
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

		$scope.getInspectionDate = function(checklistId, index) {
			var q = $q.defer();
			var latestInspection = InspectionDates.query({checklistId: checklistId, isSubmitted: 1, fetch: 'all'});
			latestInspection.$promise.then(function(response) {
				if (response.length == 0) {
					$scope.checklists[index].inspectionDates = [moment(new Date()).format('MM/DD/YYYY')];
				} else {
					response.sort(function(a, b) {
						return new Date(b.date) - new Date(a.date);
					});
					$scope.checklists[index].inspectionDates = [];
					angular.forEach(response, function(item) {
						if ($scope.checklists[index].inspectionDates.indexOf(moment(item.date).format('MM/DD/YYYY')) < 0) {
							$scope.checklists[index].inspectionDates.push(moment(item.date).format('MM/DD/YYYY'));
						}
					});
					var item = response[0];
					if (item.dueDates && item.dueDates.length > 0) {
						for (var j = 0; j < item.dueDates.length; j++) {
							if ($scope.checklists[index].inspectionDates.indexOf(moment(item.dueDates[j]).format('MM/DD/YYYY')) < 0) {
								$scope.checklists[index].inspectionDates.push(moment(item.dueDates[j]).format('MM/DD/YYYY'));
							}
						}
					}
				}
				q.resolve(response);
			});
			return q.promise;
		};

		$scope.fetchChecklists = function() {
			var date = new Date();
			$scope.startRangeDate = new Date();
			$scope.endRangeDate = new Date(date.setMonth(date.getMonth() + 3));
			$scope.timeline_data = {items: VisDataSet([])};
			$scope.safe_inspection_items = $scope.inspection_items = [];
			if ($scope.timelineFilters.site) {

				var data = {site: $scope.timelineFilters.site._id, frequencies: [], isAll: true};
				$http
					.post('/checklists/bySiteAndFrequencies', data)
					.success(function(response) {
						$scope.availableFrequencies = [];
						$scope.timelineFilters.frequencies = [];
						angular.forEach(response, function(item) {
							if (item.frequency) {
								var tmp = $scope.availableFrequencies.filter(function(d) {
									return d._id == item.frequency._id;
								});
								if (tmp.length == 0) {
									$scope.availableFrequencies.push(item.frequency);
									$scope.timelineFilters.frequencies.push({
										id: item.frequency._id
									});
								}
							}
						});
						$scope.checklists = response;
						var qLists = [];
						for(var i=0; i<response.length; i++) {
							qLists.push($scope.getInspectionDate(response[i]._id, i));
						}
						$q.all(qLists).then(function(values) {
							$scope.inspection_items = [];
							var idx = 0;
							angular.forEach($scope.checklists, function(item, checklist_index) {
								angular.forEach(item.inspectionDates, function(d, index) {
									idx++;
									$scope.inspection_items.push({
										id: idx,
										name: item.name,
										content: '<b>' + item.name + '</b>' + '<br>' + item.frequency.name + '<br>' + d,
										start: new Date(d),
										site: item.site.name,
										frequency: item.frequency.name,
										editor: item.editor.displayName
									});
								});
							});
							$scope.inspection_items = $filter('orderBy')($scope.inspection_items, ['+start']);
							$scope.safe_inspection_items = $scope.inspection_items;
							$scope.timeline_data = {items: VisDataSet($scope.inspection_items)};
						})
					}).error(function(response) {
					console.log('login error: ', response);
					$scope.error = response.message;
				});
			}
		};
		$scope.fetchChecklistsByFrequency = function() {
			var date = new Date();
			$scope.startRangeDate = new Date();
			$scope.endRangeDate = new Date(date.setMonth(date.getMonth() + 3));
			$scope.timeline_data = {items: VisDataSet([])};
			$scope.safe_inspection_items = $scope.inspection_items = [];
			if ($scope.timelineFilters.site) {

				var data = {site: $scope.timelineFilters.site._id, frequencies: $scope.timelineFilters.frequencies};
				$http
					.post('/checklists/bySiteAndFrequencies', data)
					.success(function(response) {
						$scope.checklists = response;
						var qLists = [];
						for(var i=0; i<response.length; i++) {
							qLists.push($scope.getInspectionDate(response[i]._id, i));
						}
						$q.all(qLists).then(function(values) {
							$scope.inspection_items = [];
							var idx = 0;
							angular.forEach($scope.checklists, function(item, checklist_index) {
								angular.forEach(item.inspectionDates, function(d, index) {
									idx++;
									$scope.inspection_items.push({
										id: idx,
										name: item.name,
										content: '<b>' + item.name + '</b>' + '<br>' + item.frequency.name + '<br>' + d,
										start: new Date(d),
										site: item.site.name,
										frequency: item.frequency.name,
										editor: item.editor.displayName
									});
								});
							});
							$scope.inspection_items = $filter('orderBy')($scope.inspection_items, ['+start']);
							$scope.safe_inspection_items = $scope.inspection_items;
							$scope.timeline_data = {items: VisDataSet($scope.inspection_items)};
						})
					}).error(function(response) {
					console.log('login error: ', response);
					$scope.error = response.message;
				});
			}
		};
		$scope.onRangeChange = function(event) {
			$scope.startRangeDate = event.start;
			$scope.endRangeDate = event.end;
			$scope.$apply();
		};
		$scope.onSelectInspection = function(obj) {
			$scope.inspection_items.map(function(item) {
				if (item.id === obj.items[0]) {
					item.selected = true;
				} else {
					item.selected = false;
				}
			});
			$scope.$apply();
		};
		$scope.events = {
			rangechanged: $scope.onRangeChange,
			select: $scope.onSelectInspection
		};

		var date = new Date();
		$scope.startRangeDate = new Date();
		$scope.endRangeDate = new Date(date.setMonth(date.getMonth() + 3));
		var minDate = new Date();
		var maxDate = new Date();
		$scope.options = {
			"align": "center",
			"autoResize": true,
			"editable": false,
			"selectable": true,
			"orientation": "bottom",
			"showCurrentTime": true,
			"showMajorLabels": true,
			"showMinorLabels": true,
			"start": $scope.startRangeDate,
			"end": $scope.endRangeDate,
			"min": minDate.setMonth(minDate.getMonth() - 3),
			"max": maxDate.setFullYear(maxDate.getFullYear() + 1)
		};
	}
]);

'use strict';

//Reports service used for communicating with the reports REST endpoints
angular.module('reports').factory('Reports', ['$resource',
	function($resource) {
		return $resource('reports/:reportId', {
			reportId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('ReportsByCompany', ['$resource',
	function($resource) {
		return $resource('reports/company/:companyId', {companyId:'@companyId'});
	}
])
.factory('CompaniesForReports', ['$resource',
	function($resource) {
		return $resource('reports/companies');
	}
])
.factory('ChecklistsForReports', ['$resource',
	function($resource) {
		return $resource('reports/checklists', {});
	}
])
.factory('InspectionReports', ['$resource',
	function($resource) {
		return $resource('reports/inspections');
	}
])
.service('ReportData', function() {
    return {
        company: null,
        checklist: null,
        inspectors: [],
        frameworks: [],
        fromDate: null,
        toDate: null
    };
})
.filter("timelineDatRange", function() {
	return function(items, from, to) {
		var result = [];
		if (items) {
			for (var i=0; i<items.length; i++){
				var d = new Date(items[i].start);
				if (d >= new Date(from) && d <= new Date(to))  {
					result.push(items[i]);
				}
			}
		}
		return result;
	};
});

'use strict';

// Configuring the Sites module
angular.module('sites').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'Sites', 'sites', 'dropdown', '/sites(/create)?');
		Menus.addSubMenuItem('topbar', 'admin', 'Sites', 'sites', null, true, ['superadmin', 'administrator'], 2);
	}
]);
'use strict';

// Setting up route
angular.module('sites').config(['$stateProvider',
	function($stateProvider) {
		// sites state routing
		$stateProvider.
		state('sites-list', {
			url: '/sites',
			templateUrl: 'modules/sites/views/list-sites.client.view.html'
		}).
		state('site-create', {
			url: '/sites/new',
			templateUrl: 'modules/sites/views/create-site.client.view.html'
		}).
		state('site-detail', {
			url: '/sites/:siteId/edit',
			templateUrl: 'modules/sites/views/create-site.client.view.html'
		});
	}
]);
'use strict';

// Sites controller
angular.module('sites').controller('SiteCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Companies', 'Sites', 'SiteSrv', 'UserRole',
	function($scope, $stateParams, $location, Authentication, Companies, Sites, SiteSrv, UserRole) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			$scope.data = {};
			if($stateParams.siteId) {
				$scope.findOne($stateParams.siteId);
			} else {
				$scope.site = new Sites({
					name: '',
					status: true
					// company: Authentication.user.company
				});
				if(!$scope.isSuperAdmin) {
					$scope.site.company = Authentication.user.company;
				}
				$scope.breadcrumbLabel = 'New Site';
				$scope.reset();
			}
			// console.log($scope.site);
			$scope.companies = Companies.query();

		};

		// Find existing Site
		$scope.findOne = function(id) {
			$scope.site = Sites.get({
				siteId: id
			});
			$scope.site.$promise.then(function(response) {
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.site.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.site.company = $scope.site.company._id;
				}
				$scope.breadcrumbLabel = 'Site Details [' + $scope.site.name + ']';
				$scope.reset();
			});
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.siteName || !$scope.siteName.length) {
				$scope.error = 'Please fill in site name.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		// Create new Company
		$scope.save = function() {
			if(!$scope.isFormValid()) return;
			$scope.site.updated = $scope.lastUpdated = moment();
			$scope.site.name = $scope.siteName;
			if ($scope.isSuperAdmin) {
				$scope.site.company = $scope.data.company._id;
			}
			$scope.site.status = $scope.status === 'true' ? true : false;
			$scope.site.editor = $scope.authentication.user._id;
			if($scope.site._id) {
				$scope.site.$update(function(response) {
					// console.log(response);
					$location.path('sites');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			} else {
				$scope.site.$save(function(response) {
					// console.log(response);
					$location.path('sites');
				}, function(errorResponse) {
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.reset = function() {
			$scope.data.company = $scope.site.company;
			$scope.siteName = $scope.site.name;
			$scope.status = $scope.site.status ? 'true' : 'false';
			$scope.lastUpdated = moment($scope.site.updated).tz('America/New_York');
			if($scope.site.editor) {
				// console.log($scope.site.editor);
				$scope.editor = ' by [' + $scope.site.editor.username + ']';
			} else {
				$scope.editor = '';
			}
		};

		$scope.cancel = function() {
			$location.path('sites');
		};
	}
]);

'use strict';

// Site controller
angular.module('sites').controller('SitesController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Companies', 'Sites', 'SiteSrv', 'UserRole', 'SitesByCompany', 'PersistSortService',
	function($scope, $http, $stateParams, $location, Authentication, Companies, Sites, SiteSrv, UserRole, SitesByCompany, PersistSortService) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.isHideInactivate = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'name': true,
			'company': false,
			'status': false
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'name': false,
					'company': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('site_sort', $scope.sortColumn);
		};

		// Create new Site
		$scope.create = function() {
			$location.path('sites/new');
		};

		// Find a list of Sites
		$scope.find = function() {
			if (PersistSortService.get('site_sort')) {
				$scope.sortColumn = PersistSortService.get('site_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			if ($scope.isSuperAdmin) {
				$scope.findAll();
			} else {
				$scope.findByCompany();
			}
		};

		$scope.findAll = function() {
			$http.get('/sites/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.sites = response;
				$scope.safeSites = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.sites = $scope.safeSites = SitesByCompany.query({companyId: Authentication.user.company});
		};

		// Find existing Site
		$scope.findOne = function() {
			$scope.site = Sites.get({
				siteId: $stateParams.siteId
			});
		};

		$scope.editSite = function(site) {
			// SiteSrv.site = site;
			$location.path('sites/' + site._id + '/edit');
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		}
	}
]);

'use strict';

//Sites service used for communicating with the sites REST endpoints
angular.module('sites').factory('Sites', ['$resource',
	function($resource) {
		return $resource('sites/:siteId', {
			siteId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('SitesByCompany', ['$resource',
	function($resource) {
		return $resource('sites/company/:companyId', {companyId:'@companyId'});
	}
])
//Sites service used for sharing site object throughout the whole module
.service('SiteSrv', function() {
	this.site = {};
});
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
])
.constant('UserRole', {
	Inspector: 'inspector',
	Supervisor: 'supervisor',
	Administrator: 'administrator',
	Superadmin: 'superadmin'
})
.run(['Menus',
	function(Menus) {
		Menus.addSubMenuItem('topbar', 'admin', 'Users', 'users', null, true, ['superadmin', 'administrator'], 0);
	}
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		// state('profile', {
		// 	url: '/settings/profile',
		// 	templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		// }).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		// state('signup', {
		// 	url: '/signup',
		// 	templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		// }).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('usersAdmin', {
			url: '/users',
			templateUrl: 'modules/users/views/admin/user-admin.client.view.html'
		}).
		state('user-create', {
			url: '/users/new',
			templateUrl: 'modules/users/views/admin/create-user.client.view.html'
		}).
		state('user-detail', {
			url: '/users/:userId/edit',
			templateUrl: 'modules/users/views/admin/create-user.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', 'Companies', 'UserRole', 
	function($scope, $http, $location, Authentication, Companies, UserRole) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$scope.credentials.company = $scope.credentials.company._id;
			console.log('signup: ', $scope.credentials);
			// $scope.credentials.company = $scope.credentials.company._id;
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				console.log('signup error: ', response);
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
				console.log(response);
				// And redirect to the index page
				if (response.role === UserRole.Inspector) {
					$location.path('inspection');
				} else if (response.role === UserRole.Supervisor) {
					$location.path('reports');
				} else if (response.role === UserRole.Administrator) {
					$location.path('users');
				} else if (response.role === UserRole.Superadmin) {
					$location.path('users');
				}
			}).error(function(response) {
				console.log('login error: ', response);
				$scope.error = response.message;
			});
		};

		// Find a list of Companies
		$scope.find = function() {
			$scope.companies = Companies.query();
			// console.log($scope.companies);
		};
	}
]);
'use strict';

// Users controller
angular.module('users').controller('UserCreateController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'Users', 'Companies', 'SitesByCompany', 'ChecklistsByCompany', 'SupervisorsByCompany', 'UserRole', '$modal',
	function($scope, $stateParams, $http, $location, Authentication, Users, Companies, SitesByCompany, ChecklistsByCompany, SupervisorsByCompany, UserRole, $modal) {

		$scope.initialize = function() {
			$scope.userRoles = ['superadmin', 'administrator'];
			$scope.authentication = Authentication;
			$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			$scope.data = {};
			if($stateParams.userId) {
				$scope.findOne($stateParams.userId);
			} else {
				$scope.user = new Users({
					username: '',
					email: '',
					lastName: '',
					firstName: '',
					status: true
					// company: Authentication.user.company
				});
				if (!$scope.isSuperAdmin) {
					$scope.user.company = Authentication.user.company;
				}
				$scope.reset();
				$scope.breadcrumbLabel = 'New User';
			}
			$scope.supervisors = angular.copy($scope.user.supervisors);
			if(!$scope.user.password)
				$scope.user.password = $scope.randomPassword(8);
			$scope.companies = Companies.query();

			$scope.sites = [];
			$scope.checklists = [];
			$scope.availableSites = [];
			$scope.availableChecklists = [];
			$scope.roles = ['Inspector', 'Supervisor'];
			if(Authentication.user.role === UserRole.Superadmin) {
				$scope.roles.push('Administrator');
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

		// Find existing User
		$scope.findOne = function(id) {
			$scope.user = Users.get({
				userId: id
			});
			$scope.user.$promise.then(function(response){
				if ($scope.authentication.user.role === 'administrator') {
					if ($scope.user.company._id !== $scope.authentication.user.company) {
						$location.path('/');
					}
					$scope.user.company = $scope.user.company._id;
				}
				$scope.breadcrumbLabel = 'User Details [' + $scope.user.username + ']';
				$scope.reset();
			});
		};

		$scope.getRoleValue = function(role) {
			return UserRole[role];
		};

		$scope.isFormValid = function() {
			if($scope.isSuperAdmin && !$scope.data.company) {
				$scope.error = 'Please select company.';
			} else if(!$scope.username || !$scope.username.length) {
				$scope.error = 'Please fill in the username.';
			} else if(!$scope.firstName || !$scope.firstName.length) {
				$scope.error = 'Please fill in first name.';
			} else if(!$scope.lastName || !$scope.lastName.length) {
				$scope.error = 'Please fill in last name.';
			} else if(!$scope.role) {
				$scope.error = 'Please select user role.';
			} else if(!$scope.email || !$scope.email.length) {
				$scope.error = 'Please fill in the email.';
			} else {
				$scope.error = null;
			}
			if ($scope.error) return false;
			return true;
		};

		$scope.filterByCompany = function(company) {
			$scope.sites = [];
			$scope.checklists = [];
			$scope.supervisors = [];
			if (!$scope.data.company)  {
				$scope.selectedCompany = 'none';
				$scope.availableChecklists = [];
				$scope.availableSites = [];
			} else {
				if ($scope.isSuperAdmin) {
					$scope.selectedCompany = $scope.data.company._id;
				} else {
					$scope.selectedCompany = $scope.data.company;
				}
				SitesByCompany.query({companyId: $scope.selectedCompany}).$promise.then(function(response) {
					$scope.availableSites = response;
				});
				SupervisorsByCompany.query({companyId: $scope.selectedCompany}).$promise.then(function(response) {
					$scope.supervisors = response;
					for( var i = 0; i < $scope.supervisors.length; i ++ ) {
						if($scope.user._id === $scope.supervisors[i]._id) {
							$scope.supervisors.splice(i, 1);
						}
					}
				});
			}
		};

		$scope.onSiteSelected = function(item) {
			if($scope.sites.length === 0) {
				$scope.availableChecklists = [];
				return;
			}
			$http
			.post('/checklists/bySites', $scope.sites)
			.success(function(response) {
				// console.log('checklists by sites: ', response);
				$scope.availableChecklists = response;
			}).error(function(response) {
				console.log('login error: ', response);
				$scope.error = response.message;
			});
		};

		$scope.onChecklistSelected = function(item) {
		};

		// Create new Company
		$scope.save = function() {
			if (!$scope.isFormValid()) return;
			if ($scope.isSuperAdmin) {
				$scope.user.company = $scope.data.company._id;
			}
			$scope.user.username = $scope.username;
			$scope.user.lastName = $scope.lastName;
			$scope.user.firstName = $scope.firstName;
			$scope.user.role = $scope.role;
			if($scope.supervisor) {
				$scope.user.supervisor = $scope.supervisor._id;
			} else {
				$scope.user.supervisor = null;
			}
			$scope.user.email = $scope.email;
			$scope.user.updated = $scope.lastUpdated = moment();
			$scope.user.editor = $scope.authentication.user._id;
			$scope.user.sites = [];
			if($scope.sites) {
				for(var i = 0; i < $scope.sites.length; i++) {
					$scope.user.sites.push($scope.sites[i].id);
				}
			}
			$scope.user.checklists = [];
			if($scope.checklists) {
				for(var j = 0; j < $scope.checklists.length; j++) {
					$scope.user.checklists.push($scope.checklists[j].id);
				}
			}
			// $scope.supervisors = $scope.supervisor.split(',');
			$scope.user.status = $scope.status === 'true' ? true : false;
			// $scope.user.password = $scope.password;
			console.log('password is ', $scope.user.password);
			console.log('configuration: ', $scope.user);
			if($scope.user._id) {
				$scope.user.$update(function(response) {
					console.log('updated: ', response);
					$location.path('users');
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			} else {
				// console.log($scope.user);
				$scope.user.$save(function(response) {
					$location.path('users');
				}, function(errorResponse) {
					console.log(errorResponse);
					if(errorResponse.data)
						$scope.error = errorResponse.data.message;
				});
			}
		};

		$scope.saveSuperUser = function() {
			$scope.role = UserRole.Superadmin;
			$scope.save();
		};

		$scope.reset = function() {
			console.log($scope.user);
			$scope.data.company = $scope.user.company;
			$scope.filterByCompany();
			$scope.username = $scope.user.username;
			$scope.lastName = $scope.user.lastName;
			$scope.firstName = $scope.user.firstName;
			$scope.role = $scope.user.role;
			$scope.email = $scope.user.email;
			$scope.status = $scope.user.status ? 'true' : 'false';
			$scope.supervisor = $scope.user.supervisor;
			$scope.lastUpdated = moment($scope.user.updated).tz('America/New_York');
			if($scope.user.editor) {
				$scope.editor = ' by [' + $scope.user.editor.username + ']';
			} else {
				$scope.editor = '';
			}
			if($scope.user.sites) {
				for(var i=0; i<$scope.user.sites.length; i++) {
					$scope.sites.push({id: $scope.user.sites[i]});
				}
				$scope.onSiteSelected();
			} else {
				$scope.sites = [];
			}
			if($scope.user.checklists) {
				for(var i=0; i<$scope.user.checklists.length; i++) {
					$scope.checklists.push({id: $scope.user.checklists[i]});
				}
			} else {
				$scope.checklists = [];
			}
		};

		$scope.cancel = function() {
			$location.path('users');
		};
		
		$scope.randomPassword = function(length) {
		    var chars = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890';
		    var pass = '';
		    for (var x = 0; x < length; x++) {
		        var i = Math.floor(Math.random() * chars.length);
		        pass += chars.charAt(i);
		    }
		    return pass;
		};

		$scope.deactivateNew = function() {
			var selectedUsers = [$scope.user];
			var modalInstance = $modal.open({
				controller: 'UserInactivateModalCtrl',
				templateUrl: 'modules/users/views/admin/modal-confirm.html',
				resolve: {
					selectedUsers: function () {
						return selectedUsers;
					},
					makeActivate: function () {
						return false;
					}
				}
			});
			modalInstance.result.then(function (modalResult) {
				$http.post('/users/deactivate/' + $scope.user._id).success(function (response) {
					console.log('success');
					$location.path('users');
				}).error(function (response) {
					console.log('error: ', response);
					$location.path('users');
				});
			}, function () {

			});
		};

		$scope.activateNew = function() {
			var selectedUsers = [$scope.user];
			var modalInstance = $modal.open({
				controller: 'UserInactivateModalCtrl',
				templateUrl: 'modules/users/views/admin/modal-confirm.html',
				resolve: {
					selectedUsers: function () {
						return selectedUsers;
					},
					makeActivate: function () {
						return true;
					}
				}
			});
			modalInstance.result.then(function (modalResult) {
				$http.post('/users/activate/' + $scope.user._id).success(function (response) {
					console.log('success');
					$location.path('users');
				}).error(function (response) {
					console.log('error: ', response);
					$location.path('users');
				});
			}, function () {

			});
		};
	}
]);

'use strict';

// Users Modal controller
angular.module('users')
.controller('UserInactivateModalCtrl', ['$scope', '$modalInstance', 'selectedUsers', 'makeActivate',
	function($scope, $modalInstance, selectedUsers, makeActivate) {
		$scope.selectedUsers = selectedUsers;
		$scope.makeActivate = makeActivate;
		console.log($scope.makeActivate)
		$scope.ok = function () {
		    $modalInstance.close('ok');
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;
		$scope.isNewPasswordValid = false;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.becomeAdmin = function() {
			$scope.user.role = 'superadmin';
			$scope.updateUserProfile(true);
		};

		$scope.verifyNewPassword = function() {
			if ($scope.passwordDetails.newPassword == $scope.passwordDetails.verifyPassword) {
				$scope.isNewPasswordValid = true;
				$scope.error = '';
			} else {
				$scope.isNewPasswordValid = false;
				$scope.error = 'New passwords do not match.';
			}
		}

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;
			$scope.verifyNewPassword();
			if (!$scope.isNewPasswordValid) return;			

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// User controller
angular.module('users').controller('UsersController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Users', 'UserSrv', 'UserRole', 'UsersByCompany', 'PersistSortService', '$modal',
	function($scope, $http, $stateParams, $location, Authentication, Users, UserSrv, UserRole, UsersByCompany, PersistSortService, $modal) {

		$scope.userRoles = ['superadmin', 'administrator'];
		$scope.authentication = Authentication;
		$scope.isSuperAdmin = (Authentication.user.role === UserRole.Superadmin) ? true : false;
		$scope.isHideInactivateUsers = true;
		$scope.lastUpdated = moment().tz('America/New_York');

		$scope.sortColumn = {
			'username': false,
			'company': false,
			'lastName': true,
			'firstName': false,
			'role': false,
			'email': false,
			'status': false
		};

		$scope.addNew = function() {
			$location.path('users/new');
		};

		$scope.persistSort = function(item) {
			if ($scope.sortColumn[item] == true) {
				$scope.sortColumn = {
					'username': false,
					'company': false,
					'lastName': false,
					'firstName': false,
					'role': false,
					'email': false,
					'status': false
				};
				$scope.sortColumn[item] = 'reverse';
			} else if ($scope.sortColumn[item] == false) {
				$scope.sortColumn = {
					'username': false,
					'company': false,
					'lastName': false,
					'firstName': false,
					'role': false,
					'email': false,
					'status': false
				};
				$scope.sortColumn[item] = true;
			} else if ($scope.sortColumn[item] == 'reverse') {
				$scope.sortColumn = {
					'username': false,
					'company': false,
					'lastName': false,
					'firstName': false,
					'role': false,
					'email': false,
					'status': false
				};
				$scope.sortColumn[item] = false;
			}
			PersistSortService.set('user_sort', $scope.sortColumn);
		};

		$scope.deactivateUsers = function() {
			var selectedUsers = $scope.users.filter(function(item) {
				return item.selected === true;
			});
			if(selectedUsers.length === 0) return;
			var modalInstance = $modal.open({
				controller: 'UserInactivateModalCtrl',
				templateUrl: 'modules/users/views/admin/modal-confirm.html',
				resolve: {
					selectedUsers: function () {
						return selectedUsers;
					},
					makeActivate: function () {
						return false;
					}
				}
			});
			modalInstance.result.then(function (modalResult) {
				var i = $scope.users.length;
				while (i--) {
					if($scope.users[i].selected) {
						$http.post('/users/deactivate/'+$scope.users[i]._id).success(function(response) {
							console.log('success');
						}).error(function(response) {
							console.log('error: ', response);
						});
						$scope.users[i].status = false;
						$scope.users[i].selected = false;
						$scope.users.forEach(function(item) {
							if (item.supervisor && item.supervisor._id === $scope.users[i]._id) {
								item.supervisor = null;
							}
						});
					}
				}
			}, function () {

			});
		};

		$scope.editUser = function(user) {
			$location.path('users/' + user._id + '/edit');
		};

		// Find a list of Users
		$scope.find = function() {
			if (PersistSortService.get('user_sort')) {
				$scope.sortColumn = PersistSortService.get('user_sort');
			}
			if ($scope.userRoles.indexOf(Authentication.user.role) < 0) {
				$location.path('/');
			}
			if ($scope.isSuperAdmin) {
				$scope.findAll();
			} else {
				$scope.findByCompany();
			}
		};

		$scope.findAll = function() {
			$http.get('/users/all').success(function(response) {
				// If successful we assign the response to the global user model
				$scope.users = response;
				$scope.safeUsers = response;
			}).error(function(response) {
				$scope.error = response.message;
				console.log('error: ', response);
			});
		};

		$scope.findByCompany = function() {
			// console.log(Authentication.user);
			$scope.users = $scope.safeUsers = UsersByCompany.query({companyId: Authentication.user.company});
		};

		$scope.sortByStatus = function(row) {
			return !row.status;
		};

		// Find existing User
		$scope.findOne = function() {
			$scope.company = Users.get({
				userId: $stateParams.userId
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {
	var auth = {
		user: $window.user
	};
	
	return auth;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users/:userId', {userId: '@_id'}, {
			update: {
				method: 'PUT'
			},
			edit: {
				method: 'POST'
			}
		});
	}
])
.factory('UsersByCompany', ['$resource',
	function($resource) {
		return $resource('users/company/:companyId', {companyId: '@companyId'});
	}
])
.factory('InspectorsByCompany', ['$resource',
	function($resource) {
		return $resource('users/inspector/:companyId', {companyId: '@companyId'});
	}
])
.factory('SupervisorsByCompany', ['$resource',
	function($resource) {
		return $resource('users/supervisor/:companyId', {companyId: '@companyId'});
	}
])
.factory('InspectorsByChecklist', ['$resource',
	function($resource) {
		return $resource('inspectors/:checklistId', {checklistId: '@checklistId'});
	}
])
//Users service used for sharing user object throughout the whole module
.service('UserSrv', function() {
	this.user = {};
});
