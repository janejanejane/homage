
var app = angular.module('homage', [
  'ionic', 
  'firebase', 
  'restangular'
  ])
  .constant('FIREBASE_URL', 'https://homage.firebaseio.com/');