app
  .factory('HomageFactory', ['$firebaseArray', '$firebaseObject', '$http', 'FIREBASE_URL', 'Restangular', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular) {
    var ref = new Firebase(FIREBASE_URL);

    Restangular.baseUrl = FIREBASE_URL;

    return {
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
        var obj = ref.child('clickerz/'+uuid); // automatically creates user node if no record yet
        obj.set({
          clicks: [],
          name: uuid,
          totalCount: 0
        });
      },
      setClickCount: function(uuid, dateString, value){
        var obj = ref.child('clickerz/'+uuid+'/clicks/'+dateString);
        obj.set(value, function(){
          console.log('Done setting to database');
        });
        this.setTotalCount(uuid, value);
      },
      setTotalCount: function(uuid, value) {
        var obj = ref.child('clickerz/'+uuid+'/totalCount'),
            total = 0;

        if(!obj) {
          obj.on('value', function(snap) { // get totalCount property and update
            total = snap.val() + value;
          });
          obj.set(total);
        } else {
          this.getAllClicks(uuid, function(record) { // iterate through all records then update totalCount
            record.$loaded().then(function() {
              for(var i in record.clicks) {
                total += record.clicks[i];
              }
              obj.set(total);
            });
          });
        }
      },
      getTotalCount: function(uuid, callback) { // get the totalCount to show in client
        var totalObj = $firebaseObject(ref.child('clickerz/'+uuid+'/totalCount'));
        return callback(totalObj);
      },
      getClicks: function(uuid, start, end, callback){ // get paginated clicks
        var obj = ref.child('clickerz/'+uuid+'/clicks')
                      .orderByKey()
                      .startAt(start.format('MM-DD-YYYY').toString())
                      .endAt(end.format('MM-DD-YYYY').toString()),
            clickArray = $firebaseArray(obj);
        return callback(clickArray);
      }
    };
  }]);
