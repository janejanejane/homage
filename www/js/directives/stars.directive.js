app
	.directive('starsDiv', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				currentLevel: '='
			},
			link: function(scope, elm, attrs) {
				console.log('scope.currentLevel', scope.currentLevel);
				scope.$watch('currentLevel', function(newVal, oldVal) {
					// only show stars on level up
					if((oldVal === 0 && newVal === 1) || (oldVal !== 0 && newVal > oldVal)) {
						d3.select("#" + elm[0].id + " svg").remove();

						var width = elm.parent().prop('offsetWidth'),
							height = elm.parent().prop('offsetHeight'),
							circles = [],
							total = 50,
							ocRadius = 5;

						for (var i = 0; i < total; i++) {
							circles.push(Math.round(Math.random() * 100));
						};

						var svg = d3.select(elm[0])
							.append("svg")
							.attr("width", width - 20)
							.attr("height", height - 90)
							.append("g")
							.attr("transform", "translate(0, 20)");

						var center = svg.append("circle")
							.style("stroke", "white")
							.style("fill", "white")
							.attr("r", 1)
							.attr("cx", function() {
								return ((width - 20) / 2);
							})
							.attr("cy", function() {
								return (height / 3);
							});

						var outside = svg.selectAll(".blast")
							.data(circles)
							.enter().append("g")
							.attr("class", "blast")
							.attr("transform", "translate("+ ((width - 20) / 2) +", "+ (height / 3) +")");

						var circleAngle = d3.scale.linear().range([0,360]).domain([0,ocRadius]);

						outside.transition()
							.duration(10000)
							.delay(function(d, i) {
								return i * 20;
							})
							.each(function(d, i) {
								var self = d3.select(this);

								self.transition()
									.attr("transform", function(d) {
										// @link: http://stackoverflow.com/a/10152452/476584
										// centre at (x, y), distance r, element is at:
										// (x + r cos(2kπ/n), y + r sin(2kπ/n))
										// where: 	n is the number of elements
										// 			k is the element currently positioning (between 1 and n inclusive).
										var x = 50 * width * Math.cos(2 * Math.PI * i / (total/2)),
											y = 50 * height * Math.sin(2 * Math.PI * i / (total/2));

										return "translate("+ x +","+ y +")"
									});
							});

						// draw stars
						outside.append("polygon")
							.style("stroke", "orange")
							.style("fill", "yellow")
							.attr("points", function() {
								// @link: https://dillieodigital.wordpress.com/2013/01/16/quick-tip-how-to-draw-a-star-with-svg-and-javascript/

								var starSides = 5,
									bigCircle = 10, // assumed radius for a big circle
									smallCircle = 5, // assumed radius for a small circle
									angle = Math.PI / starSides,
									radius = 0,
									xVal = 0,
									yVal = 0,
									coordinates = [];

								for (var i = 0; i < 2 * starSides; i++) {
									// starts at the bigCircle point then iterates to smallCircle point, and so on to form path for star
									radius = (i % 2) == 0 ? bigCircle : smallCircle;

									// same as above @line 62
									xVal = ocRadius + Math.cos(i * angle) * radius;
									yVal = ocRadius + Math.sin(i * angle) * radius;

									// store x, y values for the pentagon path
									coordinates.push(xVal + "," + yVal);
								}

								return coordinates.join(",");
							})
							.attr("transform", function(d, i) {
								return "rotate("+ circleAngle(i) +", 0, 0)";
							});
					}
				});
			}	
		}
	}]);