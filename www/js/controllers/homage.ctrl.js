app
  .controller('HomageCtrl', ['$scope', '$ionicPlatform', '$cordovaDevice', 'HomageFactory', function($scope, $ionicPlatform, $cordovaDevice, HomageFactory) {

    $scope.shout = null;
    $scope.savedClicks = null;

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
        // clickObj.on(function(data){
        //   console.log('On Data', data);
        // });

        clickObj.$bindTo($scope, 'savedClicks').then(function(data){
          console.log('Saved Clicks: ', $scope.savedClicks);
          //if there is no click yet for this user
          if($scope.savedClicks.$value === null){
            //create a new clicks
            console.log('Create a new clicks');
            HomageFactory.createNewUser(uuid);
          }
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
      var data = {
        userId: uuid,
        count: 1,
        date: moment().format('MM-DD-YYYY')
      }

      data['dbId'] = HomageFactory.hasUserRecord(data.userId);

      HomageFactory.setClickCount(data);
      $scope.displayResponse();

      HomageFactory.getAllClicks(uuid, function(result) { // wait for the device uuid to prevent null result
        console.log('result', result);
        // $scope.savedClicks = result;
      });
    };
  }]);
