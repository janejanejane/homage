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
					// set unlocked avatar to false for currentLevel = 0
					if(val === 0 && !!scope.list) {
						scope.list.forEach(function(val, index) {
							scope.list[index].unlocked = false;
						});
					}

					// set unlocked avatar to true for currentLevel !=0
					if(scope.list) {
						for (var i = 0; i <= val; i++) {
							if(scope.list[i]) {
								scope.list[i].unlocked = false;
								if(i <= val) {
									scope.list[i].unlocked = true;
								}
							}
						};
					}
				});

				scope.$watch('avatarNames', function(val) {
					scope.list = [];
					// there are 84 avatars
					for (var i = 0; i < val.length; i++) {
						scope.list.push({
							unlocked: (i<=scope.currentLevel),
							name: (val[i]) ? val[i].name : ''
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
								'<h3 ng-if="!i.unlocked">???</h3>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'
		}
	}]);