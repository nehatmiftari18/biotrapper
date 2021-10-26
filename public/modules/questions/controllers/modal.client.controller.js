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
