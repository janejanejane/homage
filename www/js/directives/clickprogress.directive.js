(function() {
    angular
        .module( 'homage' )
        .directive( 'clickProgress', ClickProgress );

    ClickProgress.$inject = [ '$window' ];

    function ClickProgress( $window ) {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                totalClicks: '=',
                currentLevel: '='
            },
            replace: true,
            link: function( scope, elm ) {
                var width = elm[ 0 ].offsetWidth,
                    height = 250,
                    twoPi = 2 * Math.PI,

                    svg = d3.select( elm[ 0 ] )
                        .append( 'svg' )
                        .attr( 'class', 'progress-level' ),

                    group = svg.append( 'g' )
                        .attr( 'transform', 'translate(' + (width / 2) + ', ' + (height / 2) + ')' ),

                    arc = d3.svg.arc()
                        .startAngle( 0 )
                        .innerRadius( 0 )
                        .outerRadius( 120 ),

                    // progress background
                    base = group.append( 'g' )
                        .attr( 'id', 'progress-bar' ),

                    progressCircle = base.append( 'path' )
                        .datum({ endAngle: twoPi })
                        .attr( 'd', arc )
                        .attr( 'id', 'progress-bg' ),

                    // draw the progress
                    progress = base.append( 'path' )
                        .datum({ endAngle: 0 })
                        .attr( 'fill', '#990100' )
                        .attr( 'd', arc )
                        .attr( 'id', 'progress-color' ),

                    // angle of progress
                    x = d3.scale.linear();

                function drawProgress( val ) {
                    width = 300;
                    scope.currentLevel = Math.floor( Math.log( val ) / Math.LN2 );

                    // update domain of values for progress angle
                    x.domain([ scope.currentLevel, scope.currentLevel + 1 ])
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
                            var interpolate = d3.interpolate( d.endAngle, x( Math.log( val ) / Math.LN2 ) );
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
                    } else {
                        scope.currentLevel = 0;
                        d3.select( '#progress-color' ).style( 'display', 'none' );
                        d3.select( '#progress-bg' ).style( 'display', 'none' );
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
