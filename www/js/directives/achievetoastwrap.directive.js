(function() {
    angular
        .module( 'homage' )
        .directive( 'achieveToastWrap', [ AchieveToastWrap ]);

    function AchieveToastWrap() {
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
                      '<div ng-repeat="i in recentAchievements track by $index">' +
                          '<achieve-toast-single toast-entry="i">' +
                          '</achieve-toast-single>' +
                      '</div>' +
                  '</div>'
          };
    }
})();
