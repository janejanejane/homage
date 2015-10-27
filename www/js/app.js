
var app = angular.module('homage', [
  'ionic',
  'ngMaterial',
  'ngCordova',
  'firebase',
  'restangular'
  ])

// https://github.com/angular/material/issues/1406
// did not resolve: https://github.com/angular/material/issues/2365
.config(function( $mdGestureProvider ) {
  $mdGestureProvider.skipClickHijack();
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.constant('FIREBASE_URL', 'https://homage.firebaseio.com/');
