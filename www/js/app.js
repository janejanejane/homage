
var app = angular.module('homage', [
  'ionic', 
  'ngCordova',
  'firebase', 
  'restangular'
  ])
  .constant('FIREBASE_URL', 'https://homage.firebaseio.com/');