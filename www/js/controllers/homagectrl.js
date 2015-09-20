app
  .controller('HomageCtrl', function($scope, HomageFactory) {

    $scope.shout = '';

    var index = 0;

    HomageFactory.getAllResponses().success(function(data) {
      $scope.responsedata = data;
    });

    $scope.displayResponse = function() {
      index = Math.floor(Math.random() * $scope.responsedata.responses.length);
      $scope.shout = $scope.responsedata.responses[index];
    };

    $scope.buttonClick = function() {
      var data = {
        userId: 3,
        count: 1,
        date: moment().format('MM-DD-YYYY')
      }

      data['dbId'] = HomageFactory.hasUserRecord(data.userId);

      HomageFactory.setClickCount(data);
      $scope.displayResponse();
    };
  });