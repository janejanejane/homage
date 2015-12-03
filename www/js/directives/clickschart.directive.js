(function() {
    angular
        .module( 'homage' )
        .directive( 'clicksChart', ClicksChart );

    ClicksChart.$inject = [ '$window' ];

    function ClicksChart( $window ) {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            scope: {
                choice: '=',
                maxDays: '=',
                clickArray: '=',
                totalClicks: '=',
                updateArray: '&'
            },
            link: function( scope, elm ) {

                var width = elm[ 0 ].offsetWidth,
                    height = elm[ 0 ].offsetHeight,

                    // used in display details for circle click
                    format = d3.time.format( '%b %d, %Y' ),

                    // used in x, y domains
                    minDate,
                    maxDate,

                    // axes properties
                    x = d3.time.scale(),
                    y = d3.scale.linear(),
                    xAxis = d3.svg.axis()
                        .orient( 'bottom' )
                        .ticks( d3.time.day, 1 )
                        .tickFormat( d3.time.format( '%b %d' ) ),
                    yAxis = d3.svg.axis()
                        .orient( 'left' )
                        .ticks( 5 ),

                    // line chart initialization
                    line = d3.svg.line(),

                    // container of the chart
                    svg = d3.select( elm[ 0 ] ).append( 'svg' ).attr( 'id', 'chart-svg' ),
                    group = svg.append( 'g' );

                    // display total clicks on chart
                    group.append( 'text' )
                        .attr( 'dy', '-0.5em' )
                        .style( 'text-anchor', 'end' )
                        .attr( 'id', 'total-clicks-label' );

                    // axes of the chart
                var xGroup = group.append( 'g' ).attr( 'class', 'x axis' ),
                    yGroup = group.append( 'g' ).attr( 'class', 'y axis' ),

                    // the line of the chart
                    clicksLine = group.append( 'path' ).attr( 'class', 'line' ),

                    // the nodes of the line chart
                    circles = group.append( 'g' ).attr( 'class', 'circle-group' ),

                    // allowance for clicking the node
                    hovers = group.append( 'g' ).attr( 'class', 'circle-hover' ),

                    // group for the text display of a circle
                    tooltip = group.append( 'g' ).style( 'display', 'none' ),

                    // container for the text display
                    tooltipRect = tooltip.append( 'rect' )
                        .attr( 'height', 50 )
                        .attr( 'width', 150 ),

                    // text element containing details of the click circle
                    text = tooltip.append( 'text' )
                        .style( 'fill', 'red' )
                        .attr( 'class', 'tooltip-text' ),

                    disablePreviousClick = function() {
                        // hide the circle click details
                        d3.selectAll( '.hover-circle' )
                            .style( 'opacity', 0 )
                            .transition()
                            .duration( 300 )
                            .ease( 'linear' );

                        tooltip.style( 'display', 'none' );
                    },

                    displayDetails = function( item ) {
                      // hide the previous circle click then display current circle click details
                      d3.select( item )
                          .style( 'opacity', 1 )
                          .transition()
                          .each( 'end', function() {
                              disablePreviousClick();
                          })
                          .duration( 1000 )
                          .ease( 'linear' );

                      tooltip.style( 'display', null );
                  };

                function init() {
                    // for resizing, update width
                    width = elm[ 0 ].offsetWidth;
                    height = $window.innerHeight - 230;

                    // default data minDate: 7 days before current date (maxDate)
                    minDate = moment().subtract( scope.maxDays, 'day' );
                    maxDate = moment();

                    // select existing svg
                    svg = d3.select( elm[ 0 ] ).select( 'svg' )
                        .attr( 'width', width - 20 )
                         // ensure that height is always positive
                        .attr( 'height', Math.abs( height + 20 ) )
                        .style( 'display', null );

                    // update values of the chart axes
                    x.range([ 0, width - 20 ]);
                    y.range([ height, 0 ]);
                    xAxis.scale( x );
                    yAxis.scale( y );

                    // set the coordinates for the line chart
                    line.x(function( d ) {
                        return x( new Date( d.$id ) );
                    }).y(function( d ) {
                        return y( d.$value );
                    });

                }

                function drawChart( val ) {
                    var circlesData,
                        hoversData;

                    if ( scope.choice === 'month' ) {
                        // month data minDate: 30 days before tomorrow's date (maxDate)
                        minDate = moment().subtract( 32, 'day' );
                        maxDate = moment().add( 1, 'day' );
                        xAxis.ticks( d3.time.day, 3 );
                    } else {
                        xAxis.ticks( d3.time.day, 1 );
                    }

                    // length of the x-axis
                    x.domain([ minDate, maxDate ]);

                    // length of y-axis: default max is 4
                    y.domain([ 0, d3.max( val, function( d ) {
                        return (( d.$value < 5 ) ? 4 : d.$value);
                    }) ]);

                    // move the chart group and decrease scale to fit svg container
                    group.attr( 'transform', 'translate(25,10)scale(0.9)' );

                    // move the x-axis position
                    xGroup.attr( 'transform', 'translate(0,' + height +  ')' )
                        .call( xAxis );

                    // @link: http://bl.ocks.org/phoebebright/3059392
                    // change axis text display
                    group.selectAll( '.x.axis text' )
                        // select all the text elements for the axis-date
                        .attr( 'transform', function() {
                            return 'translate(' + this.getBBox().height * -0.9 + ',' + (this.getBBox().height) + ')rotate(-45)';
                        });

                    // attach the values
                    yGroup.call( yAxis );

                    // append 'Count' text of y-axis once
                    if ( d3.select( '#count-label' ).empty() ) {
                        yGroup.append( 'text' )
                            .attr( 'transform', 'rotate(-90)' )
                            .attr( 'y', 6 )
                            .attr( 'dy', '.71em' )
                            .style( 'text-anchor', 'end' )
                            .text( 'Count' )
                            .attr( 'id', 'count-label' );
                    }

                    // append 'Total Clicks' text to chart
                    d3.select( '#total-clicks-label' )
                        .attr( 'dx', width - 20 )
                        .text( 'Total Clicks:' + scope.totalClicks );

                    // update line of chart
                    clicksLine.datum( val )
                        .attr( 'd', line );

                    circlesData = circles.selectAll( 'circle' )
                        .data( val, function( d ) {
                            return d.$value + d.$id;
                        });

                    // add data from current collection
                    circlesData.enter().append( 'circle' )
                        .attr( 'r', function() {
                            return 2;
                        })
                        .attr( 'class', 'click-circle' );

                    // update position
                    circlesData.attr( 'cy', function( d ) {
                        return y( d.$value );
                    }).attr( 'cx', function( d ) {
                        return x( new Date( d.$id ) );
                    });

                    // remove data not in current collection
                    circlesData.exit().remove();

                    hoversData = hovers.selectAll( 'circle' )
                        .data( val, function( d ) {
                            return d.$value + d.$id;
                        });

                    // add data from current collection
                    hoversData.enter().append( 'circle' )
                        .attr( 'r', function() {
                            return 10;
                        })
                        .attr( 'class', 'hover-circle' )
                        .on( 'click', function( d ) {
                            var maxVal = d3.max( val, function( v ) {
                                    return v.$value;
                                }),
                                // get second largest value
                                secondMax = d3.max( val.map(function( v ) {
                                        // do not include maxVal in new array
                                        return (( v.$value < maxVal ) ? v : null);
                                    }),
                                    function( v ) {
                                        return ((v) ? v.$value : null);
                                    }
                                ),
                                cpos = x( new Date( d.$id ) ),
                                ypos = ( d.$value === 0 || d.$value < secondMax ) ? (-45) : 35,
                                // if circle position is near left side, add 10 (shift to right)
                                // if difference of svg width and circle position is less 100, minus 100 (shift to left)
                                xpos = ( cpos < 50 ) ? cpos + 10
                                                     : ( ( +svg.attr( 'width' ) - cpos ) < 100) ? ( cpos - 100 )
                                                                                                : ( cpos - 50 );

                            displayDetails( this );

                            tooltipRect.attr( 'x', xpos - 10 )
                                .attr( 'y', ( y( d.$value ) + ypos ) - 20 )
                                .style( 'fill', 'black' )
                                .attr( 'stroke', 'black' );

                            return text.attr( 'transform', 'translate(' + ( xpos ) + ',' + ( y( d.$value ) + ypos ) + ')' )
                                .text( 'Date: ' + format( new Date( d.$id ) ) )
                                .append( 'tspan' )
                                .attr( 'x', 0 )
                                .attr( 'y', 20 )
                                .text( 'Count: ' + d.$value );
                        });

                    // update position
                    hoversData.attr( 'cy', function( d ) {
                        return y( d.$value );
                    })
                        .attr( 'cx', function( d ) {
                            return x( new Date( d.$id ) );
                        });

                    // remove data not in current collection
                    hoversData.exit().remove();
                }

                scope.$watchCollection( 'clickArray', function( val ) {
                    // is not undefined and length greater than 0
                    if ( val && !!val.length ) {
                        // initialize variables
                        init();
                        // render
                        drawChart( val );
                    } else {
                        // hide svg
                        d3.select( '#chart-svg' ).style( 'display', 'none' );
                    }
                });


                scope.$watch( 'clickArray[clickArray.length-1].$value', function( val ) {
                    if ( val ) {
                        init();
                        // update line values and circle places
                        drawChart( scope.clickArray );
                    }
                });

                scope.$watch( 'choice', function( val ) {
                    scope.updateArray({ value: val });

                    init();
                    // update line values and circle places
                    drawChart( scope.clickArray );
                });

                // bind draw action on screen resize then call angular digest
                angular.element( $window ).bind( 'resize', function() {
                    if ( scope.clickArray && !!scope.clickArray.length ) {
                        init();
                        scope.$apply( drawChart( scope.clickArray ) );
                    }
                });
            }
        };
    }
})();
