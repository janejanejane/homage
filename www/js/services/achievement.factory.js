app
	.factory('AchievementFactory', ['$firebaseArray', '$http', 'FIREBASE_URL', function($firebaseArray, $http, FIREBASE_URL) {

		var ref = new Firebase(FIREBASE_URL),
			achievementsDeclared = [],
			achievementsArray = [];

		$http.get('data/achievements.data.json').then(function(response) {
			achievementsDeclared = response.data.achievements;
		});

		return {
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
				var obj = ref.child('clickerz/'+uuid+'/achievements');
				return $firebaseArray(obj);
			},
			setAchievementData: function(uuid, total, callback) {
				var data = {
						'aName': null,
						'achievement': null
					},
					self = this;

				self.getAllAchievements(uuid).$loaded().then(function(achievementObj) {
					achievementObj.forEach(function(data) {
						achievementsArray.push(data.name);
					});

					for (var i = 0; i < achievementsDeclared.length; i++) {
						if(achievementsDeclared[i].clicks <= total) {
							// set achievement data
							data['aName'] = achievementsDeclared[i].name;
							data['achievement'] = achievementsDeclared[i].description;

							if(achievementsArray.indexOf(achievementsDeclared[i].name) === -1) { // add when not in db
								self.onUnlocked(uuid, data.aName, data.achievement, callback);
							}
						}
					};
				});
			}
		};
	}]);