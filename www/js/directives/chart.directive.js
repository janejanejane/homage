app
	.directive('clicksChart', ['$window', function($window) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				choice: '=',
				maxDays: '=',
				clickArray: '=',
				updateArray: '&'
			},
			link: function(scope, elm, attrs) {

				var width,
					height,
					format,
					minDate,
					maxDate,
					x,
					y,
					xAxis,
					yAxis,
					line,
					svg;

				function init() {
					d3.select("#" + elm[0].id + " svg").remove();
					var width = elm[0].offsetWidth;
						height = elm[0].offsetHeight;

						format = d3.time.format("%b %d, %Y");

						minDate = moment().subtract(scope.maxDays, 'day');
						maxDate = moment();

						x = d3.time.scale()
								.range([0, width - 20]);

						y = d3.scale.linear()
								.range([height, 0]);

						xAxis = d3.svg.axis()
								.scale(x)
								.orient("bottom")
								.ticks(d3.time.day, 1)
								.tickFormat(d3.time.format("%b %d"));

						yAxis = d3.svg.axis()
								.scale(y)
								.orient("left")
								.ticks(5);

						line = d3.svg.line()
								.x(function(d) { 
									return x(new Date(d.$id)); 
								})
								.y(function(d) { 
									return y(d.$value);
								});

						svg = d3.select(elm[0]).append("svg")
									.attr("width", width - 20)
									.attr("height", height + 20);
				};

				function drawChart(val) {
					d3.select("#" + elm[0].id + " svg g").remove();

					if(scope.choice === 'month') {
						minDate = moment().subtract(30, 'day');
						maxDate = moment().add(1, 'day');
						xAxis.ticks(d3.time.day, 3);
					}

					x.domain([minDate, maxDate]);
					y.domain([0, d3.max(val, function(d) {
						return (d.$value < 5) ? 4 : d.$value;
					})]);

					var group = svg.append("g")
								.attr("transform", "translate(25,10)scale(0.9)");

					var tooltip = group.append("g")
									.style("display", "none");

					var text = tooltip.append("text")
									.style("fill", "red");

					group.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis);

					// @link: http://bl.ocks.org/phoebebright/3059392
					// change axis text display
					group.selectAll(".x.axis text")  // select all the text elements for the axis-date
						.attr("transform", function(d) {
							return "translate(" + this.getBBox().height*-0.9 + "," + (this.getBBox().height) + ")rotate(-45)";
						});

					group.append("g")
							.attr("class", "y axis")
							.call(yAxis)
						.append("text")
							.attr("transform", "rotate(-90)")
							.attr("y", 6)
							.attr("dy", ".71em")
							.style("text-anchor", "end")
							.text("Count");

					group.append("path")
							.datum(val)
							.attr("class", "line")
							.attr("d", line);

					var circles = group.append("g")
									.attr("class", "circle-group");

					var hovers = group.append("g")
									.attr("class", "circle-hover");

					var disablePreviousClick = function() {

						d3.selectAll(".hover-circle")
							.style("opacity", 0)
							.transition()
							.duration(300)
							.ease("linear");

						tooltip.style("display", "none");
					};

					var	displayDetails = function(item) {

						d3.select(item)
							.style("opacity", 1)
							.transition()
							.each("end", function() {
								disablePreviousClick();
							})
							.duration(1000)
							.ease("linear");

						tooltip.style("display", null);
					}

					circles.selectAll("circle")
						.data(val, function(d) {
							return d.$value + d.$id;
						})
						.enter().append("circle")
						.attr("cy", function(d) {
							return y(d.$value);
						})
						.attr("cx", function(d) {
							return x(new Date(d.$id));
						})
						.attr("r", function() {
							return 2;
						})
						.attr("class", "click-circle")

					hovers.selectAll("circle")
						.data(val, function(d) {
							return d.$value + d.$id;
						})
						.enter().append("circle")
						.attr("cy", function(d) {
							return y(d.$value);
						})
						.attr("cx", function(d) {
							return x(new Date(d.$id));
						})
						.attr("r", function() {
							return 10;
						})
						.attr("class", "hover-circle")
						.on("click", function(d){
							var maxVal = d3.max(val, function(v) {
									return v.$value;
								}),
								cpos = x(new Date(d.$id)),
								ypos = (d.$value < maxVal) ? (-40) : 30,
								// if circle position is near left side, add 10 (shift to right)
								// if difference of svg width and circle position is less 100, minus 100 (shift to left)
								xpos = (cpos < 50) ? cpos + 10 : ((+svg.attr("width") - cpos) < 100) ? (cpos - 100) : (cpos - 50);

							displayDetails(this);

							return text.attr("transform", "translate(" + (xpos) + "," + (y(d.$value) + ypos) + ")")									
									.text("Date: " + format(new Date(d.$id)))
									.append("tspan")
									.attr("x", 0)
									.attr("y", 20)
									.text("Count: " + d.$value);
						});
				}

				scope.$watchCollection('clickArray', function(val) {
					if(val && !!val.length) { // is not undefined and length greater than 0
						// initialize variables
						init();
						// render
						drawChart(val);
					}
				});

				scope.$watch('choice', function(val) {
					if(val === 'month') {
						scope.updateArray({start: moment().subtract(30, 'day'), end: moment()});
					} else {
						scope.updateArray();
					}
				}, true);

				// bind draw action on screen resize then call angular digest
				angular.element($window).bind('resize', function() {
					if(scope.clickArray && !!scope.clickArray.length) {
						init();
						scope.$apply(drawChart(scope.clickArray));
					}
				});
			}
		}
	}]);
