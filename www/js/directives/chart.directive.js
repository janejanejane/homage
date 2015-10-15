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

				function drawChart(val) {
					d3.select("#" + elm[0].id + " svg").remove();

					var width = elm[0].offsetWidth,
						height = elm[0].offsetHeight,

						format = d3.time.format("%m-%d-%Y").parse,


						minDate = moment().subtract(scope.maxDays, 'day'),
						maxDate = moment(),

						x = d3.time.scale()
								.range([0, width - 20]),

						y = d3.scale.linear()
								.range([height, 0])
								.domain([0, d3.max(val, function(d) {
									return d.$value;
								})]),

						xAxis = d3.svg.axis()
								.scale(x)
								.orient("bottom")
								.ticks(d3.time.day, 1)
								.tickFormat(d3.time.format("%b %d")),

						yAxis = d3.svg.axis()
								.scale(y)
								.orient("left")
								.ticks(5),

						line = d3.svg.line()
								.x(function(d) { 
									return x(new Date(d.$id)); 
								})
								.y(function(d) { 
									return y(d.$value); 
								}),

						svg = d3.select(elm[0]).append("svg")
									.attr("width", width - 20)
									.attr("height", height + 20)
								.append("g")
									.attr("transform", "translate(30,10)scale(0.9)");

						if(val.length > 7) {
							minDate = moment().subtract(30, 'day');
							maxDate = moment();
							xAxis.ticks(d3.time.day, 3);
						}

						x.domain([minDate, maxDate]);


						svg.append("g")
							.attr("class", "x axis")
							.attr("transform", "translate(0," + height + ")")
							.call(xAxis);

						// @link: http://bl.ocks.org/phoebebright/3059392
						// change axis text display
						svg.selectAll(".x.axis text")  // select all the text elements for the axis-date
							.attr("transform", function(d) {
								return "translate(" + this.getBBox().height*-0.3 + "," + (this.getBBox().height) + ")rotate(-45)";
							});

						svg.append("g")
								.attr("class", "y axis")
								.call(yAxis)
							.append("text")
								.attr("transform", "rotate(-90)")
								.attr("y", 6)
								.attr("dy", ".71em")
								.style("text-anchor", "end")
								.text("Count");

						svg.append("path")
								.datum(val)
								.attr("class", "line")
								.attr("d", line);

						svg.selectAll("circle")
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
							.attr("class", "click-circle");
				}


				scope.$watchCollection('clickArray', function(val) {
					if(val && !!val.length) { // is not undefined and length greater than 0
						// initial render
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
						scope.$apply(drawChart(scope.clickArray));
					}
				});
			}
		}
	}]);
