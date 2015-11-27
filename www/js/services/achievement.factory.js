(function() {

    angular
          .module( 'homage' )
          .factory( 'AchievementFactory', AchievementFactory );

    AchievementFactory.$inject =  [ '$firebaseArray', '$http', 'CONSTANTS' ];

    function AchievementFactory( $firebaseArray, $http, CONSTANTS ) {
          'use strict';

          var ref = new Firebase( CONSTANTS.FIREBASE_URL ),
              db = CONSTANTS.FIREBASE_DB,
              achievementsDeclared = [],

              AchievementFactory = {
                onUnlocked: function( uuid, data, unlockedAchievements, callback ) {

                    data.forEach(function( record ) {
                        if ( record.name && record.description && record.recent ) {
                            // do not include in database
                            delete record.recent;

                            unlockedAchievements.$add( record ).then(function( ref ) {
                                callback({
                                    id: ref.key()
                                });
                            });
                        }
                    });
                },
                getAllAchievements: function( uuid ) {
                    var obj = ref.child( db + '/' + uuid + '/achievements' );
                    return $firebaseArray( obj );
                },
                setAchievementData: function( arr, aName, callback ) {
                    // add when not in db
                    if ( _.pluck( arr, 'name' ).indexOf( aName ) === -1 ) {
                        callback( true );
                    }
                },
                getAchievementsDeclared: function() {
                    return $http.get( 'data/achievements.data.json' );
                },
                getAchievement: function( property, callback ) {
                    var arr = [];

                    achievementsDeclared.forEach(function( data, index, array ) {
                        // store only the streaks numbers
                        if ( data[ property ] ) {
                            arr.push( data );
                        }

                        // return on last item
                        if ( index === array.length - 1 ) {
                            return callback( arr );
                        }
                    });
                },
                setAchievement: function( property, value, unlockedAchievements, callback ) {
                    var self = this;

                    this.getAchievement( property, function( records ) {
                        var i = 0,
                            name = '',
                            desc = '';

                        for ( ; i < records.length; i++ ) {
                            if ( records[ i ][ property ] === value ) {
                                name = records[ i ].name,
                                desc = records[ i ].description;

                                // set achievement data
                                self.setAchievementData(
                                    unlockedAchievements,
                                    name,
                                    function( status ) {
                                        if ( status ) {
                                            callback({
                                                name: name,
                                                description: desc,
                                                recent: true
                                            });
                                        }
                                    }
                                );
                            }
                        };
                    });
                }
            };

          AchievementFactory.getAchievementsDeclared().then(function( response ) {
              achievementsDeclared = response.data.achievements;
          });

          return AchievementFactory;
      }
})();
