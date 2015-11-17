app
	.factory('AvatarFactory', ['$firebaseArray', '$http', 'CONSTANTS', function($firebaseArray, $http, CONSTANTS) {

		var ref = new Firebase(CONSTANTS.FIREBASE_URL),
			db = CONSTANTS.FIREBASE_DB;

		var AvatarFactory = {
			getAvatarNames: function() {
				return $http.get('data/avatars.data.json');
			}
		};

		return AvatarFactory;
	}]);