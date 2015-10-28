app
	.directive('achievementList', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				achievementsDeclared: '='
			},
			link: function(scope, elm, attrs) {
				scope.$watchCollection('achievementsDeclared', function(val) {
					console.log('achievementsDeclared', val);
				});

				scope.obj = function(val) {
					return new Array(val);
				};

				scope.showDetails = function(desc) {
					console.log(desc);
				};
			},
			template:
				'<div>'+
					'<img ng-repeat="i in achievementsDeclared track by $index" class="item-image" src="https://placehold.it/30x30" ng-click="showDetails(i.description)">'+
				'</div>'
		}
	}]);