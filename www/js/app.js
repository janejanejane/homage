
angular.module( 'homage', [ 'ionic', 'ngCordova', 'firebase' ])

// // https://github.com/angular/material/issues/1406
// // did not resolve: https://github.com/angular/material/issues/2365
// .config(function( $mdGestureProvider, $mdThemingProvider ) {
//     'use strict';
//
//     $mdGestureProvider.skipClickHijack();
//     $mdThemingProvider.theme( 'assertive' );
//     $mdThemingProvider.theme( 'energized' );
// })
.run(function( $ionicPlatform ) {
    // .run(function($ionicPlatform, $ionicPopup, TimerFactory) {
    'use strict';

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if ( window.cordova && window.cordova.plugins.Keyboard ) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar( true );
        }
        if ( window.StatusBar ) {
            StatusBar.styleDefault();
        }
    });

  // $ionicPlatform.onHardwareBackButton(function () {
  //   $ionicPopup.confirm({
  //     title: 'Closing app',
  //     template: 'Are you sure you want to exit?'
  //   }).then(function(res){
  //     if(res) {
  //       TimerFactory.stopTime();
  //       // closes the app
  //       ionic.Platform.exitApp();
  //     }
  //   });
  // });

  // // $ionicPlatform.on('resume', function() {
  // //   // the native platform pulls the application out from the background
  // // });

  // // $ionicPlatform.on('pause', function() {
  // //   // the native platform puts the application into the background
  // //   TimerFactory.stopTime();
  // // });
}).constant( 'CONSTANTS', {
    FIREBASE_URL: 'https://homage.firebaseio.com/',
    FIREBASE_DB: 'clickerz',
    AVATAR_DIR: 'girls',
    AVATAR_FNAME: 'avatar-f-small'
});
