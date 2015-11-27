(function() {
    angular
        .module( 'homage' )
        .factory( 'TimerFactory', TimerFactory );

    TimerFactory.$inject = [ '$interval' ];

    function TimerFactory( $interval ) {
        'use strict';

        var timerObj = null,
            TimerFactory = {
            timerObj,
            startTime: function( fn ) {
                // do function in 10 seconds
                timerObj = $interval( fn, 10000 );
            },
            stopTime: function() {
                console.log( timerObj.length );
                if ( timerObj.length ) {
                    $interval.cancel( timerObj );
                }
            }
        };

        return TimerFactory;
    }
})();
