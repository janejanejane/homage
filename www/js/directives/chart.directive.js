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
						var width = $window.innerWidth - 20,
							height = $window.innerHeight,
							scale = d3.scale.linear()
										.domain([0, d3.max(val, function(d) {
											return d.count;
										})])
										.range([0, 300]),
							x = d3.scale.linear()
									.domain([0, val.length])
									.range([0, 300]),
							data = val,
							chart = d3.select("#" + elm[0].id + ' div');


							axis = d3.svg.axis()
									.scale(x)
									.orient("bottom");

							// reference all divs
							div = chart.selectAll("div")
									.data(data, function(d) {
										console.log('d', d);
										return d.count + d.date;
									});

							// remove old
							div.exit()
								.remove();

							// add new
							div.enter()
								.append("div");

							// update existing
							div.attr("id", function(d) {
									return d.date.replace(/[-]/g, '');
								})
								.style("height", function(d) { 
									return scale(d.count) + 10 + "px"; 
								})
								.text(function(d) { 
									return d.count; 
								});

							// chart.append("g")
							// 	.attr("class", "x axis")
							// 	.attr("transform", "translate(0, 300)")
							// 	.call(axis);

						var svgContainer = d3.select("#" + elm[0].id).append("svg"),
							minDate = new Date(val[0]['date']),
							maxDate = new Date(val[val.length-1]['date']),

						//Create the Scale we will use for the Axis
							axisScale = d3.time.scale()
								.domain([minDate, maxDate])
								.range([0, 300]),

						//Create the Axis
							xAxis = d3.svg.axis()
								.scale(axisScale)
								.orient("bottom")
								.tickPadding(8)
								.tickFormat(d3.time.format("%b %d")),

						//Create an SVG group Element for the Axis elements and call the xAxis function
							xAxisGroup = svgContainer.append("g")
								.attr("class", "axis-date")
								.call(xAxis);
							
							// http://bl.ocks.org/phoebebright/3059392
							svgContainer.selectAll(".axis-date text")  // select all the text elements for the axis-date
								.attr("transform", function(d) {
									return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
								});

						console.log(minDate, maxDate);

						console.log('width', width, 'height', height);
					}
				}, true);
			}
		}
	}]);