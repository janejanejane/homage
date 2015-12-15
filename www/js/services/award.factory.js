(function() {
    angular
        .module( 'homage' )
        .factory( 'AwardFactory', AwardFactory );

    AwardFactory.$inject = [ '$http' ];

    function AwardFactory( $http ) {
        'use strict';

        var AwardFactory = {
            getAwardsFileNames: function() {
                return $http.get( 'data/awards.data.json' );
            }
        };

        return AwardFactory;
    }
})();
