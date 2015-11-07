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
						total = 15,
						ocRadius = 5;

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
						.attr("r", 1)
						.attr("cx", function() {
							return ((width - 20) / 2);
						})
						.attr("cy", function() {
							return (height / 3);
						});

					var outside = svg.selectAll(".blast")
						.data(circles)
						.enter().append("g")
						.attr("class", "blast")
						.attr("transform", "translate("+ ((width - 20) / 2) +", "+ (height / 3) +")");

					var circleAngle = d3.scale.linear().range([0,360]).domain([0,ocRadius]);

					outside.transition()
						.duration(1500)
						.delay(function(d, i) {
							return i * 20;
						})
						.each(function() {
							var self = d3.select(this);
							self.transition()
								.attr("transform", function(d) {
									return "translate("+ width * (Math.random() * 2) +","+ (height + 100) * (Math.random() * 2)+")"
								});								
						});

					outside.append("circle")
						.style("stroke", "red")
						.style("fill", "black")
						.attr("r", ocRadius)
						.attr("cx", ocRadius)
						.attr("cy", function(d, i) {
							return i;
						})
						.attr("transform", function(d, i) {
							return "rotate("+ circleAngle(i) +", 0, 0)";
						// })
						// .transition()
						// .duration(1500)
						// .delay(function(d, i) {
						// 	return i * 20;
						// })
						// .each(function() {
						// 	var self = d3.select(this);
						// 	self.transition()
						// 		.attr("cx", width * (Math.random() * 2))
						// 		.attr("cy", (height + 100) * (Math.random() * 5));								
						});
				});
			}	
		}
	}]);