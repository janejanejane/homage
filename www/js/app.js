
angular.module( 'homage', [ 'ionic', 'ngCordova', 'firebase' ])

.run(function( $ionicPlatform ) {
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
}).constant( 'CONSTANTS', {
    FIREBASE_URL: 'https://homage.firebaseio.com/',
    FIREBASE_DB: 'clickerz',
    AVATAR_DIR: 'girls',
    AVATAR_FNAME: 'avatar-f-small'
});
