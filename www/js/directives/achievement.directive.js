app
	.directive('achievementList', [function() {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {

				scope.obj = function(val) {
					return new Array(val);
				};
			},
			template:
				'<div>'+
                	'<img ng-repeat="i in obj(40) track by $index" class="item-image" src="https://placehold.it/30x30">'+
                '</div>'
		}
	}]);