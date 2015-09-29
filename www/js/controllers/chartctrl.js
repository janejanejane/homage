app
	.controller('ChartCtrl', ['$scope', '$window', function($scope, $window) {
		var width = $window.innerWidth - 20,
			height = $window.innerHeight,
			// chart = d3.select("#chart-div").append("svg")
			// 			.attr("width", width)
			// 			.attr("height", height);

			data = [4, 8, 15, 16, 23, 42];
			d3.select("#chart-div")
				.selectAll("div")
					.data(data)
				.enter().append("div")
					.style("height", function(d) { return d * 10 + "px"; })
					.text(function(d) { return d; });

		console.log('width', width, 'height', height);
	}]);