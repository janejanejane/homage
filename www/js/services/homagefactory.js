app
  .factory('HomageFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickerz'));

    Restangular.baseUrl = FIREBASE_URL;

    return {
      hasUserRecord: function(userId) { // checks if the userId is in the db
        var record = clickers.filter(function(value) { 
          return value.hasOwnProperty(userId); 
        });
        return (!record.length) ? null : record[0].$id; 
      },
      getAllResponses: function() { // used in $scope.shout to show some response
        return $http.get('data/responses.data.json');
      },
      setClickCount: function(click) { // function when 'Click Me!' button is clicked
        var userRecord = null,
            userRecordKeys = [],
            savedNew = false,
            lastKey = '';

        console.log('inside setClickCount:', click);

        if(click.dbId) { // it has a dbId when the userId is has data in db
          userRecord = clickers.$getRecord(click.dbId);
          userRecordKeys = Object.keys(userRecord[click.userId]);
          lastKey = userRecordKeys[userRecordKeys.length-1];

          angular.forEach(userRecord[click.userId], function(record, key){ // iterate over user logged days
            if(record.date === click.date){
              record.count += click.count;
              clickers.$save(userRecord);

              if(lastKey === key) savedNew = true; // count updated for date today
            }
          });

          if(!savedNew) { // date today is not logged in db
            var user = $firebaseArray(ref.child('clickerz').child(click.dbId).child(click.userId));
            user.$add({
              date: click.date,
              count: click.count
            });
            clickers.$save(user);
          }

        } else { // save new userId to db
          console.log('new id??');
          clickers.$add(click.userId).then(function(ref) {
            var key = $firebaseArray(ref.child(click.userId));
            key.$add({
              date: click.date,
              count: click.count
            });
          });
        }
      }
    };
  });
