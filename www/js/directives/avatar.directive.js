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
				scope.list = [];

				scope.$watch('currentLevel', function(val) {

					if(val !== 0) {
						// there are 85 avatars
						for (var i = 0; i < 85; i++) {
							scope.list.push({
								unlocked: (i<=val)
							});
						}
					}
				});
			},
			template:
				'<div class="list">'+
					'<div ng-repeat="i in list track by $index" ng-if="$index > 0">'+
						'<div class="avatar-list">'+
							'<img class="item-image" ng-src="{{(i.unlocked) ? (\'img/\'+avatarLoc+\'-\'+(($index < 10) ? \'0\' + $index : $index)+\'.png\') : \'img/100x100.jpg\'}}" >'+
							'<h6>Level {{$index}}</h6>'+
						'</div>'+
					'</div>'+
				'</div>'
		}
	}]);