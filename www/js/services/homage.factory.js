app
  .factory('HomageFactory', ['$firebaseArray', '$firebaseObject', '$http', 'CONSTANTS', 'AchievementFactory', function($firebaseArray, $firebaseObject, $http, CONSTANTS, AchievementFactory) {
    var ref = new Firebase(CONSTANTS.FIREBASE_URL),
        db = CONSTANTS.FIREBASE_DB;

    return {
      getAllClicks: function(userId, callback) { // get all the data on clicks of current user
        var self = this;
        var clickObj = $firebaseObject(ref.child(db+'/'+userId));
        return callback(clickObj);
      },
      getTotalCount: function(uuid, callback) { // get the totalCount to show in client
        var totalObj = $firebaseObject(ref.child(db+'/'+uuid+'/totalCount'));
        return callback(totalObj);
      },
      getClicks: function(uuid, start, end, callback){ // get paginated clicks
        var obj = ref.child(db+'/'+uuid+'/clicks')
                      .orderByKey()
                      .startAt(start.format('MM-DD-YYYY').toString())
                      .endAt(end.format('MM-DD-YYYY').toString()),
            clickArray = $firebaseArray(obj);
        return callback(clickArray);
      },
      createNewUser: function(uuid){
        var obj = ref.child(db+'/'+uuid); // automatically creates user node if no record yet
        obj.set({
          clicks: [],
          name: uuid,
          totalCount: 0,
          achievements: [],
          longest50streak: 0
        });
      },
      setClickCount: function(uuid, dateString, value, unlockedAchievements, callback){
        var obj = ref.child(db+'/'+uuid+'/clicks/'+dateString);
        obj.set(value, function(){
          console.log('Done setting to database');
        });
        this.setTotalCount(uuid, unlockedAchievements, callback);
      },
      setTotalCount: function(uuid, unlockedAchievements, callback) {
        var obj = ref.child(db+'/'+uuid+'/totalCount'),
            total = 0,
            self = this;

        obj.once('value', function(snapshot) {
          // check if totalCount contains data
          if(snapshot.exists()) {
            obj.once('value', function(snap) { // get totalCount property and update
              total = snap.val() + 1;
            });
            obj.set(total);
            AchievementFactory.setAchievementClick(uuid, total, unlockedAchievements, callback);
          } else {
            self.getAllClicks(uuid, function(record) { // iterate through all records then update totalCount
              record.$loaded().then(function() {
                for(var i in record.clicks) {
                  total += record.clicks[i];
                }
                obj.set(total);
                AchievementFactory.setAchievementClick(uuid, total, unlockedAchievements, callback);
              });
            });
          }
        });
      },
      setStreak: function(uuid, unlockedAchievements, callback) {
        var obj = ref.child(db+'/'+uuid+'/longest50streak'),
            streak = 0,
            self = this;

        obj.once('value', function(snapshot) {
          // check if longest50streak contains data
          if(snapshot.exists()) {
            // get click record from yesterday
            var yesterday = moment().subtract(1, 'day');

            self.getClicks(uuid, yesterday, yesterday, function(response) {
              response.$loaded().then(function() {
                // if yesterday has more than 50 clicks, there will be data
                if(response.length === 1 && response[0].$value > 50) {
                  obj.once('value', function(snap) { // get longest50streak property and update
                    streak = snap.val() + 1;
                  });

                  // set streak to incremented value @line: 97
                } else {
                  // set streak back to zero
                  streak = 0;
                }

                obj.set(streak);
                AchievementFactory.setAchievementStreak(uuid, streak, unlockedAchievements, callback);
              });
            });
          } else {
            self.getAllClicks(uuid, function(record) {
              record.$loaded().then(function() {
                // initialize array to prevent undefined when setting property
                var array = [],
                    streak = 0,
                    streakData = [];

                // get all dates with more than 50 clicks
                _.filter(record.clicks, function(val, key) {
                  if (val > 50) return array[key] = val;
                });

                // extract keys only
                var keys = _.keys(array);

                for(var i = 0; i < keys.length; i++) {
                  // proceed to check when there is plus 1 to current index
                  if(keys[i+1]) {
                    // check if current index date value (keys[i]) plus 1 day is equal to the next date value (keys[i+1])
                    if(moment(keys[i]).add(1, 'day').format('MM-DD-YYYY') === keys[i+1]) {
                      streak += 1; // iterate streak
                    } else {
                      if(streak > 0) { // only store data when more than zero
                        streakData.push(streak); // push streak data
                      }
                      streak = 0; // revert to zero
                    }
                  }
                }

                // set longest50streak value
                streak = _.max(streakData);
                obj.set(streak);
                AchievementFactory.setAchievementStreak(uuid, streak, unlockedAchievements, callback);
              });
            });
          }
        });
      }
    };
  }]);
