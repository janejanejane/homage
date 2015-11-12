app
	.directive('avatarList', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				currentLevel: '=',
				avatarLoc: '=',
				avatarNames: '='
			},
			link: function(scope, elm, attrs) {
				scope.$watch('currentLevel', function(val) {
					scope.list = [];
					// there are 84 avatars
					for (var i = 0; i < scope.avatarNames.length; i++) {
						scope.list.push({
							unlocked: (i<=val),
							name: scope.avatarNames[i].name
						});
					}
				});
			},
			template:
				'<div class="list">'+
					'<div ng-repeat="i in list track by $index" ng-if="$index > 0">'+
						'<div class="avatar-list">'+
							'<img class="item-image" ng-src="{{(i.unlocked) ? (\'img/\'+avatarLoc+\'-\'+(($index < 10) ? \'0\' + $index : $index)+\'.png\') : \'img/\'+avatarLoc+\'-00.png\'}}" >'+
							'<div class="avatar-desc">'+
								'<h3 ng-if="i.unlocked">{{i.name}} is awake!</h3>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'
		}
	}]);