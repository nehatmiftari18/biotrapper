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
