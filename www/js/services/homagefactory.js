app
  .factory('HomageFactory', ['$firebaseArray', '$firebaseObject', '$http', 'FIREBASE_URL', 'Restangular', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL),
        clickers = $firebaseArray(ref.child('clickerz'));

    Restangular.baseUrl = FIREBASE_URL;

    return {
      hasUserRecord: function(userId, data) { // checks if the userId is in the db
        if(data) {
          clickers = data;
        }

        var record = clickers.filter(function(value) {
          return value.hasOwnProperty(userId);
        });
        return (!record.length) ? null : record[0].$id;
      },
      getAllResponses: function() { // used in $scope.shout to show some response, returns a promise
        return $http.get('data/responses.data.json');
      },
      getAllClicks: function(userId, callback) { // get all the data on clicks of current user
        var self = this;
        console.log('Getting all clicks', userId);
        var clickObj = $firebaseObject(ref.child('clickerz/'+userId));
        return callback(clickObj);
      },
      createNewUser: function(uuid){
        var obj = ref.child('clickerz/'+uuid)
        obj.set({
          clicks: [
          ],
          name: uuid
        });
      },
      setClickCount: function(uuid, dateString, value){
        console.log(uuid, dateString, value);
        var obj = ref.child('clickerz/'+uuid+'/clicks/'+dateString);
        obj.set(value, function(){
          console.log('Done setting to database');
        });
      },
      getClicks: function(uuid, max, callback){
        var obj = ref.child('clickerz/'+uuid+'/clicks').orderByKey().limitToFirst(max);
        var clickArray = $firebaseArray(obj);
        return callback(clickArray);
      }
      // setClickCount: function(click) { // function when 'Click Me!' button is clicked
      //   var userRecord = null,
      //       userRecordKeys = [],
      //       savedNew = false,
      //       lastKey = '';
      //
      //   console.log('inside setClickCount:', click);
      //
      //   if(click.dbId) { // it has a dbId when the userId is has data in db
      //     userRecord = clickers.$getRecord(click.dbId);
      //     userRecordKeys = Object.keys(userRecord[click.userId]);
      //     lastKey = userRecordKeys[userRecordKeys.length-1];
      //
      //     angular.forEach(userRecord[click.userId], function(record, key){ // iterate over user logged days
      //       if(record.date === click.date){
      //         record.count += click.count;
      //         clickers.$save(userRecord);
      //
      //         if(lastKey === key) savedNew = true; // count updated for date today
      //       }
      //     });
      //
      //     if(!savedNew) { // date today is not logged in db
      //       var user = $firebaseArray(ref.child('clickerz').child(click.dbId).child(click.userId));
      //       user.$add({
      //         date: click.date,
      //         count: click.count
      //       });
      //       clickers.$save(user);
      //     }
      //
      //   } else { // save new userId to db
      //     console.log('new id??');
      //     clickers.$add(click.userId).then(function(ref) {
      //       var key = $firebaseArray(ref.child(click.userId));
      //       key.$add({
      //         date: click.date,
      //         count: click.count
      //       });
      //     });
      //   }
      // }
    };
  }]);
