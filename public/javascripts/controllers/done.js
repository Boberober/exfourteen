app.controller('DoneCtrl', function ($scope, $http, Facebook, $location, userData) {
    $scope.user = userData.getUser();
    $scope.fbUrl = userData.getUrl();
});