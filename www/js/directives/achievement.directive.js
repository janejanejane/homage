app
	.directive('achievementList', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				achievementsDeclared: '=',
				achievementArray: '='
			},
			link: function(scope, elm, attrs) {

				var record = null;

				scope.$watchCollection('achievementArray', function(val) {
					console.log('achievementArray', val, scope.list);
					scope.list = [];
					for (var i = 0; i < scope.achievementsDeclared.length; i++) {
						// copy details
						record = scope.achievementsDeclared[i];

						for (var j = 0; j < val.length; j++) {
							if(scope.achievementsDeclared[i].name === val[j].name) {
								record['unlocked'] = true;
							}
						};

						// add to new array
						scope.list.push(record);
					};
					console.log(scope.list);
				});

				scope.obj = function(val) {
					return new Array(val);
				};

				scope.showDetails = function(desc) {
					console.log(desc);
				};
			},
			template:
				'<div class="list">'+
					'<div ng-repeat="i in list track by $index">'+
						'<div class="achievement-list">'+
							'<img class="item-image" ng-src="{{!i.unlocked && \'img/fff.png\' || \'img/30x30.jpg\'}}" ng-click="showDetails(i.description)">'+
							'<h6>{{i.unlocked && i.description || \'???\'}}</h6>'+
						'</div>'+
					'</div>'+
				'</div>'
		}
	}]);