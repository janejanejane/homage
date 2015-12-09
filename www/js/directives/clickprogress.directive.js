(function() {
    angular
        .module( 'homage' )
        .directive( 'clickProgress', ClickProgress );

    ClickProgress.$inject = [ '$window', 'XPReqFactory' ];

    function ClickProgress( $window, XPReqFactory ) {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                totalClicks: '=',
                currentLevel: '=',
                clicksToLevelUp: '=',
                currentLevelClicks: '='
            },
            replace: true,
            link: function( scope, elm ) {
                var width = elm[ 0 ].offsetWidth;
                var height = 250;
                var twoPi = 2 * Math.PI;

                var svg = d3.select( elm[ 0 ] )
                        .append( 'svg' )
                        .attr( 'class', 'progress-level' );

                var group = svg.append( 'g' )
                        .attr( 'transform', 'translate(' + (width / 2) + ', ' + (height / 2) + ')' );

                var arc = d3.svg.arc()
                        .startAngle( 0 )
                        .innerRadius( 0 )
                        .outerRadius( 120 );

                    // progress background
                var base = group.append( 'g' )
                        .attr( 'id', 'progress-bar' );

                var progressCircle = base.append( 'path' )
                        .datum({ endAngle: twoPi })
                        .attr( 'd', arc )
                        .attr( 'id', 'progress-bg' );

                    // draw the progress
                var progress = base.append( 'path' )
                        .datum({ endAngle: 0 })
                        .attr( 'fill', '#990100' )
                        .attr( 'd', arc )
                        .attr( 'id', 'progress-color' );

                    // angle of progress
                var x = d3.scale.linear();

                function drawProgress( val ) {
                    width = 300;

                    // update domain of values for progress angle
                    x.domain([ scope.currentLevelClicks, scope.clicksToLevelUp ])
                        .range([ 0, twoPi ]);

                    // select existing svg
                    svg = d3.select( elm[ 0 ] )
                        .select( 'svg' )
                        .attr( 'width', width )
                        .attr( 'height', height );

                    // update group placement
                    group.attr( 'transform', 'translate(' + (width / 2) + ', ' + (height / 2) + ')' );

                    // add color to the circle background
                    progressCircle.attr( 'fill', '#333333' )
                        .style( 'display', null );

                    // change progress angle with tween
                    progress.transition()
                        .ease( 'elastic' )
                        .duration( 750 )
                        .attrTween( 'd', function( d ) {
                            var interpolate = d3.interpolate( d.endAngle, x( val ) );
                            return function( t ) {
                                // set for progress end arc
                                d.endAngle = interpolate( t );
                                // compute arc with given value
                                return arc( d );
                            };
                        })
                        .style( 'display', null );
                }

                scope.$watch( 'totalClicks', function( val ) {
                    if ( val ) {
                        drawProgress( val );
                        scope.currentLevel = Math.floor( Math.log( val ) / Math.LN2 );
                    } else {
                        scope.currentLevel = 0;
                        d3.select( '#progress-color' ).style( 'display', 'none' );
                        d3.select( '#progress-bg' ).style( 'display', 'none' );
                    }
                });

                scope.$watch( 'currentLevel', function( val ) {
                    scope.clicksToLevelUp = XPReqFactory.getRequiredClicks( val + 1 );
                    scope.currentLevelClicks = XPReqFactory.getRequiredClicks( val );

                    if ( scope.totalClicks ) {
                        drawProgress( scope.totalClicks );
                    }
                });

                // bind draw action on screen resize then call angular digest
                angular.element( $window ).bind( 'resize', function() {
                    if ( scope.totalClicks ) {
                        scope.$apply( drawProgress( scope.totalClicks ) );
                    }
                });
            }
        };
    }

})();
