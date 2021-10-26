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
