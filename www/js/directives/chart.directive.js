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
						// chart = d3.select("#chart-div").append("svg")
						// 			.attr("width", width)
						// 			.attr("height", height);

						// data = [4, 8, 15, 16, 23, 42];

							data = val,
							chart = d3.select("#" + elm[0].id);

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
									return d.count + 10 + "px"; 
								})
								.text(function(d) { 
									return d.count; 
								});

						console.log('width', width, 'height', height);
					}
				}, true);
			}
		}
	}]);