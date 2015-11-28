(function() {
    angular
        .module( 'homage' )
        .factory( 'HomageFactory', HomageFactory );

    HomageFactory.$inject = [ '$firebaseArray', '$firebaseObject', '$http', 'CONSTANTS', 'AchievementFactory' ];

    function HomageFactory( $firebaseArray, $firebaseObject, $http, CONSTANTS, AchievementFactory ) {
        'use strict';

        var ref = new Firebase( CONSTANTS.FIREBASE_URL ),
            db = CONSTANTS.FIREBASE_DB;

        return {
            // get all the data on clicks of current user
            getAllClicks: function( userId, callback ) {
                var self = this,
                    clickObj = $firebaseObject( ref.child( db + '/' + userId ) );

                return callback( clickObj );
            },
            // get the totalCount to show in client
            getTotalCount: function( uuid, callback ) {
                var totalObj = $firebaseObject( ref.child( db + '/' + uuid + '/totalCount' ) );

                return callback( totalObj );
            },
            // get paginated clicks
            getClicks: function( uuid, start, end, callback ) {
                var obj = ref.child( db + '/' + uuid + '/clicks' )
                              .orderByKey()
                              .startAt( start.format( 'MM-DD-YYYY' ).toString() )
                              .endAt( end.format( 'MM-DD-YYYY' ).toString() ),
                    clickArray = $firebaseArray( obj );

                return callback( clickArray );
            },
            createNewUser: function( uuid ) {
                // automatically creates user node if no record yet
                var obj = ref.child( db + '/' + uuid );
                obj.set({
                    clicks: [],
                    name: uuid,
                    totalCount: 0,
                    achievements: [],
                    longest50streak: 0
                });
            },
            setClickCount: function( uuid, dateString, value, callback ) {
                var obj = ref.child( db + '/' + uuid + '/clicks/' + dateString );
                obj.set( value, function() {
                    callback( true );
                });
            },
            setTotalCount: function( uuid, value, callback ) {
                var obj = ref.child( db + '/' + uuid + '/totalCount' ),
                    total = 0,
                    self = this;

                obj.once( 'value', function( snapshot ) {
                    // check if totalCount contains data
                    if ( snapshot.exists() ) {
                        obj.set( value, function() {
                            callback( true );
                        });
                    } else {
                        // iterate through all records then update totalCount
                        self.getAllClicks( uuid, function( record ) {
                            record.$loaded().then(function() {

                                for ( var i in record.clicks ) {
                                    total += record.clicks[ i ];
                                }
                                obj.set( total, function() {
                                    callback( true );
                                });
                            });
                        });
                    }
                });
            },
            setStreak: function( uuid, callback ) {
                var obj = ref.child( db + '/' + uuid + '/longest50streak' ),
                    // default longest streak is current day
                    streak = 1,
                    self = this;

                obj.once( 'value', function( snapshot ) {
                    // check if longest50streak contains data
                    if ( snapshot.exists() ) {
                        // get the clicks stored for the user
                        self.getAllClicks( uuid, function( record ) {
                            record.$loaded().then(function() {
                                // get click record from yesterday
                                // used in else case
                                var yesterday = moment().subtract( 1, 'day' );

                                // first click record for the current user
                                if ( _.size( record.clicks ) < 2 ) {
                                    obj.set( streak, function() {
                                        callback( true );
                                    });
                                } else {
                                    self.getClicks( uuid, yesterday, yesterday, function( response ) {
                                        response.$loaded().then(function() {
                                            // if yesterday has more than 50 clicks, there will be data
                                            if ( response.length === 1 && response[ 0 ].$value > 50 ) {
                                                // get longest50streak property and update
                                                obj.once( 'value', function( snap ) {
                                                    streak = snap.val() + 1;
                                                });

                                                // set streak to incremented value @line: 96
                                            }

                                            obj.set( streak, function() {
                                                callback( true );
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    } else {
                        self.getAllClicks( uuid, function( record ) {
                            record.$loaded().then(function() {
                                // initialize array to prevent undefined when setting property
                                var array = [],
                                    streak = 0,
                                    streakData = [],
                                    // extract keys only
                                    keys = _.keys( array );

                                // get all dates with more than 50 clicks
                                _.filter( record.clicks, function( val, key ) {
                                    if ( val > 50 ) {
                                        return array[ key ] = val;
                                    }
                                });

                                for ( var i = 0; i < keys.length; i++ ) {
                                    // proceed to check when there is plus 1 to current index
                                    if ( keys[ i + 1 ] ) {
                                        // check if current index date value (keys[i]) plus 1 day is equal to the next date value (keys[i+1])
                                        if ( moment( keys[ i ] ).add( 1, 'day' ).format( 'MM-DD-YYYY' ) === keys[ i + 1 ] ) {
                                            // iterate streak
                                            streak += 1;
                                        } else {
                                            // only store data when more than zero
                                            if ( streak > 0 ) {
                                                // push streak data
                                                streakData.push( streak );
                                            }
                                            // revert to zero
                                            streak = 0;
                                        }
                                    }
                                }

                                // set longest50streak value
                                streak = _.max( streakData );
                                obj.set( streak, function() {
                                    callback( true );
                                });
                            });
                        });
                    }
                });
            }
        };
    }
})();
