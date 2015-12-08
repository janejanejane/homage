(function() {
    angular
        .module( 'homage' )
        .directive( 'clickDiv', [ ClickDiv ]);

    function ClickDiv() {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            scope: {
                avatarLoc: '=',
                currentLevel: '=',
                totalClicks: '=',
                buttonClick: '&'
            },
            link: function( scope ) {
                scope.touchDown = false;

                scope.onTouch = function() {
                    scope.touchDown = true;
                };

                scope.onRelease = function() {
                    scope.touchDown = false;
                    scope.buttonClick();
                };

                scope.$watch( 'currentLevel', function() {
                    // if level is less 10, prefix image filename with '0'
                    var imageFilename = ( ( scope.currentLevel < 10 ) ? '0' + scope.currentLevel
                                                                      : scope.currentLevel);

                    scope.currentImg = 'img/' + scope.avatarLoc + '-' + imageFilename + '.png';
                });

                scope.$watch( 'totalClicks', function( val ) {
                    // Math.floor(Math.pow(Math.E,Math.log(val)))
                    var nextLevel = Math.floor( Math.log( val ) / Math.LN2 ) + 1;

                    if ( nextLevel > 0 ) {
                        console.log( Math.floor( Math.pow( Math.E, Math.log( val ) + 0.5 ) ) );
                    }

                    return Math.floor( scope.clicksToGo );
                });
            },
            template:
                '<div>' +
                    '<img class="item-image"' +
                        'on-touch="onTouch()"' +
                        'on-release="onRelease()"' +
                        'ng-class="{held: touchDown}"' +
                        'ng-src="{{currentImg}}" >' +
                    '<h1>Lvl {{currentLevel}}</h1>' +
                    '<h6 ng-show="currentLevel > 0">{{clicksToGo}} _ clicks to go!</h6>' +
                '</div>'
        };
    }
})();
