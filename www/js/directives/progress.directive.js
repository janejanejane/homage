app
	.directive('levelBar', ['$window', function($window) {
		return {
			restrict: 'E',
			scope: {
				totalClicks: '=',
				currentLevel: '='
			},
			replace: true,
			link: function(scope, elm, attrs) {
				var width = elm[0].offsetWidth,
					height = 250,
					twoPi = 2 * Math.PI;

				var svg = d3.select(elm[0])
					.append("svg")
					.attr("class", "progress-level");

				var group = svg.append("g")
					.attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")");

				var arc = d3.svg.arc()
					.startAngle(0)
					.innerRadius(0)
					.outerRadius(120);

				// progress background
				var base = group.append("g")
					.attr("id", "progress-bar");

				var progressCircle = base.append("path")
					.datum({endAngle: twoPi})
					.attr("d", arc);

				// draw the progress
				var progress = base.append("path")
					.datum({endAngle: 0})
					.attr("fill", "#990100")
					.attr("d", arc);

				// angle of progress
				var x = d3.scale.linear();

				function drawProgress(val) {

						width = 300;
						scope.currentLevel = Math.floor(Math.log(val)/Math.LN2);

						// update domain of values for progress angle
						x.domain([scope.currentLevel, scope.currentLevel + 1])
							.range([0, twoPi]);

						// select existing svg
						svg = d3.select(elm[0])
							.select("svg")
							.attr("width", width)
							.attr("height", height);

						// update group placement
						group.attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")");

						// add color to the circle background
						progressCircle.attr("fill", "#333333");

						// change progress angle with tween
						progress.transition()
							.ease("elastic")
							.duration(750)
							.attrTween("d", function(d) {
								var interpolate = d3.interpolate(d.endAngle, x(Math.log(val)/Math.LN2));
								return function(t) {
									// set for progress end arc
									d.endAngle = interpolate(t);
									// compute arc with given value
									return arc(d);
								}
							});
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
