(function() {
    angular
      .module( 'homage' )
      .factory( 'AvatarFactory', AvatarFactory );

    AvatarFactory.$inject = [ '$http' ];

    function AvatarFactory( $http ) {
      'use strict';

      var AvatarFactory = {
          getAvatarNames: function() {
              return $http.get( 'data/avatars.data.json' );
          }
      };

      return AvatarFactory;
  }
})();
