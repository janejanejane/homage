app
	.directive('levelBar', ['$window', function($window) {
		return {
			restrict: 'E',
			scope: {
				totalClicks: '='
			},
			link: function(scope, elm, attrs) {

				function drawProgress(val) {

						d3.select("#" + elm[0].id + " svg").remove();

						var width = elm[0].offsetWidth,
							currentLevel = Math.floor(Math.log(val)/Math.LN2);

						var svg = d3.select(elm[0])
							.append("svg")
							.attr("class", "progress-level")
							.attr("width", width)
							// .attr("height", 10)
							.append("g")
							.attr("transform", "translate(0, 10)");

						var x = d3.scale.linear()
								.domain([currentLevel, currentLevel + 1])
								.range([0, width]);

						svg.append("text")
							.text("Lvl " + currentLevel)
							.attr("id", "current-level");

						svg.append("text")
							.text("Lvl " + (currentLevel + 1))
							.attr("x", width - 40)
							.attr("id", "next-level");

						svg.append("rect")
							.attr("width", function() {
								return x(Math.log(val)/Math.LN2);
							})
							.attr("height", 10)
							.attr("x", 0)
							.attr("y", 5)
							.attr("id", "progress-bar");
						};

				scope.$watch('totalClicks', function(val) {
					if(val) {
						drawProgress(val);
					}
				});

				// bind draw action on screen resize then call angular digest
				angular.element($window).bind('resize', function() {
					if(scope.totalClicks) {
						scope.$apply(drawProgress(scope.totalClicks));
					}
				});
			}
		}
	}]);
