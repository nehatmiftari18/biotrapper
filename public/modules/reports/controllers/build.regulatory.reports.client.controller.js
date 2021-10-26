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
