(function() {
    angular
        .module( 'homage' )
        .factory( 'XPFactory', XPFactory );

    function XPFactory() {
        'use strict';

        var XPFactory = {
                getLevelOffset: function() {
                    return 3;
                },
                getRequiredClicks: function( currentLevel ) {
                    // total clicks required to level up
                    return Math.floor( Math.pow( 2, currentLevel ) ) + this.getLevelOffset();
                },
                getCurrentLevel: function( totalClicks ) {
                    // natural log of the total clicks divide by natural log of 2
                    return Math.floor( Math.log( totalClicks - this.getLevelOffset() ) / Math.LN2 );
                }
            };

        return XPFactory;
    }
})();
