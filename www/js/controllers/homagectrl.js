app
  .controller('HomageCtrl', function($scope, $ionicPlatform, $cordovaDevice, HomageFactory) {

    $scope.shout = null;

    var index = 0,
        uuid = null;

    $ionicPlatform.ready(function() {
      // @link: http://forum.ionicframework.com/t/problem-to-use-ngcordova-device-is-not-defined/11979/2
      if( ionic.Platform.isAndroid() ){
        uuid = $cordovaDevice.getUUID();
      }else{
        console.log("Is not Android");
        uuid = "testUUID";
      }
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
    };
  });