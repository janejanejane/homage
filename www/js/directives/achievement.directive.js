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
					scope.list = [];
					for (var i = 0; i < scope.achievementsDeclared.length; i++) {
						// copy details
						record = scope.achievementsDeclared[i];

						// set to false on first load
						record['unlocked'] = false;

						for (var j = 0; j < val.length; j++) {
							if(scope.achievementsDeclared[i].name === val[j].name) {
								record['unlocked'] = true;
							}
						};

						// add to new array
						scope.list.push(record);
					};
				});

				scope.$watchCollection('achievementsDeclared', function(newVal, oldVal) {
					if(newVal !== oldVal) {
						if(scope.list.length === 0) {
							scope.list = newVal; // display list of locked achievements
						}
					}
				});
			},
			template:
				'<div class="list">'+
					'<div ng-repeat="i in list track by $index">'+
						'<div class="achievement-list">'+
							'<img class="item-image" ng-src="{{!i.unlocked && \'img/fff.png\' || \'img/30x30.jpg\'}}">'+
							'<h6>{{i.unlocked && i.description || \'???\'}}</h6>'+
						'</div>'+
					'</div>'+
				'</div>'
		}
	}]);