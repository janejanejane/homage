(function() {
    angular
        .module( 'homage' )
        .directive( 'achievementList', [ AchievementList ]);

    function AchievementList() {
          'use strict';

          return {
              restrict: 'E',
              replace: true,
              scope: {
                  achievementsDeclared: '=',
                  achievementArray: '='
              },
              link: function( scope ) {
                  var record = null;

                  scope.$watchCollection( 'achievementArray', function( val ) {
                      // used in for loops
                      var i = 0,
                          j = 0;

                      scope.list = [];
                      for ( ; i < scope.achievementsDeclared.length; i++ ) {
                          // copy details
                          record = scope.achievementsDeclared[ i ];

                          // set to false on first load
                          record.unlocked = false;

                          for ( ; j < val.length; j++ ) {
                              if ( scope.achievementsDeclared[ i ].name === val[ j ].name ) {
                                  record.unlocked = true;
                              }
                          }

                          // add to new array
                          scope.list.push( record );

                          // sort on last item
                          if ( i === scope.achievementsDeclared.length - 1 ) {
                              scope.list.sort(function( a, b ) {
                                  // if difference of (a - b) is greater than 0, 'a' has a larger index
                                  return ( getNumber( a.name ) - getNumber( b.name ));
                              });

                              function getNumber( str ) {
                                  // get the number part only
                                  return +str.split( '_' )[ 0 ];
                              }
                          }
                      }
                  });

                  scope.$watchCollection( 'achievementsDeclared', function( newVal, oldVal ) {
                      if ( newVal !== oldVal ) {
                          if ( scope.list.length === 0 ) {
                               // display list of locked achievements
                              scope.list = newVal;
                          }
                      }
                  });
              },
              template:
                  '<div class="list">' +
                      '<div ng-repeat="i in list track by $index">' +
                          '<div class="achievement-list">' +
                              '<img class="item-image" ' +
                                    'ng-src="{{!i.unlocked && \'img/fff.png\' || \'img/100x100.jpg\'}}">' +
                              '<h3 class="achievement-desc">' +
                                  '{{i.unlocked && i.description || \'???\'}}' +
                              '</h3>' +
                          '</div>' +
                      '</div>' +
                  '</div>'
          };
      }
})();
