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
					scope.buttonClick();
				}

				scope.onRelease = function(){
					scope.touchDown = false;
				}
			},
			template:
				'<div>'+
					'<img class="item-image"'+
						'on-touch="onTouch()"'+
						'on-release="onRelease()"'+
						'ng-class="{held: touchDown}"'+
						'ng-src="img/{{avatarLoc}}-{{(currentLevel < 10) ? \'0\' + currentLevel : currentLevel}}.png" >'+
					'<h1>{{totalClicks}}</h1>'+
				'</div>'
		}
	}]);