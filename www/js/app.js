
angular.module('homage', ['ionic', 'firebase', 'restangular'])

.run(function($rootScope, Restangular) {
  $rootScope.baseUrl = 'https://homage.firebaseio.com/';
  $rootScope.firebaseUrl = new Firebase($rootScope.baseUrl);
  $rootScope.clickers = $rootScope.firebaseUrl.child('clickers');
  Restangular.baseUrl = $rootScope.baseUrl;
})

.controller('HomageCtrl', function($scope, HomageFactory) {
  $scope.counter = 0;
  $scope.today = moment().format('MM-DD-YYYY');
  $scope.shout = '';

  var index = 0;

  HomageFactory.getAllResponses().success(function(data) {
    console.log('data is', data);
    $scope.responsedata = data;
  });

  $scope.displayResponse = function() {
    console.log('responsedata', $scope.responsedata.responses);
    index = Math.floor(Math.random() * $scope.responsedata.responses.length);
    $scope.shout = $scope.responsedata.responses[index];
  };

  $scope.buttonClick = function() {
    $scope.counter++;
    console.log('i am clicked', $scope.counter);
    console.log('today is', $scope.today);
    var data = {
      userId: 1,
      date: $scope.today,
      count: $scope.counter
    }
    HomageFactory.setClickCount(data);
    $scope.displayResponse();
  };
})

.factory('HomageFactory', function($rootScope, $http, Restangular) {
  return {
    getAllResponses: function() {
      return $http.get('/data/responses.data.json');
    },
    setClickCount: function(click) {
      var userKey = 'user-' + click.userId,
          thisClick = {};
      thisClick[click.date] = {};

      // check if date today is logged in db
      $rootScope.clickers.child(click.date).once('value', function(snapshot){
        if(snapshot.val() === null) {
          console.log('snapshot', snapshot.val());
          thisClick[click.date][userKey] = { count: click.count };
        } else {
          var userRecord = snapshot.val()[userKey],
              totalCount = click.count;

          // check if userId is logged under date today
          if (userRecord) {
            totalCount += userRecord.count;
          }

          thisClick[click.date][userKey] = { count: totalCount };
        }

        // log to db
        $rootScope.clickers.set(thisClick);
      });
    }
  };
});
