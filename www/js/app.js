
angular.module('homage', ['ionic'])

.controller('HomageCtrl', function($scope) {
  $scope.counter = 0;

  $scope.buttonClick = function() {
    $scope.counter++;
    console.log('i am clicked', $scope.counter);
  };
});