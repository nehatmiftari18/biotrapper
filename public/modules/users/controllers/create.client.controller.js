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
