(function() {
    angular
        .module( 'homage' )
        .controller( 'HomageCtrl', HomageCtrl );

    HomageCtrl.$inject = [ '$scope', '$ionicPlatform', '$ionicLoading', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicPopup', '$cordovaNetwork', '$cordovaDevice', 'CONSTANTS', 'HomageFactory', 'AchievementFactory', 'AvatarFactory', 'AwardFactory', 'TimerFactory' ];

    function HomageCtrl( $scope, $ionicPlatform, $ionicLoading, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPopup, $cordovaNetwork, $cordovaDevice, CONSTANTS, HomageFactory, AchievementFactory, AvatarFactory, AwardFactory, TimerFactory ) {
        'use strict';

        var homage = this;

        homage.clickArray = [];
        homage.achievementArray = [];
        homage.isAvailable = null;
        homage.today = moment().format( 'MM-DD-YYYY' );
        homage.popupUsername = '';
        homage.setAchievementDone = setAchievementDone;
        homage.controller = {
            init: init,
            setup: setup
        };

        // current user data from database
        $scope.savedClicks = null;

        // current user changes not sent to database
        $scope.temp = {
            totalClicks: 0,
            todayClicks: 0,
            todayUpdated: true,
            totalUpdated: true,
            streakUpdated: true,
            longestStreak: 0,
            achievements: [],
            notifs: [],
            chartClicks: []
        };

        // info used in UI
        $scope.data = {
            uuid: '',
            popupEnabled: true,
            avatarLoc: CONSTANTS.AVATAR_DIR + '/' + CONSTANTS.AVATAR_FNAME,
            choice: 'days',
            selectedList: '',
            maxDays: 7,
            clickCount: 0,
            currentLevel: 0,
            clicksToLevelUp: 0,
            currentLevelClicks: 0,
            achievementsDeclared: [],
            avatarNames: [],
            awardImages: []
        };

        // updates the click logged for current user
        $scope.buttonClick = buttonClick;

        // send all activity to db
        $scope.sendUpdate = sendUpdate;

        // handles the ionic slide boxes change
        $scope.slideHasChanged = slideHasChanged;

        // updates clicks array used in UI
        $scope.updateClicksArray = updateClicksArray;

        // calculate all of the clicks from db and in current
        $scope.recalculateClicks = recalculateClicks;

        // extract the count for today from db object
        $scope.extractTodayCount = extractTodayCount;

        // gets clicks within range of 7 days ago from today
        $scope.reduceArray = reduceArray;

        // back button in achievements and avatars list
        $scope.backClick = backClick;

        // checks if app is ready
        $ionicPlatform.ready( platFormReady );

        function init() {
            // @link: http://forum.ionicframework.com/t/problem-to-use-ngcordova-device-is-not-defined/11979/2
            if ( ionic.Platform.isAndroid() ) {
                // for browser mobile emulation
                $scope.data.uuid = 'testUUID';
                if ( homage.isAvailable ) {
                    $scope.data.uuid = $cordovaDevice.getUUID();
                    showLoader();
                    homage.controller.setup( $scope.data.uuid );
                    $scope.data.popupEnabled = false;
                }
            } else {
                if ( !window.cordova ) {
                    homage.popupUsername = $ionicPopup.show({
                        // waits until achievements array data are all in place
                        template: '<input type="text" ng-model="data.uuid">',
                        title: 'Enter user name',
                        // waits until achievements array data are all in place
                        scope: $scope,
                        buttons: [
                            { text: 'Cancel' },
                            {
                                text: '<b>Save</b>',
                                type: 'button-positive',
                                onTap: function( e ) {
                                    if ( !$scope.data.uuid ) {
                                        // don't allow the user to close unless there is input
                                        e.preventDefault();
                                    } else {
                                        return $scope.data.uuid;
                                    }
                                }
                            }
                        ]
                    });
                }

                homage.popupUsername.then(function( input ) {
                    showLoader();
                    homage.controller.setup( input );
                    $scope.data.popupEnabled = false;
                });
            }
        }

        function showLoader() {
          // Setup the loader
          $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
          });
        }

        function setup( user ) {
            HomageFactory.getAllClicks( user, function( clickObj ) {

                clickObj.$bindTo( $scope, 'savedClicks' ).then(function() {
                    // if there is no click yet for this user
                    if ( $scope.savedClicks.$value === null ) {
                        // create a new clicks
                        HomageFactory.createNewUser( user );
                    }

                    // get current longest streak
                    $scope.temp.longestStreak = clickObj.longest50streak || 0;
                    console.log( '$scope.temp.longestStreak', $scope.temp.longestStreak, clickObj );
                });
            });

            // get overall clicks logged
            HomageFactory.getTotalCount( user, function( totalObj ) {
                totalObj.$bindTo( $scope, 'data.clickCount' ).then(function() {
                    // copy total count from db
                    $scope.temp.totalClicks = totalObj.$value || 0;
                    console.log( 'original totalClicks', $scope.temp.totalClicks );
                });
            });

            // get json data for all achievements
            AchievementFactory.getAchievementsDeclared().then(function( response ) {
                $scope.data.achievementsDeclared = response.data.achievements;
            });

            // get json data of the avatar names
            AvatarFactory.getAvatarNames().then(function( response ) {
                $scope.data.avatarNames = response.data.avatars;
            });

            // get json data of achievement images
            AwardFactory.getAwardsFileNames().then(function( response ) {
                $scope.data.awardImages = response.data.awards;
            });

            // get binding to achievements array
            homage.achievementArray = AchievementFactory.getAllAchievements( user );

            // waits until achievements array data are all in place
            homage.achievementArray.$loaded().then(function( achievements ) {
                console.log( 'homage.achievementArray.$loaded()' );
                $scope.temp.achievements = _.flatten( achievements );
            });

            // default to 1 month data
            HomageFactory.getClicks( $scope.data.uuid, moment().subtract( 31, 'day' ), moment(), function( clickObj ) {
                // get binding to clicks array
                clickObj.$loaded().then(function( data ) {
                    var currentDate = _.filter( data, function( val ) {
                        return val.$id === homage.today;
                    });

                    homage.clickArray = data;

                    // no clicks for today
                    if ( !currentDate.length ) {
                        HomageFactory.setClickCount(
                            // uuid
                            $scope.data.uuid,
                            // date
                            homage.today,
                            // total clicks
                            0,
                            function() {
                                // initialize clicks for today
                                $scope.temp.todayClicks = $scope.extractTodayCount();
                            }
                        );
                    } else {
                        // copy data
                        $scope.temp.chartClicks = $scope.reduceArray();
                    }

                    // initialize clicks for today
                    $scope.temp.todayClicks = $scope.extractTodayCount();
                    console.log( '$scope.temp.todayClicks', $scope.temp.todayClicks );

                    // hide loader
                    $ionicLoading.hide();
                });

                clickObj.$watch(function() {
                    // date today is added to array (from @line 158)
                    // last item in array
                    if ( _.last( clickObj ).$id === homage.today ) {
                        console.log( 'updated???' );
                        // copy data
                        $scope.temp.chartClicks = $scope.reduceArray();
                    }
                });
            });

            // I AM ALWAYS RUNNING!
            // updates db values
            TimerFactory.startTime(function() {
                console.log( 'test' );
                if ( ($scope.extractTodayCount() !== $scope.temp.todayClicks) ||
                        ($scope.data.clickCount.$value !== $scope.temp.totalClicks) ||
                        (!$scope.temp.todayUpdated && !$scope.temp.totalUpdated) ) {
                    $scope.sendUpdate();
                }

                if ( !$scope.temp.streakUpdated ) {
                    console.log( 'TimerFactory update !$scope.temp.streakUpdated?' );
                    $scope.sendUpdate();
                }
            });
        }

        // updates the local achievement array to be pushed to db later
        // call toast service
        function setAchievementDone( response ) {
            if ( response ) {
                // $scope.showAchievement( response );
                $scope.temp.achievements.push( response );
                $scope.temp.notifs.push( response );
                console.log( response, '????', $scope.temp.notifs );
            }
        }

        // called by the ionicPlatform if it is ready
        function platFormReady() {
            // checks if the app is used in a device
            homage.isAvailable = ionic.Platform.device().available;

            if ( homage.isAvailable ) {
                if ( $cordovaNetwork ) {
                    if ( $cordovaNetwork.isOffline() ) {
                        $ionicPopup.alert({
                            title: 'Device Offline',
                            content: 'There is no internet connection.'
                        }).then(function() {
                            // closes the app
                            ionic.Platform.exitApp();
                        });
                    } else {
                        homage.controller.init();
                    }
                }
            } else {
                homage.controller.init();
            }
        }

        // clicks are handled here
        // also knows if there is an achievement
        function buttonClick() {
            // used in if($scope.temp.todayClicks === 51)
            var allClicksCount;

            // increase click for today
            $scope.temp.todayClicks += 1;
            $scope.temp.todayUpdated = false;
            console.log( $scope.temp.todayClicks );

            // increase total click for today
            $scope.temp.totalClicks += 1;
            $scope.temp.totalUpdated = false;
            console.log( $scope.temp.totalClicks );
            console.log( 'db total', $scope.savedClicks.totalCount );

            // increase click for today used in chart
            $scope.temp.chartClicks[ _.size( $scope.temp.chartClicks ) - 1 ].$value += 1;
            console.log( $scope.temp.chartClicks );

            AchievementFactory.setAchievement(
                'clicks',
                // total clicks
                $scope.temp.totalClicks,
                // unlocked achievements
                $scope.temp.achievements,
                // function callback
                homage.setAchievementDone
            );

            if ( $scope.temp.todayClicks === 51 ) {
                allClicksCount = _.size( homage.clickArray );

                // set longest streak correctly
                // check if previous click also is greater than 50
                if ( allClicksCount > 1 && homage.clickArray[ allClicksCount - 2 ].$value >= 51 ) {
                    $scope.temp.longestStreak += 1;
                } else {
                    $scope.temp.longestStreak = 1;
                }

                AchievementFactory.setAchievement(
                    'streak',
                    // longest clicks
                    $scope.temp.longestStreak,
                    // unlocked achievements
                    $scope.temp.achievements,
                    // function callback
                    homage.setAchievementDone
                );
                console.log( 'inside 51' );
            }
        }

        // called in achievement and avatar directives to return default view of lists to the top
        function backClick() {
            $scope.data.selectedList = '';
            $ionicScrollDelegate.scrollTop();
        };

        // always returns 7 days worth of click data
        function reduceArray() {
            // .flatten gets array values only
            // .takeRightWhile reduces the array starting from last value
            return _.takeRightWhile( _.flatten( homage.clickArray ), function( i ) {
                // get all data from 7 days before current date
                return moment( i.$id, 'MM-DD-YYYY' )
                            .diff( moment().subtract( $scope.data.maxDays, 'day' ), 'days' ) > 0;
            });
        };

        // returns the value of clicks
        // waits until achievements array data are all in placemade today
        function extractTodayCount() {
            // .first returns first object in the array
            // .flatten returns a single array that is not nested
            // .filter gets the object value for today
            var dataToday = _.filter( homage.clickArray, function( i ) {
                return i.$id === homage.today;
            });

            if ( !dataToday.length ) {
                return 0;
            }

            return _.first( _.flatten( dataToday ) ).$value;
        };

        // called to ensure that the total click is REALLY the sum of all clicks so far
        function recalculateClicks() {
            // .values will convert the object - { 10-07-2015: 9, 10-14-2015: 26 } to an array - [9, 26]
            // .reduce returns a single value accumulated from adding all elements
            return _.reduce( _.values( $scope.savedClicks.clicks ), function( prev, cur ) {
                return prev + cur;
            }, 0 );
        };

        // called to update array values when choice is changed
        function updateClicksArray( value ) {
            console.log( value );
            if ( value === 'days' ) {
                $scope.temp.chartClicks = $scope.reduceArray();
            } else {
                $scope.temp.chartClicks = _.flatten( homage.clickArray );
            }
        };

        // ionic slide action override
        function slideHasChanged( index ) {
            $ionicSlideBoxDelegate.slide( index, 500 );
        };

        // called every 10 seconds by the TimerFactory if conditions are met
        function sendUpdate() {
            // deep clone to avoid assign by reference coz .recent is deleted
            // .recent is used to time the toast visibility
            var unsetAchievements = _.cloneDeep(
                _.filter( $scope.temp.achievements, function( record ) {
                    return record.recent;
                })
            );

            console.log( unsetAchievements );

            // update click count in db
            HomageFactory.setClickCount(
                // uuid
                $scope.data.uuid,
                // date
                homage.today,
                // total clicks
                $scope.temp.todayClicks,
                // callback
                function( status ) {
                    if ( status ) {
                        $scope.temp.todayUpdated = true;
                        $scope.temp.todayClicks = $scope.extractTodayCount();
                    }
                }
            );

            HomageFactory.setTotalCount(
                // uuid
                $scope.data.uuid,
                // total clicks
                $scope.temp.totalClicks,
                // callback
                function( status ) {
                    if ( status ) {
                        $scope.temp.totalUpdated = true;
                        console.log( $scope.recalculateClicks(), '<<<recalculateClicks' );
                        $scope.temp.totalClicks = $scope.recalculateClicks();
                    }
                }
            );

            // has elements
            if ( !!unsetAchievements.length ) {
                // add to database
                AchievementFactory.onUnlocked(
                    $scope.data.uuid,
                    unsetAchievements,
                    homage.achievementArray,
                    function( data ) {
                        if ( data.id ) {
                            $scope.temp.achievements = homage.achievementArray;
                        }
                    }
                );
            }

            // check if clicks are 51 for the longest streak achievement
            if ( $scope.temp.longestStreak !== $scope.savedClicks.longest50streak ) {
                console.log( 'inside streak sendUpdate' );
                HomageFactory.setStreak(
                    // uuid
                    $scope.data.uuid,
                    // callback
                    function( status ) {
                        if ( status ) {
                            $scope.temp.streakUpdated = true;
                        }
                    }
                );

                // has elements
                if ( !!unsetAchievements.length ) {
                    // add to database
                    AchievementFactory.onUnlocked(
                        $scope.data.uuid,
                        unsetAchievements,
                        homage.achievementArray,
                        function( data ) {
                            if ( data.id ) {
                                $scope.temp.achievements = homage.achievementArray;
                            }
                        }
                    );
                }
            }
        };
    }
})();
