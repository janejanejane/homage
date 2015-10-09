app
  .controller('HomageCtrl', ['$scope', '$ionicPlatform', '$cordovaDevice', 'HomageFactory', function($scope, $ionicPlatform, $cordovaDevice, HomageFactory) {

    $scope.shout = null;
    $scope.savedClicks = null;
    $scope.clickArray = [];
    $scope.maxDays = 7;
    $scope.currentWeek = 0;

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

      updateClicksArray();

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

    function updateClicksArray(){
      HomageFactory.getClicks(uuid, $scope.maxDays, function(clickObj) { // wait for the device uuid to prevent null result
        console.log('result', clickObj);

        clickObj.$watch(function(){
          console.log('THis changed..');
          //extract the data
          for(var i in clickObj) {
            if(typeof clickObj[i] !== 'function') {
              $scope.clickArray.push(clickObj[i]);
            }
          }
        });
      });
    }


  }]);
