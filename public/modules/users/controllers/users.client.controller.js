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
