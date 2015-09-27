app
	.controller('ChartCtrl', ['$scope', '$window', function($scope, $window) {
		var width = $window.innerWidth - 20,
			height = $window.innerHeight,
			chart = d3.select("#chart-div").append("svg")
						.attr("width", width)
						.attr("height", height);

		console.log('width', width, 'height', height);
	}]);