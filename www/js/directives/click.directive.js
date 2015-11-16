app
	.directive('clickDiv', [function(){
		return {
			restrict: 'E',
			replace: true,
			scope: {
				avatarLoc: '=',
				currentLevel: '=',
				totalClicks: '=',
				buttonClick: '&'
			},
			link: function(scope, elm, attrs) {
				scope.touchDown = false;

				scope.onTouch = function(){
					scope.touchDown = true;
				}

				scope.onRelease = function(){
					scope.touchDown = false;
					scope.buttonClick();
				}

				scope.$watch('currentLevel', function(val) {
					// if level is less 10, prefix image filename with '0'
					scope.currentImg = 'img/'+ scope.avatarLoc +'-'+ ((scope.currentLevel < 10) ? '0' + scope.currentLevel : scope.currentLevel) +'.png';
				});
			},
			template:
				'<div>'+
					'<img class="item-image"'+
						'on-touch="onTouch()"'+
						'on-release="onRelease()"'+
						'ng-class="{held: touchDown}"'+
						'ng-src="{{currentImg}}" >'+
					'<h1>{{totalClicks}}</h1>'+
				'</div>'
		}
	}]);