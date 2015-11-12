app
	.directive('avatarList', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				currentLevel: '=',
				avatarLoc: '='
			},
			link: function(scope, elm, attrs) {
				console.log('avatarLoc', scope.avatarLoc);
				scope.list = new Array(84);
			},
			template:
				'<div>'+
					'<div ng-repeat="i in list track by $index">'+
						'<img class="item-image" ng-if="$index <= currentLevel" ng-src="img/{{avatarLoc}}-{{($index < 10) ? \'0\' + $index : $index}}.png" >'+
					'</div>'+
				'</div>'
		}
	}]);