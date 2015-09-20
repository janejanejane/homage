
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
        userId: 2,
        count: $scope.counter,
        date: moment().format('MM-DD-YYYY')
      }

      data['dbId'] = HomageFactory.hasUserRecord(data.userId);

      HomageFactory.setClickCount(data);
      $scope.displayResponse();
    };
  })
  .factory('HomageFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickerz')),
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
      hasUserRecord: function(userId) {
        var record = clickers.filter(function(value) { 
          return value.hasOwnProperty(userId); 
        });
        return (!record.length) ? null : record[0].$id; 
      },
      getAllResponses: function() {
        return $http.get('/data/responses.data.json');
      },
      setClickCount: function(click) {
        var userRecord = null;

        if(click.dbId) {
          userRecord = clickers.$getRecord(click.dbId);
          console.log('This is date today', userRecord);
          angular.forEach(userRecord[click.userId], function(record){
            console.log('User count?',record);
            if(record.date === click.date){
              record.count = click.count;
              clickers.$save(userRecord);
            }
          });

        } else {
          console.log('Else what is click', click);
          clickers.$add(click.userId).then(function(ref) {
            var key = $firebaseArray(ref.child(click.userId));
            key.$add({
              date: click.date,
              count: click.count
            });
          });
        }

        console.log('setClickCount:',dates);
      }
    };
  });
