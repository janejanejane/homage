app
	.factory('AchievementFactory', ['$firebaseArray', 'FIREBASE_URL', function($firebaseArray, FIREBASE_URL) {

		var ref = new Firebase(FIREBASE_URL);

		return {
			onUnlocked: function(uuid, aName, achievement) {
        		var obj = ref.child('clickerz/'+uuid+'/achievements'),
        			achievementsArray = $firebaseArray(obj),
        			aObj = {
        				name: aName,
        				description: achievement
        			};

				achievementsArray.$add(aObj).then(function() {
					console.log('AchievementFactory>>', aObj);
				});
			}
		};
	}]);