app
	.factory('AchievementFactory', ['$firebaseArray', '$http', 'CONSTANTS', function($firebaseArray, $http, CONSTANTS) {

		var ref = new Firebase(CONSTANTS.FIREBASE_URL),
			db = CONSTANTS.FIREBASE_DB,
			achievementsDeclared = [];

		var AchievementFactory = {
			onUnlocked: function(uuid, aName, achievement, unlockedAchievements, callback) {
				var aObj = {
						name: aName,
						description: achievement
					};

				if(aName && achievement) {
					unlockedAchievements.$add(aObj).then(function(ref) {
						console.log('AchievementFactory>>', aObj);
						callback({
							id: ref.key(),
							achievement: achievement
						});
					});
				}
			},
			getAllAchievements: function(uuid) {
				var obj = ref.child(db+'/'+uuid+'/achievements');
				return $firebaseArray(obj);
			},
			setAchievementData: function(uuid, arr, aName, achievement, callback) {
				// add when not in db
				if(_.pluck(arr, 'name').indexOf(aName) === -1) {
					this.onUnlocked(uuid, aName, achievement, arr, callback);
				}
			},
			getAchievementsDeclared: function() {
				return $http.get('data/achievements.data.json');
			},
			setAchievementClick: function(uuid, total, unlockedAchievements, callback) {
				for (var i = 0; i < achievementsDeclared.length; i++) {
					if(achievementsDeclared[i].clicks <= total) {
						// set achievement data
						this.setAchievementData(uuid, unlockedAchievements, achievementsDeclared[i].name, achievementsDeclared[i].description, callback);
					}
				}
			},
			getAchievementStreak: function(callback) {
				var arr = [];

				achievementsDeclared.forEach(function(data, index, array) {
					// store only the streaks numbers
					if(data.streak) arr.push(data);

					// return on last item
					if(index === array.length - 1) return callback(arr);
				});
			},
			setAchievementStreak: function(uuid, streak, unlockedAchievements, callback) {
				var self = this;

				this.getAchievementStreak(function(records) {
					for (var i = 0; i < records.length; i++) {
						if(records[i].streak === streak) {
							// set achievement data
							self.setAchievementData(uuid, unlockedAchievements, records[i].name, records[i].description, callback);
						}
					};
				});
			}
		};

		AchievementFactory.getAchievementsDeclared().then(function(response) {
			achievementsDeclared = response.data.achievements;
		});

		return AchievementFactory;
	}]);