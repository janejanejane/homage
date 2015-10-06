app
  .controller('HomageCtrl', ['$scope', '$ionicPlatform', '$cordovaDevice', 'HomageFactory', function($scope, $ionicPlatform, $cordovaDevice, HomageFactory) {

    $scope.shout = null;
    $scope.savedClicks = null;
    $scope.clickArray = null;
    $scope.maxDays = 7;

    var index = 0,
        uuid = null;

    $ionicPlatform.ready(function() {
      // @link: http://forum.ionicframework.com/t/problem-to-use-ngcordova-device-is-not-defined/11979/2
      if( ionic.Platform.isAndroid() ){
        console.log('hello?');
        uuid = $cordovaDevice.getUUID();
      }else{
        console.log("Is not Android");
        // uuid = 1;
        uuid = "testUUID";
      }

      HomageFactory.getAllClicks(uuid, function(clickObj) { // wait for the device uuid to prevent null result
        console.log('result', clickObj);

        clickObj.$bindTo($scope, 'savedClicks').then(function(data){
          console.log('Saved Clicks: ', $scope.savedClicks);
          //if there is no click yet for this user
          if($scope.savedClicks.$value === null){
            //create a new clicks
            HomageFactory.createNewUser(uuid);
          }
        });
      });

      HomageFactory.getClicks(uuid, $scope.maxDays, function(clickObj) { // wait for the device uuid to prevent null result
        console.log('result', clickObj);

        clickObj.$loaded(function(data){
          $scope.clickArray = data;
          console.log('Saved Clicks: ', $scope.clickArray);
        });
      });

    });

    HomageFactory.getAllResponses().success(function(data) {
      $scope.responsedata = data;
    });

    $scope.displayResponse = function() {
      index = Math.floor(Math.random() * $scope.responsedata.responses.length);
      $scope.shout = $scope.responsedata.responses[index];
    };

    $scope.buttonClick = function() {

      if(!$scope.savedClicks.clicks){
        HomageFactory.setClickCount($scope.savedClicks.$id, moment().format('MM-DD-YYYY'), 1);
      }else{
        var sum = 0;
        if($scope.savedClicks.clicks[moment().format('MM-DD-YYYY')]){
          sum = $scope.savedClicks.clicks[moment().format('MM-DD-YYYY')];
        }
        HomageFactory.setClickCount(
          $scope.savedClicks.$id,
          moment().format('MM-DD-YYYY'),
          sum+1 );
      }
    };


  }]);
