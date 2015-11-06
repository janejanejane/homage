app
	.directive('starsDiv', [function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				currentLevel: '='
			},
			link: function(scope, elm, attrs) {
				console.log('scope.currentLevel', scope.currentLevel);
				scope.$watch('currentLevel', function(val) {
					console.log(val);

					d3.select("#" + elm[0].id + " svg").remove();

					var width = elm.parent().prop('offsetWidth'),
						height = elm.parent().prop('offsetHeight'),
						circles = [],
						total = 15;

					for (var i = 0; i < total; i++) {
						circles.push(Math.round(Math.random() * 100));
					};

					var svg = d3.select(elm[0])
						.append("svg")
						.attr("width", width - 20)
						.attr("height", height - 90)
						.append("g")
						.attr("transform", "translate(0, 20)");

					var center = svg.append("circle")
						.style("stroke", "gray")
						.style("fill", "blue")
						.attr("r", 5)
						.attr("cx", function() {
							return ((width - 20) / 2);
						})
						.attr("cy", function() {
							return (height / 3);
						});

					var outside = svg.append("g")
						.attr("transform", "translate("+ ((width - 20) / 2) +", "+ (height / 3) +")");

					var circleAngle = d3.scale.linear().range([0,360]).domain([0,total]);

					outside.selectAll("circle")
						.data(circles)
						.enter().append("circle")
						.style("stroke", "red")
						.style("fill", "black")
						.attr("r", 10)
						.attr("cx", 10)
						.attr("cy", function(d, i) {
							return i;
						})
						.attr("transform", function(d, i) {
							return "rotate("+ circleAngle(i) +", 0, 0)";
						// })
						// .transition()
						// .duration(1000)
						// .attr("transform", function(d, i) {
						// 	var x = (i > total/2) ? circleAngle(i) * 10 : (-circleAngle(i)) * 10;
						// 	var y = (i > total/2) ? circleAngle(i) * 10 : (-circleAngle(i)) * 10;
						// 	console.log("x", x, "y", y);
						// 	return "translate("+ x +", "+ y +")";
						});
				});
			}	
		}
	}]);