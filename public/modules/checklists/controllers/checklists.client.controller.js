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
