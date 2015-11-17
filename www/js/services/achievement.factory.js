app
	.factory('AchievementFactory', ['$firebaseArray', '$http', 'CONSTANTS', function($firebaseArray, $http, CONSTANTS) {

		var ref = new Firebase(CONSTANTS.FIREBASE_URL),
			db = CONSTANTS.FIREBASE_DB,
			achievementsDeclared = [],
			achievementsArray = [];

		var AchievementFactory = {
			onUnlocked: function(uuid, aName, achievement, callback) {
				var aObj = {
						name: aName,
						description: achievement
					};
				achievementsArray = this.getAllAchievements(uuid);

				if(aName && achievement) {
					achievementsArray.$add(aObj).then(function(ref) {
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
			getAchievementsDeclared: function() {
				return $http.get('data/achievements.data.json');
			},
			setAchievementClick: function(uuid, total, callback) {
				var data = {
						'aName': null,
						'achievement': null
					},
					self = this,
					arr = [];

				self.getAllAchievements(uuid).$loaded().then(function(achievementObj) {
					achievementObj.forEach(function(data) {
						arr.push(data.name);
					});

					for (var i = 0; i < achievementsDeclared.length; i++) {
						if(achievementsDeclared[i].clicks <= total) {
							// set achievement data
							data['aName'] = achievementsDeclared[i].name;
							data['achievement'] = achievementsDeclared[i].description;

							if(arr.indexOf(achievementsDeclared[i].name) === -1) { // add when not in db
								self.onUnlocked(uuid, data.aName, data.achievement, callback);
							}
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