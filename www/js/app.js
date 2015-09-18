
angular.module('homage', [
  'ionic', 
  'firebase', 
  'restangular'
  ])
  .constant('FIREBASE_URL', 'https://homage.firebaseio.com/')
  .controller('HomageCtrl', function($scope, HomageFactory) {
    $scope.counter = 0;
    $scope.today = moment().format('MM-DD-YYYY');
    $scope.shout = '';

    var index = 0;

    HomageFactory.getAllResponses().success(function(data) {
      $scope.responsedata = data;
    });

    $scope.displayResponse = function() {
      index = Math.floor(Math.random() * $scope.responsedata.responses.length);
      $scope.shout = $scope.responsedata.responses[index];
    };

    $scope.buttonClick = function() {
      $scope.counter++;
      var data = {
        userId: 1,
        count: $scope.counter,
        date: moment().format('MM-DD-YYYY')
      }

      data['dbId'] = HomageFactory.hasDateToday();

      HomageFactory.setClickCount(data);
      $scope.displayResponse();
    };
  })
  .factory('HomageFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickers')),
        dates = [],
        todayLogged = null;
    Restangular.baseUrl = FIREBASE_URL;

    return {
      hasDateToday: function() {  
        var record = clickers.filter(function(value) { 
          return value.hasOwnProperty(moment().format('MM-DD-YYYY')) 
        });
        return (!record.length) ? null : record[0].$id; 
      },
      getAllResponses: function() {
        return $http.get('/data/responses.data.json');
      },
      setClickCount: function(click) {
        var dateToday = null;

        if(click.dbId) {
          dateToday = clickers.$getRecord(click.dbId);
          console.log(dateToday);
          dateToday.$loaded(function(){
            angular.forEach(dateToday, function(user) {
              console.log(user);
            })

            if(dateToday.userId === click.userId) {
              dateToday.count = click.count;
              dateToday.$save();
            }
          });
        } else {
          clickers.$add(click.date).then(function(ref) {
            var key = $firebaseArray(ref.child(click.date));
            key.$add({
              count: click.count,
              userId: click.userId
            });
          });
        }

        console.log(dates);
      }
    };
  });
