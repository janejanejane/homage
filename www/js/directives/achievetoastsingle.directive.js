(function() {
    angular
        .module( 'homage' )
        .directive( 'achieveToastSingle', AchieveToastSingle );

    AchieveToastSingle.$inject = [ '$timeout' ];

    function AchieveToastSingle( $timeout ) {
          'use strict';

          return {
              restrict: 'E',
              replace: true,
              scope: {
                  toastEntry: '='
              },
              link: function( scope, elm ) {
                  // set the timeout on toast visibility
                  $timeout(function() {
                      elm.removeClass( 'add-toast' );
                      elm.addClass( 'remove-toast' );
                  }, 3000 );
              },
              template:
                  '<div class="achievement-toast">' +
                      '<span>{{toastEntry.description}}</span>' +
                  '</div>'
          };
    }
})();
