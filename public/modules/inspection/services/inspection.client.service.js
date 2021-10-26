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
