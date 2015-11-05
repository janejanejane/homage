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
						circles = [];

					for (var i = 0; i < 10; i++) {
						circles.push(Math.random() * 100);
					};

					var svg = d3.select(elm[0])
						.append("svg")
						.attr("width", width - 20)
						.attr("height", height - 90)
						.append("g")
						.attr("transform", "translate(0, 20)");

					svg.selectAll("circle")
						.data(circles)
						.enter().append("circle")
						.style("stroke", "gray")
						.style("fill", "blue")
						.attr("r", 20)
						.attr("cx", function(d) {
							console.log("cx", d);
							return (width / 2);
						})
						.attr("cy", function(d) {
							console.log("cy", d);
							return (height / 3);
						})
						.transition()
						.duration(1000)
						.delay(function(d,i) {
							return i * 500;
						})
						.attr("cx", function(d) {
							console.log("cx", d);
							if(Math.round(d) % 2 === 0) {
								return (width / 2) - d;
							} else {
								return (width / 2) + d;
							}
						})
						.attr("cy", function(d) {
							console.log("cy", d);
							return (height / 3) - d;
						})
						.transition()
						.duration(1000)
						.attr("cx", function(d) {
							console.log("cx", d);
							if(Math.round(d) % 2 === 0) {
								return (width / 2) - (d * 2);
							} else {
								return (width / 2) + (d * 2);
							}
						})
						.attr("cy", function(d) {
							console.log("cy", d);
							return height;
						});

				});
			}	
		}
	}]);