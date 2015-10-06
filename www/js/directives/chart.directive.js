app
	.directive('clicksChart', ['$window', function($window) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {
				console.log('scope', scope.savedClicks);

				var drawChart = function(val) { // called on page first load and on window resize

					console.log('here is val>>', val);

					d3.select("#" + elm[0].id + " svg").remove(); // remove existing svg

					var clicksChartEl = elm[0], // this container
						width = clicksChartEl.offsetWidth - 40,
						height = clicksChartEl.offsetHeight,
						pad = 30,
						left = clicksChartEl.offsetLeft,
						top = clicksChartEl.offsetTop - 100,

						// create scale for data count (how tall)
						y = d3.scale.linear()
									.domain([0, d3.max(val, function(d) {
										console.log('scale.linear', d.$value);
										return d.$value;
									})])
									.range([0, height]),

						// create scale for data dates (how wide)
						x = d3.scale.linear()
								.domain([0, val.length])
								.range([height, 0]),

						// create svg element as container
						svg = d3.select("#" + clicksChartEl.id).append("svg")
											.attr("width", width + pad * 2)
											.attr("height", height + pad * 2),

						// minimum and maximum dates for use in scaling time
						minDate = new Date(val[0].$id),
						maxDate = moment().add(scope.maxDays, 'day'),

						// create scale to use for axis
						axisScale = d3.time.scale()
							.domain([minDate, maxDate])
							.range([0,  width]),

						// create every axis point
						xAxis = d3.svg.axis()
							.scale(axisScale)
							.orient("bottom")
							.tickFormat(d3.time.format("%b %d")),

						// create group for axis and call all axis
						xAxisGroup = svg.append("g")
							.attr("class", "axis-date")
							.attr("transform", "translate(0, "+height+")")
							.call(xAxis),

						// create group to use for bars
						rectGroup = svg.append("g")
										.attr("class", "rect-group");

						// @link: http://alignedleft.com/tutorials/d3/making-a-bar-chart
						// create every single bar
						rectGroup.selectAll("rect")
							.data(val, function(d) {
								console.log('rect',d);
								return d.$value + d.$id
							})
							.enter()
							.append("rect")
							.attr("x", function(d) { // placement of bar horizontally
								return axisScale(new Date(d.$id));
							})
							.attr("y", function(d) { // stick bar to x-axis
								return height - (y(d.$value));
							})
							.attr("width", 25) // width of individual bars
							.attr("height", function(d) { // height of individual bars inside chart
								console.log('height', d);
								return y(d.$value);
							});

						// append text to rect-group
						rectGroup.selectAll("text")
							.data(val)
							.enter()
							.append("text")
							.text(function(d) {
								return d.$value;
							})
							.attr("x", function(d) { // placement of bar horizontally
								return axisScale(new Date(d.$id)) + 12.5; // half of width: 25
							})
							.attr("y", function(d) { // stick bar to x-axis
								return height - (y(d.$value) - 12);
							})
							.attr("class", "bar-label");

						// @link: http://bl.ocks.org/phoebebright/3059392
						// change axis text display
						svg.selectAll(".axis-date text")  // select all the text elements for the axis-date
							.attr("transform", function(d) {
								return "translate(" + this.getBBox().height*-0.1 + "," + (this.getBBox().height+ 10) + ")rotate(-90)";
							});
				};

				scope.$watch('savedClicks', function() {					
					if(scope.clickArray && !!scope.clickArray.length) { // is not undefined and length greater than 0
						// initial render
						drawChart(scope.clickArray);
					
						// bind action (jQuery) then call angular digest
						angular.element($window).bind('resize', function() {
							scope.$apply(drawChart(scope.clickArray));
						});
					}
				}, true);
			}
		}
	}]);
