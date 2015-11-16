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

				var width = elm.parent().prop('offsetWidth'),
					height = elm.parent().prop('offsetHeight'),
					circles = [],
					total = 50,
					ocRadius = 5;

				// container for the star blast
				var svg = d3.select(elm[0])
					.append("svg");

				// star group for easy location transformation
				var group = svg.append("g");

				// inner circle as guide for the outer star blast
				var center = svg.append("circle")
					.style("stroke", "white")
					.style("fill", "white");

				// angle range for the stars
				var circleAngle = d3.scale.linear().range([0,total]).domain([0,ocRadius]);

				scope.$watch('currentLevel', function(newVal, oldVal) {
					// only show stars on level up
					if((oldVal === 0 && newVal === 1) || (oldVal !== 0 && newVal > oldVal)) {

						// update container size
						width = elm.parent().prop('offsetWidth');
						height = elm.parent().prop('offsetHeight');

						circles = [];
						for (var i = 0; i < total; i++) {
							circles.push(Math.round(Math.random() * 100));
						};

						// select existing container for the star blast
						svg = d3.select("svg")
							.attr("width", width - 20)
							.attr("height", height - 90);

						// move star group
						group.attr("transform", "translate(0, 20)");

						// set location and radius of inner circle
						center.attr("r", 1)
							.attr("cx", function() {
								return ((width - 20) / 2);
							})
							.attr("cy", function() {
								return (height / 3);
							});

						// get all existing stars
						var outside = group.selectAll(".blast")
							.data(circles, function(d, i) {
								return "" + d + i;
							});

						// add new stars if not already drawn
						outside.enter().append("g")
							.attr("class", "blast");

						// // adjust location of stars similar to inner circle
						outside.attr("transform", "translate("+ ((width - 20) / 2) +", 100)");

						// blast transition
						outside.transition()
							.duration(5000)
							.each(function(d, i) {
								var self = d3.select(this);

								self.transition()
									.attr("transform", function(d) {
										// @link: http://stackoverflow.com/a/10152452/476584
										// centre at (x, y), distance r, element is at:
										// (x + r cos(2kπ/n), y + r sin(2kπ/n))
										// where: 	n is the number of elements
										// 			k is the element currently positioning (between 1 and n inclusive).
										var x = 2 * width * Math.cos(2 * Math.PI * i / total),
											y = 2 * height * Math.sin(2 * Math.PI * i / total);

										return "translate("+ x +","+ y +")";
									});
							});

						// remove old data
						outside.exit().transition()
							.delay(20000).remove();

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
								return "rotate("+ circleAngle(i) +", 0, 100)";
							});
					}
				});
			}	
		}
	}]);