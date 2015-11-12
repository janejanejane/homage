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
    function($scope, $filter, $mdToast, $ionicPlatform, $ionicLoading, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPopup, $cordovaNetwork, $cordovaDevice, CONSTANTS, HomageFactory, AchievementFactory) {

    $scope.shout = null;
    $scope.savedClicks = null;
    $scope.currentWeek = 0;
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
    }

    var controller = {
      index: 0,
      isAvailable: null,
      popupUsername: '',
      init: function() {
        // Setup the loader
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });

        // @link: http://forum.ionicframework.com/t/problem-to-use-ngcordova-device-is-not-defined/11979/2
        if( ionic.Platform.isAndroid() ){
          console.log('hello?');
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
          });
        });

        // get overall clicks logged
        HomageFactory.getTotalCount(user, function(totalObj) {
          totalObj.$bindTo($scope, 'data.clickCount');
        });

        // get json data for all achievements
        AchievementFactory.getAchievementsDeclared().then().then(function(response) {
          $scope.data.achievementsDeclared = response.data.achievements;
        });

        $scope.updateClicksArray();
        $scope.updateAchievements(user); 
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

      if(!$scope.savedClicks.clicks){
        HomageFactory.setClickCount(
          $scope.savedClicks.$id, 
          moment().format('MM-DD-YYYY'), 
          1, 
          function(record) {
            $scope.showAchievement(record);
            $scope.updateAchievements($scope.data.uuid);
          }
        );
      }else{
        var sum = 0;
        if($scope.savedClicks.clicks[moment().format('MM-DD-YYYY')]){
          sum = $scope.savedClicks.clicks[moment().format('MM-DD-YYYY')];
        }
        HomageFactory.setClickCount(
          $scope.savedClicks.$id,
          moment().format('MM-DD-YYYY'),
          sum+1, 
          function(record) {
            $scope.showAchievement(record);
            $scope.updateAchievements($scope.data.uuid);
          }
        );
      }

      if($scope.data.choice === 'month') {
        $scope.updateClicksArray(moment().subtract(31, 'day'), moment());
      } else {
        $scope.updateClicksArray();
      }
    };

    // back button in achievements and avatars list
    $scope.backClick = function() {
      $scope.data.selectedList = ''; 
      $ionicScrollDelegate.scrollTop();
    };

    // updates clicks array used in UI
    $scope.updateClicksArray = function(start, end){
      var startDate = start,
          endDate = end,
          found = null;

      if(!start) {
        startDate = moment().subtract($scope.data.maxDays - 1, 'day');
      }

      if(!end) {
        endDate = moment();
      }

      HomageFactory.getClicks($scope.data.uuid, startDate, endDate, function(clickObj) { // wait for the device uuid to prevent null result
        $scope.data.clickArray = [];

        clickObj.$loaded().then(function(){
          clickObj.forEach(function(data) { // use .forEach to exclude enumerated attributes
            $scope.data.clickArray.push(data);
          });

          // hide loader
          $ionicLoading.hide();
        });
      });
    };

    // updates achievements array used in UI
    $scope.updateAchievements = function(uuid) {
      $scope.data.achievementArray = [];

      AchievementFactory.getAllAchievements(uuid).$loaded().then(function(achievementObj) {
        achievementObj.forEach(function(data) {
          $scope.data.achievementArray.push(data);
        });
      });
    };

    // handles the ionic slide boxes change
    $scope.slideHasChanged = function(index) {
      $ionicSlideBoxDelegate.slide(index, 500);
    };

    // displays toast for achievement at the bottom of the screen
    $scope.showAchievement = function(record) {
      var toast = $mdToast.simple();
      if(!record.id) {
        toast.content('Error in AchievementFactory').theme('assertive');
      } else {
        toast.content(record.achievement).theme('energized');
      }

      $mdToast.show(
        toast
          .position('bottom')
          .hideDelay(1000)
      );
    }
  }]);
