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
