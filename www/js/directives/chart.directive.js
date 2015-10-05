app
	.directive('clicksChart', ['$window', function($window) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {
				console.log('scope', scope.savedClicks);
				scope.$watch('savedClicks', function(val) {
					console.log('val', val, 'elm.id', elm[0].id);

					if(!!val.length) { // length greater than 0
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
											return d.count;
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
							minDate = new Date(val[0]['date']),
							maxDate = new Date(),

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
								.data(data, function(d) {
									return d.count + d.date
								})
								.enter()
								.append("rect")
								.attr("x", function(d) { // placement of bar horizontally
									return axisScale(new Date(d.date));
								})
								.attr("y", function(d) { // stick bar to x-axis
									return height - (y(d.count));
								})
								.attr("width", 25) // width of individual bars
								.attr("height", function(d) { // height of individual bars inside chart
									return y(d.count);
								});

							// append text to rect-group
							rectGroup.selectAll("text")
								.data(data)
								.enter()
								.append("text")
								.text(function(d) {
									return d.count;
								})
								.attr("x", function(d) { // placement of bar horizontally
									return axisScale(new Date(d.date)) + 12.5; // half of width: 25
								})
								.attr("y", function(d) { // stick bar to x-axis
									return height - (y(d.count) - 12);
								})
								.attr("class", "bar-label");

							// @link: http://bl.ocks.org/phoebebright/3059392
							// change axis text display
							svg.selectAll(".axis-date text")  // select all the text elements for the axis-date
								.attr("transform", function(d) {
									return "translate(" + this.getBBox().height*-0.1 + "," + (this.getBBox().height+ 10) + ")rotate(-90)";
								});

					}
				}, true);
			}
		}
	}]);