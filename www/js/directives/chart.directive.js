app
	.directive('clicksChart', ['$window', function($window) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, elm, attrs) {
				console.log('scope', scope.savedClicks);
				scope.$watch('savedClicks', function(val) {
					console.log('val', val, 'elm.id', elm[0].id);

					if(val) {
						var width = $window.innerWidth - 20,
							height = $window.innerHeight,
							scale = d3.scale.linear()
										.domain([0, d3.max(val, function(d) {
											return d.count;
										})])
										.range([0, 300]),
							x = d3.scale.ordinal()
									.rangeRoundBands([0, val.length], .1)
							data = val,
							chart = d3.select("#" + elm[0].id + ' div');


							axis = d3.svg.axis()
									.scale(scale)
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

							chart.append("g")
								.attr("class", "x axis")
								.attr("transform", "translate(0, 300)")
								.call(axis);

						console.log('width', width, 'height', height);
					}
				}, true);
			}
		}
	}]);