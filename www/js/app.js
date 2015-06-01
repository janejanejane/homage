
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
  $scope.responses = HomageFactory.getAllResponses();
  $scope.shout = '';

  $scope.buttonClick = function() {
    $scope.counter++;
    console.log('i am clicked', $scope.counter);
    console.log('today is', $scope.today);
    var data = {
      date: $scope.today,
      count: $scope.counter
    }
    HomageFactory.setClickCount(data);
    $scope.displayResponse();
  };

  $scope.displayResponse = function() {
    console.log('responses', $scope.responses);
    $scope.shout = '';
  };
})

.factory('HomageFactory', function($rootScope, $http, Restangular) {
  return {
    getAllResponses: function() {
      $http.get('/data/responses.data.json').success(function(data) {
        console.log('data is', data);
        return data.responses;
      });
    },
    setClickCount: function(click) {
      $rootScope.clickers.child(click.date)
        .once('value', function(snapshot) {
          $rootScope.clickers.set({
            date: click.date,
            count: click.count
          })
        });
    }
  };
});
