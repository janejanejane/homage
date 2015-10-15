app
  .controller('HomageCtrl', ['$scope', '$filter', '$ionicPlatform', '$ionicSlideBoxDelegate', '$cordovaDevice', 'HomageFactory', function($scope, $filter, $ionicPlatform, $ionicSlideBoxDelegate, $cordovaDevice, HomageFactory) {

    $scope.shout = null;
    $scope.savedClicks = null;
    $scope.currentWeek = 0;
    $scope.data = {
      choice: 'days',
      maxDays: 7,
      clickCount: 0,
      clickArray: []
    }

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

      HomageFactory.getTotalCount(uuid, function(totalObj) {
        totalObj.$bindTo($scope, 'data.clickCount');
      });

      $scope.updateClicksArray();

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

      if($scope.data.choice === 'month') {
        $scope.updateClicksArray(moment().subtract(30, 'day'), moment());
      } else {
        $scope.updateClicksArray();
      }
    };

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

      HomageFactory.getClicks(uuid, startDate, endDate, function(clickObj) { // wait for the device uuid to prevent null result
        console.log('result', clickObj);

        clickObj.$loaded().then(function(){
          $scope.data.clickArray = [];

          console.log('THis changed..', $scope.data.clickArray);
          //extract the data
          for(var i in clickObj) {

            // found = $filter('filter')($scope.data.clickArray, {'$id': clickObj[i]['$id']}, true);

            if(typeof clickObj[i] !== 'function') {
              // if($scope.data.clickArray.length < clickObj.length && found.length === 0) {
                $scope.data.clickArray.push(clickObj[i]);
              // }
            }
          }

          // $scope.data.clickArray = $filter('orderBy')($scope.clickArray, '$id');
        });
      });
    }

    $scope.slideHasChanged = function(index) {
      $ionicSlideBoxDelegate.slide(index, 500);
    }

  }]);
