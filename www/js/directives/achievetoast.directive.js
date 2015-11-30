(function() {
    angular
        .module( 'homage' )
        .directive( 'achieveToast', [ AchieveToast ]);

    function AchieveToast() {
          'use strict';

          return {
              restrict: 'E',
              replace: true,
              scope: {
                  achievementArray: '='
              },
              link: function( scope, elm ) {
                  scope.recentAchievements = [];

                  scope.$watchCollection( 'achievementArray', function( val ) {
                      console.log( 'val', val );
                      scope.recentAchievements = _.filter( val, function( record ) {
                          return record.recent;
                      });
                  });
              },
              template:
                  '<div>' +
                      '<div class="achievement-toast" ng-repeat="i in recentAchievements track by $index">' +
                          '<span>{{i.description}}</span>' +
                      '</div>' +
                  '</div>'
          };
    }
})();
