app
  .factory('HomageFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickerz')),
        dates = [],
        todayLogged = null;
    Restangular.baseUrl = FIREBASE_URL;

    return {
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
              record.count += click.count;
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
