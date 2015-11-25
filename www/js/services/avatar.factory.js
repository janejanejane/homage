app.factory('AvatarFactory', ['$http', function ($http) {
    'use strict';

    var AvatarFactory = {
        getAvatarNames: function () {
            return $http.get('data/avatars.data.json');
        }
    };

    return AvatarFactory;
}]);