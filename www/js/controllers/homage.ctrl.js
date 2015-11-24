app
  .controller('HomageCtrl', [
    '$scope', 
    '$filter', 
    '$mdToast', 
    '$ionicPlatform', 
    '$ionicLoading',
    '$ionicSlideBoxDelegate', 
    '$ionicScrollDelegate',
    '$ionicPopup', 
    '$cordovaNetwork', 
    '$cordovaDevice', 
    'CONSTANTS',
    'HomageFactory', 
    'AchievementFactory',
    'AvatarFactory',
    'TimerFactory',
    function(
      $scope, 
      $filter,
      $mdToast, 
      $ionicPlatform, 
      $ionicLoading, 
      $ionicSlideBoxDelegate, 
      $ionicScrollDelegate, 
      $ionicPopup, 
      $cordovaNetwork, 
      $cordovaDevice, 
      CONSTANTS, 
      HomageFactory, 
      AchievementFactory,
      AvatarFactory,
      TimerFactory) {

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
      clickArray: [],
      achievementArray: [],
      achievementsDeclared: [],
      avatarNames: []
    }

    var isAvailable = null;
    var today = moment().format('MM-DD-YYYY');
    var controller = {
      popupUsername: '',
      init: function() {
        // @link: http://forum.ionicframework.com/t/problem-to-use-ngcordova-device-is-not-defined/11979/2
        if( ionic.Platform.isAndroid() ){
          $scope.data.uuid = "testUUID"; // for browser mobile emulation
          if(isAvailable) $scope.data.uuid = $cordovaDevice.getUUID();
          controller.setup($scope.data.uuid);
          $scope.data.popupEnabled = false;
        }else{
          if(!window.cordova) {
            popupUsername = $ionicPopup.show({
              template: '<input type="text" ng-model="data.uuid">',
              title: 'Enter user name',
              scope: $scope,
              buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Save</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    if (!$scope.data.uuid) {
                      //don't allow the user to close unless there is input
                      e.preventDefault();
                    } else {
                      return $scope.data.uuid;
                    }
                  }
                }
              ]
            });
          }

          popupUsername.then(function(input){
            // Setup the loader
            $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });

            controller.setup(input);
            $scope.data.popupEnabled = false;
          });
        }
      },
      setup: function(user) {
        HomageFactory.getAllClicks(user, function(clickObj) { // wait for the device uuid to prevent null result

          clickObj.$bindTo($scope, 'savedClicks').then(function(data){
            //if there is no click yet for this user
            if($scope.savedClicks.$value === null){
              //create a new clicks
              HomageFactory.createNewUser(user);
            }

            // get current longest streak
            $scope.temp.longestStreak = clickObj.longest50streak || 0;
            console.log('$scope.temp.longestStreak', $scope.temp.longestStreak, clickObj);
          });
        });

        // get overall clicks logged
        HomageFactory.getTotalCount(user, function(totalObj) {
          totalObj.$bindTo($scope, 'data.clickCount').then(function() {
            // copy total count from db
            $scope.temp.totalClicks = totalObj.$value || 0;
            console.log('original totalClicks', $scope.temp.totalClicks);
          });
        });

        // get json data for all achievements
        AchievementFactory.getAchievementsDeclared().then(function(response) {
          $scope.data.achievementsDeclared = response.data.achievements;
        });

        // get json data of the avatar names
        AvatarFactory.getAvatarNames().then(function(response) {
          $scope.data.avatarNames = response.data.avatars;
        });

        // get binding to achievements array
        $scope.data.achievementArray = AchievementFactory.getAllAchievements(user);

        $scope.data.achievementArray.$loaded().then(function(achievements) {
          console.log('passes here?? achievementArray.$loaded()');
          $scope.temp.achievements = _.flatten(achievements);
        });

        // default to 1 month data
        HomageFactory.getClicks($scope.data.uuid, moment().subtract(31, 'day'), moment(), function(clickObj) {
          // get binding to clicks array
          clickObj.$loaded().then(function(data){
            $scope.data.clickArray = data;

            var currentDate = _.filter(data, function(val) {
              return val.$id === today;
            });

            // no clicks for today
            if(!currentDate.length) {
              HomageFactory.setClickCount(
                $scope.data.uuid, // uuid
                today, // date
                0, // total clicks
                function(status) { 
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
            console.log('$scope.temp.todayClicks', $scope.temp.todayClicks);

            // hide loader
            $ionicLoading.hide();
          });

          clickObj.$watch(function() {
            // date today is added to array (from @line 158)
            if(_.last(clickObj).$id === today) { // last item in array
              console.log('updated???');
              // copy data
              $scope.temp.chartClicks = $scope.reduceArray();
            }
          });
        });

        TimerFactory.startTime(function() {
          console.log('test');
          if(($scope.extractTodayCount() !== $scope.temp.todayClicks) ||
              ($scope.data.clickCount.$value !== $scope.temp.totalClicks) ||
              (!$scope.temp.todayUpdated && !$scope.temp.totalUpdated)) {
            console.log('TimerFactory update !$scope.temp.todayUpdated && !$scope.temp.totalUpdated?');
            $scope.sendUpdate();
          }

          if(!$scope.temp.streakUpdated) {
            console.log('TimerFactory update !$scope.temp.streakUpdated?');
            $scope.sendUpdate();
          }
        });
      }
    };

    // checks if app is ready
    $ionicPlatform.ready(function() {
      // checks if the app is used in a device
      isAvailable = ionic.Platform.device().available;

      if(isAvailable) {
        if($cordovaNetwork) {
          if($cordovaNetwork.isOffline()) {
            $ionicPopup.alert({
              title: "Device Offline",
              content: "There is no internet connection."
            })
            .then(function(result) {
              // closes the app
              ionic.Platform.exitApp();
            });
          } else {
            controller.init();
          }
        } 
      } else {
        controller.init();
      }
    });

    // updates the click logged for current user
    $scope.buttonClick = function() {

      // increase click for today
      $scope.temp.todayClicks += 1;
      $scope.temp.todayUpdated = false;
      console.log($scope.temp.todayClicks);

      // increase total click for today
      $scope.temp.totalClicks += 1;
      $scope.temp.totalUpdated = false;
      console.log($scope.temp.totalClicks);
      console.log('db total', $scope.savedClicks.totalCount);

      // increase click for today used in chart
      $scope.temp.chartClicks[_.size($scope.temp.chartClicks) - 1].$value += 1;
      console.log($scope.temp.chartClicks);

      AchievementFactory.setAchievement(
        'clicks',
        $scope.temp.totalClicks, // total clicks
        $scope.temp.achievements, // unlocked achievements
        setAchievementDone // function callback
      );

      if($scope.temp.todayClicks === 51) {
        console.log('inside 51');
        // set longest streak correctly
        // check if previous click also is greater than 50
        var allClicksCount = _.size($scope.data.clickArray);
        if(allClicksCount > 1 && $scope.data.clickArray[allClicksCount - 2].$value >= 51) {
          $scope.temp.longestStreak += 1;
        } else {
          $scope.temp.longestStreak = 1;
        }

        AchievementFactory.setAchievement(
          'streak',
          $scope.temp.longestStreak, // longest clicks
          $scope.temp.achievements, // unlocked achievements
          setAchievementDone // function callback
        );
      }
    };

    // back button in achievements and avatars list
    $scope.backClick = function() {
      $scope.data.selectedList = ''; 
      $ionicScrollDelegate.scrollTop();
    };

    // .flatten gets array values only
    // .takeRightWhile reduces the array starting from last value
    $scope.reduceArray = function() {
      return _.takeRightWhile(_.flatten($scope.data.clickArray), function(i) {
        // get all data from 7 days before current date
        return moment(i.$id, 'MM-DD-YYYY').diff(moment().subtract($scope.data.maxDays, 'day'), 'days') > 0;
      });
    }

    $scope.extractTodayCount = function() {
      // .first returns first object in the array
      // .flatten returns a single array that is not nested
      // .filter gets the object value for today
      var dataToday = _.filter($scope.data.clickArray, function(i) {
        return i.$id === today;
      });

      if(!dataToday.length) 
        return 0;

      return _.first(_.flatten(dataToday)).$value;
    }

    $scope.recalculateClicks = function() {
      // .values will convert the object - { 10-07-2015: 9, 10-14-2015: 26 } to an array - [9, 26]
      // .reduce returns a single value accumulated from adding all elements
      return _.reduce(_.values($scope.savedClicks.clicks), function(prev, cur) {
        return prev + cur;
      }, 0);
    }

    // updates clicks array used in UI
    $scope.updateClicksArray = function(value){
      console.log(value);
      if(value === 'days') {
        $scope.temp.chartClicks = $scope.reduceArray();
      } else {
        $scope.temp.chartClicks = _.flatten($scope.data.clickArray);
      }
    };

    // handles the ionic slide boxes change
    $scope.slideHasChanged = function(index) {
      $ionicSlideBoxDelegate.slide(index, 500);
    };

    // displays toast for achievement at the bottom of the screen
    $scope.showAchievement = function(record) {
      var toast = $mdToast.simple();
      if(!record) {
        toast.content('Error in AchievementFactory').theme('assertive');
      } else {
        toast.content(record.description).theme('energized');
      }

      $mdToast.show(
        toast
          .position('bottom')
          .hideDelay(1000)
      );
    }

    $scope.sendUpdate = function() {
      var unsetAchievements = _.filter($scope.temp.achievements, function(record) {
        return record.recent;
      });

      console.log(unsetAchievements);

      // update click count in db
      HomageFactory.setClickCount(
        $scope.data.uuid, // uuid
        today, // date
        $scope.temp.todayClicks, // total clicks
        function(status) { // callback
          if(status) {
            $scope.temp.todayUpdated = true;
            console.log($scope.data.clickArray[today]);
            $scope.temp.todayClicks = $scope.extractTodayCount();
          }
        }
      );

      HomageFactory.setTotalCount(
        $scope.data.uuid, // uuid
        $scope.temp.totalClicks, // total clicks
        function(status) { // callback
          if(status) {
            $scope.temp.totalUpdated = true;
            console.log($scope.recalculateClicks(), '<<<recalculateClicks');
            $scope.temp.totalClicks = $scope.recalculateClicks();
          }
        });

      if(!!unsetAchievements.length) { // has elements
        // add to database
        AchievementFactory.onUnlocked(
          $scope.data.uuid, 
          unsetAchievements, 
          $scope.data.achievementArray, 
          function(data) {
            if(data.id) {
              $scope.temp.achievements = $scope.data.achievementArray; 
            }
          }
        );
      }

      // check if clicks are 51 for the longest streak achievement
      if($scope.temp.longestStreak !== $scope.savedClicks.longest50streak) {
        console.log('inside streak sendUpdate');
        HomageFactory.setStreak(
          $scope.data.uuid, // uuid
          function(record) { // callback
            if(status) {
              $scope.temp.streakUpdated = true;
            }
          }
        );

        if(!!unsetAchievements.length) { // has elements
          // add to database
          AchievementFactory.onUnlocked(
            $scope.data.uuid, 
            unsetAchievements, 
            $scope.data.achievementArray, 
            function(data) {
              if(data.id) {
                $scope.temp.achievements = $scope.data.achievementArray; 
              }
            }
          );
        }
      }
    }

    function setAchievementDone(response) {
      if(response) {
        $scope.showAchievement(response);
        $scope.temp.achievements.push(response);
        console.log(response, '????', $scope.temp.achievements);
      }
    }
  }]);
