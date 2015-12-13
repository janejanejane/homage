(function() {
    angular
        .module( 'homage' )
        .factory( 'XPFactory', XPFactory );

    function XPFactory() {
        'use strict';

        var XPFactory = {
                getLevelOffset: function() {
                    return 5;
                },
                getRequiredClicks: function( currentLevel ) {
                    // total clicks required to level up
                    return Math.floor( Math.pow( this.getLevelOffset(), currentLevel ) );
                },
                getCurrentLevel: function( totalClicks ) {
                    // natural log of the total clicks divide by natural log of the offset specified
                    return Math.floor( Math.log( totalClicks ) / Math.log( this.getLevelOffset() ) );
                }
            };

        return XPFactory;
    }
})();
