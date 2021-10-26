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
