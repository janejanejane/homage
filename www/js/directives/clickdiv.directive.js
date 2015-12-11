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
                clicksToLevelUp: '=',
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

                    scope.clicksToGo = scope.clicksToLevelUp - scope.totalClicks;
                });

                scope.$watch( 'totalClicks', function( val ) {
                    scope.clicksToGo = scope.clicksToLevelUp - val;

                    if ( scope.clicksToGo === 0) {
                        scope.clicksToGo = scope.clicksToLevelUp;
                    }
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
                    '<h6 ng-show="totalClicks > 0">' +
                        '<ng-pluralize count="clicksToGo"' +
                                        'when="{\'1\': \'{{clicksToGo}} more click to level up!\',' +
                                               '\'other\': \'{{clicksToGo}} clicks to level up!\'}">' +
                        '</ng-pluralize>' +
                    '</h6>' +
                '</div>'
        };
    }
})();
