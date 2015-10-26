app
  .factory('HomageFactory', ['$firebaseArray', '$firebaseObject', '$http', 'FIREBASE_URL', 'Restangular', 'AchievementFactory', function($firebaseArray, $firebaseObject, $http, FIREBASE_URL, Restangular, AchievementFactory) {
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
      },
      createNewUser: function(uuid){
        var obj = ref.child('clickerz/'+uuid); // automatically creates user node if no record yet
        obj.set({
          clicks: [],
          name: uuid,
          totalCount: 0,
          achievements: []
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
          this.setAchievementData(uuid, total);
        } else {
          var self = this;
          this.getAllClicks(uuid, function(record) { // iterate through all records then update totalCount
            record.$loaded().then(function() {
              for(var i in record.clicks) {
                total += record.clicks[i];
              }
              obj.set(total);
              self.setAchievementData(uuid, total);
            });
          });
        }
      },
      setAchievementData: function(uuid, total) {
        // check totalCount value for achievements
        switch (total) {
          case 5:
            AchievementFactory.onUnlocked(uuid, '5_clicks', '5 clicks!');
            break;
          case 10:
            AchievementFactory.onUnlocked(uuid, '10_clicks', '10 clicks!');
            break;
          case 20:
            AchievementFactory.onUnlocked(uuid, '20_clicks', '20 clicks!');
            break;
          case 50:
            AchievementFactory.onUnlocked(uuid, '50_clicks', '50 clicks!');
            break;
          case 100:
            AchievementFactory.onUnlocked(uuid, '100_clicks', '100 clicks!');
            break;
          case 250:
            AchievementFactory.onUnlocked(uuid, '250_clicks', '250 clicks!');
            break;
          case 500:
            AchievementFactory.onUnlocked(uuid, '500_clicks', '500 clicks!');
            break;
          case 1000:
            AchievementFactory.onUnlocked(uuid, '1000_clicks', '1000 clicks!');
            break;
          case 1500:
            AchievementFactory.onUnlocked(uuid, '1500_clicks', '1500 clicks!');
            break;
          case 2000:
            AchievementFactory.onUnlocked(uuid, '2000_clicks', '2000 clicks!');
            break;
          case 5000:
            AchievementFactory.onUnlocked(uuid, '5000_clicks', '5000 clicks!');
            break;
          default:
            break;
        }
      }
    };
  }]);
