
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
      console.log('data is', data);
      $scope.responsedata = data;
    });

    $scope.displayResponse = function() {
      console.log('responsedata', $scope.responsedata.responses);
      index = Math.floor(Math.random() * $scope.responsedata.responses.length);
      $scope.shout = $scope.responsedata.responses[index];
    };

    $scope.buttonClick = function() {
      $scope.counter++;
      console.log('i am clicked', $scope.counter);
      console.log('today is', $scope.today);
      var data = {
        userId: 1,
        date: $scope.today,
        count: $scope.counter
      }
      HomageFactory.setClickCount(data);
      $scope.displayResponse();
    };
  })
  .factory('HomageFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickers'));
    Restangular.baseUrl = FIREBASE_URL;

    return {
      getAllResponses: function() {
        return $http.get('/data/responses.data.json');
      },
      setClickCount: function(click) {
        var userKey = 'user-' + click.userId,
            thisClick = {},
            clickersList = [];
        thisClick[click.date] = {};
        thisClick[click.date][userKey] = { count: click.count };
        // clickers.$add(thisClick);

        ref.child('clickers').on('value', function(snapshot) {
          clickersList = snapshot.val() || [];
        });

        if(!clickersList.length) {
          clickersList.push(thisClick);
        } else {
          for(var i in clickersList) {
            for(var j in clickersList[i]) {
              if(j === click.date && userKey in clickersList[i][j]) {
                console.log(clickersList[i][j]['count']);
              }
            }
          }
        }

        console.log('clickersList' + clickersList);
        ref.child('clickers').set(clickersList);

        // check if date today is logged in db
        // $scope.clickers.child(click.date).once('value', function(snapshot){
        //   if(snapshot.val() === null) {
        //     console.log('snapshot', snapshot.val());
        //     thisClick[click.date][userKey] = { count: click.count };
        //   } else {
        //     var userRecord = snapshot.val()[userKey],
        //         totalCount = click.count;

        //     // check if userId is logged under date today
        //     if (userRecord) {
        //       totalCount += userRecord.count;
        //     }

        //     thisClick[click.date][userKey] = { count: totalCount };
        //   }

        //   // log to db
        //   $scope.clickers.set(thisClick);
        // });
      }
    };
  });
