app.factory('TimerFactory', ['$interval', function ($interval) {
    'use strict';

    var timerObj = null;
    var TimerFactory = {
        timerObj,
        startTime: function (fn) {
            // do function in 10 seconds
            timerObj = $interval(fn, 10000);
        },
        stopTime: function () {
            console.log(timerObj.length);
            if (timerObj.length) {
                $interval.cancel(timerObj);
            }
        }
    };

    return TimerFactory;
}]);