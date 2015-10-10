app
	.directive('clicksChart', ['$window', function($window) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {

				var clicksChartEl = null,
					width = 0,
					height = 0,
					pad = 0,
					svg = null,
					minDate = null,
					maxDate = null,
					axisScale = null,
					xAxis = null,
					xAxisGroup = null;

				var init = function() {
					
					d3.select("#" + elm[0].id + " svg").remove(); // remove existing svg

					clicksChartEl = elm[0],
					width = clicksChartEl.offsetWidth,
					height = clicksChartEl.offsetHeight,
					pad = 30,

					// create svg element as container
					svg = d3.select("#" + clicksChartEl.id).append("svg")
											.attr("width", width - 80 + pad * 2)
											.attr("height", height + 10 + pad * 2),

					// minimum and maximum dates for use in scaling time
					minDate = moment().startOf('week'),
					maxDate = moment(minDate).add(scope.maxDays - 1, 'day'),

					// create scale to use for axis
					axisScale = d3.time.scale()
						.domain([minDate, maxDate])
						.range([0, width - 40]);
				};

				var drawAxis = function() {

					d3.select("#" + elm[0].id + " svg .axis-date").remove(); // remove existing axis-date in svg

						// create every axis point
					xAxis = d3.svg.axis()
							.scale(axisScale)
							.ticks(d3.time.day, 1)
							.orient("bottom")
							.tickFormat(d3.time.format("%b %d")),

						// create group for axis and call all axis
					xAxisGroup = svg.append("g")
							.attr("class", "axis-date")
							.attr("transform", "translate(0, "+(height+10)+")")
							.call(xAxis);

					orientAxisText();
				};

				var moveAxis = function() {
					svg.select(".axis-date")
						.attr("transform", "translate(0, "+(height+10)+")")
						.transition()
						.duration(1000)
						.ease("linear")
						.call(xAxis);

					orientAxisText();
				};

				var orientAxisText = function() {
					// @link: http://bl.ocks.org/phoebebright/3059392
					// change axis text display
					svg.selectAll(".axis-date text")  // select all the text elements for the axis-date
						.attr("transform", function(d) {
							return "translate(" + this.getBBox().height*-0.3 + "," + (this.getBBox().height + 15) + ")rotate(-90)";
						});
				}

				var drawChart = function(val) { // called on page first load and on window resize

					d3.select("#" + elm[0].id + " svg .rect-group").remove(); // remove existing rect-group in svg
					
					var left = clicksChartEl.offsetLeft,
						top = clicksChartEl.offsetTop - 100,

						// create scale for data count (how tall)
						y = d3.scale.linear()
									.domain([0, d3.max(val, function(d) {
										return d.$value;
									})])
									.range([0, height]),

						// create scale for data dates (how wide)
						x = d3.scale.linear()
								.domain([0, val.length])
								.range([height, 0]),


						// create group to use for bars
						rectGroup = svg.append("g")
										.attr("class", "rect-group")
										.attr("transform", "translate(0, 10)");

						// @link: http://alignedleft.com/tutorials/d3/making-a-bar-chart
						// create every single bar
						rectGroup.selectAll("rect")
							.data(val, function(d) {
								return d.$value + d.$id
							})
							.enter()
							.append("rect")
							.transition().duration(300).ease("quad")
							.attr("x", function(d) { // placement of bar horizontally
								return axisScale(new Date(d.$id));
							})
							.attr("y", function(d) { // stick bar to x-axis
								return height - (y(d.$value) + 3);
							})
							.attr("width", 25) // width of individual bars
							.attr("height", function(d) { // height of individual bars inside chart
								return y(d.$value);
							});

						// append text to rect-group
						rectGroup.selectAll("text")
							.data(val, function(d) {
								return d.$value + d.$id;
							})
							.enter()
							.append("text")
							.text(function(d) {
								return d.$value;
							})
							.attr("x", function(d) { // placement of bar horizontally
								return axisScale(new Date(d.$id)) + 12.5; // half of width: 25
							})
							.attr("y", function(d) { // stick bar to x-axis
								return (d.$value === 1) ? height - 6 : height - (y(d.$value) - 12);
							})
							.attr("class", "bar-label");
				};

				// bind draw action on screen resize then call angular digest
				angular.element($window).bind('resize', function() {
					init();
					scope.$apply(drawAxis());

					if(scope.clickArray && !!scope.clickArray.length) {
						scope.$apply(drawChart(scope.clickArray));
					}
				});

				scope.$watch('clickArray', function() {				
					if(scope.clickArray && !!scope.clickArray.length) { // is not undefined and length greater than 0
						// initial render
						drawChart(scope.clickArray);
					}
				}, true);

				scope.$watch('currentWeek', function(val) {
					if(val === 0) {

						// initialize variable values;
						init();

						// draw the axis on screen load
						drawAxis();
					} else {
						moveAxis();
					}

					drawChart(scope.clickArray);
				})

				scope.goNext = function() {

					if(scope.currentWeek < 0) {

						scope.currentWeek += 1;

						minDate = moment(maxDate).add(1, 'day').startOf('week');
						maxDate = moment(minDate).add(scope.maxDays - 1, 'day');

						axisScale.domain([minDate, maxDate]);
					}
				}

				scope.goPrev = function() {

					scope.currentWeek -=1;

					minDate = moment(maxDate).subtract(scope.maxDays, 'day').startOf('week');
					maxDate = moment(minDate).add(scope.maxDays - 1, 'day');

					axisScale.domain([minDate, maxDate]);
				}
			}
		}
	}]);
